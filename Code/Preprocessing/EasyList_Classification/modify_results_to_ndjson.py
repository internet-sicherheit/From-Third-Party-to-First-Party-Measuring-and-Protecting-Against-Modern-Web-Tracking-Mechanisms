#!/usr/bin/env python3
import json
import os
from tqdm import tqdm

# -----------------------
# Configuration
# -----------------------
BASE_DIR = os.getcwd()
INPUT_FOLDER = os.path.join(BASE_DIR, "input")   # hardcoded input
OUTPUT_FOLDER = os.path.join(BASE_DIR, "output")  # hardcoded output
FILES = os.listdir(INPUT_FOLDER)

def main():
    # Load full JSON structure
    for file in tqdm(FILES, total=len(FILES), desc='Processing files...'):
        with open(os.path.join(INPUT_FOLDER, file), "r", encoding="utf-8") as f:
            data = json.load(f)

        with open(os.path.join(OUTPUT_FOLDER, os.path.basename(file) + '.ndjson'), "w", encoding="utf-8", newline="\n") as out:
            for record in data:
                results = record.get("results", [])
                for res in results:
                    try:
                        obj = {
                            "blocked_by_easylist": bool(res["blocked_by_easylist"]),
                            "blocked_by_easyprivacy": bool(res["blocked_by_easyprivacy"]),
                            "url": str(res["url"]),
                        }
                        out.write(json.dumps(obj, ensure_ascii=False) + "\n")
                    except KeyError:
                        # skip if fields are missing
                        continue


if __name__ == "__main__":
    main()
