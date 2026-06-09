import os
import re
import json
import logging
import socket
from tqdm import tqdm
from typing import Tuple

# -----------------------
# Configuration
# -----------------------
TABLE = 'javascript'  # Change to 'javascript' if needed

host_name = socket.gethostname()
if host_name == 'sst-3':
    HOST = 'us1'
elif host_name == 'sst-4.if-is.net':
    HOST = 'us2'
elif host_name == 'sst-5.if-is.net':
    HOST = 'eu1'
elif host_name == 'sst-6.if-is.net':
    HOST = 'eu2'
else:
    # Fallback to a stable default to avoid NameError in unknown environments
    HOST = 'unknown'

ROWS_PER_FILE = 100000  # Maximum rows per split file

BASE_DIR = os.getcwd()
INPUT_FILE = os.path.join(BASE_DIR, 'extracet_tables', f'{HOST}_{TABLE}.ndjson')
OUTPUT_DIR = os.path.join(BASE_DIR, 'extracet_tables', f'{TABLE}')
STATE_FILE = os.path.join(OUTPUT_DIR, f'{HOST}_{TABLE}.__state__.json')
ROWLOG_FILE = os.path.join(OUTPUT_DIR, f'{HOST}_{TABLE}.__written_rows__.log')

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -----------------------
# Logging
# -----------------------
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(funcName)s - %(message)s')

fh = logging.FileHandler(os.path.join(OUTPUT_DIR, 'split_and_fix.log'))
fh.setFormatter(formatter)
fh.setLevel(logging.INFO)

sh = logging.StreamHandler()
sh.setFormatter(formatter)
sh.setLevel(logging.WARNING)

logger = logging.getLogger(__name__)
logger.addHandler(fh)
logger.addHandler(sh)
logger.setLevel(logging.INFO)
logger.propagate = False

logger.info("Starting NDJSON split and fix process")

# -----------------------
# Helper functions
# -----------------------
def batch_iterator(file_obj, batch_size, start_line: int = 0):
    """
    Yield lists of lines in batches of batch_size, starting after skipping start_line lines.
    """
    # Skip already processed lines
    for _ in range(start_line):
        if not file_obj.readline():
            return  # Reached EOF while skipping
    batch = []
    for line in file_obj:
        batch.append(line)
        if len(batch) >= batch_size:
            yield batch
            batch = []
    if batch:
        yield batch

def clean_entry(entry):
    """Fix an NDJSON/JSON entry if script_url, script_line, or script_col missing"""
    if not isinstance(entry, dict):
        return entry, False

    script_url = entry.get("script_url", "")
    script_line = entry.get("script_line", "")
    script_col = entry.get("script_col", "")
    func_name = entry.get("func_name", "")

    updated = False

    if not script_url and script_line and script_col:
        entry["script_url"] = f"{script_line}{script_col}"
        entry["script_line"] = ""
        entry["script_col"] = ""
        updated = True

    elif not script_url and not script_line and script_col and func_name:
        entry["script_url"] = f"{func_name}{script_col}"
        entry["script_col"] = ""
        entry["func_name"] = ""
        updated = True

    return entry, updated

def atomic_write_json(path: str, data: dict) -> None:
    """Write JSON atomically to avoid partial state in crashes."""
    tmp_path = path + ".tmp"
    with open(tmp_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp_path, path)

def parse_existing_parts() -> Tuple[int, int]:
    """
    Inspect OUTPUT_DIR for existing part files and count how many lines have already been written.
    Returns:
        next_file_index (int): the next part number to use (existing max + 1)
        processed_rows   (int): number of lines already transferred across all existing parts
    """
    part_re = re.compile(rf"^{re.escape(HOST)}_{re.escape(TABLE)}_part_(\d+)\.ndjson$")
    parts = []
    for name in os.listdir(OUTPUT_DIR):
        m = part_re.match(name)
        if m:
            parts.append((int(m.group(1)), os.path.join(OUTPUT_DIR, name)))
    if not parts:
        return 1, 0

    parts.sort(key=lambda t: t[0])
    next_file_index = parts[-1][0] + 1

    # Count lines across all existing parts to derive processed_rows
    processed = 0
    for _, path in parts:
        with open(path, 'r', encoding='utf-8') as f:
            for _ in f:
                processed += 1
    return next_file_index, processed

def load_or_init_state() -> Tuple[int, int]:
    """
    Load state file if present; otherwise derive from existing parts.
    Returns:
        next_file_index, processed_rows
    """
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                state = json.load(f)
            s_next_idx = int(state.get('next_file_index', 1))
            s_processed = int(state.get('processed_rows', 0))

            # Defensive: if directory files progressed further than state, trust the files
            f_next_idx, f_processed = parse_existing_parts()
            next_idx = max(s_next_idx, f_next_idx)
            processed = max(s_processed, f_processed)
            logger.info(f"Resuming from state file. processed_rows={processed}, next_file_index={next_idx}")
            return next_idx, processed
        except Exception as e:
            logger.warning(f"Failed to read state file, deriving from parts instead: {e}")

    next_idx, processed = parse_existing_parts()
    logger.info(f"No valid state file. Derived progress from parts: processed_rows={processed}, next_file_index={next_idx}")
    # Immediately persist the derived state so subsequent crashes have a checkpoint
    atomic_write_json(STATE_FILE, {"processed_rows": processed, "next_file_index": next_idx})
    return next_idx, processed

def persist_state(next_file_index: int, processed_rows: int) -> None:
    atomic_write_json(STATE_FILE, {
        "processed_rows": processed_rows,
        "next_file_index": next_file_index
    })

def next_available_file_index(start_idx: int) -> int:
    """
    Ensure we never overwrite an existing file (e.g., if files were added between runs).
    """
    idx = start_idx
    while True:
        candidate = os.path.join(OUTPUT_DIR, f"{HOST}_{TABLE}_part_{idx}.ndjson")
        if not os.path.exists(candidate):
            return idx
        idx += 1

# -----------------------
# Main process (restart-safe)
# -----------------------
def main():
    # Establish starting point (resume)
    file_index, already_processed_rows = load_or_init_state()
    # Extra guard against overwriting:
    file_index = next_available_file_index(file_index)

    # For tqdm: we’ll still iterate from the start but skip 'already_processed_rows' lines
    # so we can compute correct global row numbers as we go.
    global_row = already_processed_rows  # number of lines already transferred

    total_written_files_before = file_index - 1

    # Open a separate log for explicit per-row numbers (append-only, restart-safe)
    rowlog = open(ROWLOG_FILE, 'a', encoding='utf-8')

    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as infile:
            # Iterate in batches, starting after the processed rows
            for batch in tqdm(
                batch_iterator(infile, ROWS_PER_FILE, start_line=already_processed_rows),
                desc="Splitting & Fixing"
            ):
                fixed_batch = []
                updated_count = 0
                batch_row_numbers = []  # for logging the exact global row numbers written in this file

                for line in batch:
                    # We are about to process the next global row
                    global_row += 1  # convert to 1-based counting for human readability
                    if not line.strip():
                        # Even empty lines should count as consumed from the input stream,
                        # but they are not written—log that we skipped them
                        logger.info(f"Skipping empty line at global_row={global_row}")
                        continue
                    try:
                        entry = json.loads(line)
                    except json.JSONDecodeError as e:
                        logger.warning(f"Skipping invalid JSON at global_row={global_row}: {e}")
                        continue

                    # Only clean entries if the table is "javascript"
                    if TABLE == "javascript":
                        entry, updated = clean_entry(entry)
                        if updated:
                            updated_count += 1

                    fixed_batch.append(json.dumps(entry, ensure_ascii=False) + '\n')
                    batch_row_numbers.append(global_row)

                # If nothing to write (e.g., an entire batch skipped), continue safely
                if not fixed_batch:
                    logger.info("Batch produced no output rows; continuing.")
                    continue

                # Ensure we use an available next file index (avoid overwrite)
                file_index = next_available_file_index(file_index)
                output_path = os.path.join(OUTPUT_DIR, f"{HOST}_{TABLE}_part_{file_index}.ndjson")

                # Write the batch
                with open(output_path, 'x', encoding='utf-8') as outfile:  # 'x' fails if file exists
                    outfile.writelines(fixed_batch)

                # Per-file summary
                logger.info(
                    f"Wrote {len(fixed_batch)} rows to {output_path}"
                    + (f" (updated {updated_count} entries)" if TABLE == "javascript" else "")
                )

                # Log every row number that landed in this new file (one per line, append-only)
                # Format: "<part_index>\t<global_row_num>"
                for rnum in batch_row_numbers:
                    rowlog.write(f"{file_index}\t{rnum}\n")
                rowlog.flush()
                os.fsync(rowlog.fileno())

                # Advance to next file number
                file_index += 1

                # Persist state AFTER successfully finishing the file
                # processed_rows equals the highest successfully written global row number
                persist_state(next_file_index=file_index, processed_rows=max(batch_row_numbers))

        created_now = (file_index - 1) - total_written_files_before
        logger.info(f"Process complete. {created_now} new files created; total files now up to part {file_index - 1} in '{OUTPUT_DIR}'")

    finally:
        try:
            rowlog.close()
        except Exception:
            pass

if __name__ == "__main__":
    main()
