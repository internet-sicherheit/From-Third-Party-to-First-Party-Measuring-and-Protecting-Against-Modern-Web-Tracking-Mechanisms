import os
import re
import json
import sqlite3
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor

import tldextract
from tqdm import tqdm

from Ops import addTime2Datetime
from setup import getMode

# Configuration
NAME_DATABASE = "crawl-data.sqlite"
DATA_PATH = os.path.join(os.getcwd(), 'profiles', 'openwpm')
LOGFILE_NAME = f"{os.path.basename(__file__)}.log"

# Logger setup
def setup_logger():
    formatter = logging.Formatter('%(asctime)s %(levelname)-8s %(message)s')
    fh = logging.FileHandler(LOGFILE_NAME)
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(formatter)

    log = logging.getLogger(__name__)
    log.addHandler(fh)
    log.setLevel(logging.DEBUG)
    log.propagate = False
    return log

logger = setup_logger()

# SQL helper
def getSQLItems(query, root_site_id, database):
    try:
        with sqlite3.connect(database) as conn:
            cur = conn.cursor()
            return cur.execute(query).fetchall()
    except Exception:
        logger.exception(f"{root_site_id} getSQLItems()")
        return []

def getVisitID(root_site_id, database):
    try:
        return [row[0] for row in getSQLItems("SELECT DISTINCT visit_id FROM site_visits ORDER BY site_rank ASC;", root_site_id, database)]
    except Exception:
        logger.exception(f"{root_site_id} getVisitID")
        return []

# JavaScript extraction
def getJavaScript(root_site_id, visit_id, subpage_id, database):
    try:
        query = f"SELECT * FROM javascript WHERE visit_id = {visit_id};"
        rows = getSQLItems(query, root_site_id, database)
        jsList = []
        for r in rows:
            js = {
                'incognito': r[1],
                'sqlite_browser_id': r[2],
                'sqlite_visit_id': r[3],
                'extension_session_uuid': r[4],
                'event_ordinal': r[5],
                'page_scoped_event_ordinal': r[6],
                'window_id': r[7],
                'tab_id': r[8],
                'frame_id': r[9],
                'script_url': r[10],
                'script_line': r[11],
                'script_col': r[12],
                'func_name': r[13],
                'script_loc_eval': r[14],
                'document_url': r[15],
                'top_level_url': r[16],
                'call_stack': r[17],
                'symbol': r[18],
                'operation': r[19],
                'value': r[20],
                'arguments': r[21],
                'time_stamp': addTime2Datetime(r[22], 2),
                'visit_id': f"{root_site_id}_{subpage_id}",
                'site_id': root_site_id,
                'subpage_id': subpage_id,
                'browser_id': getMode(),
            }

            for key in ['script_url', 'document_url', 'top_level_url']:
                ext = tldextract.extract(js[key])
                js[f"{key}_etld"] = f"{ext.domain}.{ext.suffix}"

            js['first_party_script'] = js['script_url_etld'] == js['top_level_url_etld']
            js['set_first_party_cookies'] = js['document_url'] == js['top_level_url_etld']
            jsList.append(js)

        return jsList
    except Exception:
        logger.exception(f"{root_site_id} getJavaScript")

# Process one database folder
def process_folder(folder_path):
    folder_id = os.path.basename(folder_path)
    db_path = os.path.join(folder_path, NAME_DATABASE)
    visit_ids = getVisitID(folder_id, db_path)

    all_js = []
    for subpage_id, visit_id in enumerate(visit_ids):
        js = getJavaScript(folder_id, visit_id, subpage_id, db_path)
        if js:
            all_js.extend(js)

    if all_js:
        os.makedirs("extracted_json", exist_ok=True)
        out_file = os.path.join("extracted_json", f"javascript_{getMode()}_{folder_id}.json")
        try:
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(all_js, f, indent=2)
            logger.info(f"Wrote {len(all_js)} JavaScript records to {out_file}")
        except Exception:
            logger.exception(f"Failed to write JSON for {folder_id}")

# Async execution for folders
async def extract_all_javascript(folders):
    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor(max_workers=min(32, os.cpu_count() or 4)) as executor:
        tasks = [loop.run_in_executor(executor, process_folder, folder) for folder in folders]
        for f in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Extracting JavaScript"):
            await f

# Main execution
if __name__ == '__main__':
    all_folders = sorted(
        [os.path.join(DATA_PATH, d) for d in os.listdir(DATA_PATH) if d.isdigit()],
        key=lambda p: int(os.path.basename(p))
    )
    logger.info(f"Found {len(all_folders)} folders to process for JavaScript extraction.")
    asyncio.run(extract_all_javascript(all_folders))
