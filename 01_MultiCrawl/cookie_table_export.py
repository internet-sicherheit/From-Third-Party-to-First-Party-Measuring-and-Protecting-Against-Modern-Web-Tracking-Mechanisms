import os
import re
import json
import sqlite3
import logging
import asyncio
import pandas as pd
from concurrent.futures import ThreadPoolExecutor

import tldextract
from tqdm import tqdm

from Ops import addTime2Datetime
from setup import getMode

# Configuration
NAME_DATABASE = "crawl-data.sqlite"
DATA_PATH = os.path.join(os.getcwd(), 'profiles', 'openwpm')
LOGFILE_NAME = f"{os.path.basename(__file__)}.log"
COOKIES_CLASSIFIED = dict()

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

def load_cookie_categories():
    path = os.path.join(os.getcwd(), '..', 'Code', 'Preprocessing', 'cookie_classification', 'cookie_cat.csv')
    cookie_df = pd.read_csv(path).drop(['classified'], axis=1).fillna('')
    return dict(zip(cookie_df['cookie_name'], cookie_df['category']))

# JavaScript extraction
def getCookies(root_site_id, visit_id, subpage_id, database):
    try:
        # Check if in_cookiejar column already exists
        columns_info = getSQLItems("PRAGMA table_info(javascript_cookies)", root_site_id, database)
        column_names = [col[1] for col in columns_info]
        if not "in_cookiejar" in column_names:
            query_update = """
            ALTER TABLE javascript_cookies ADD in_cookiejar integer;

            update javascript_cookies
            set in_cookiejar=1 where id in(
            select id
            from (select * from javascript_cookies j inner join ( select name, host from (select * from javascript_cookies c inner join 
            (select name, host from javascript_cookies  group by name, host ) gc on gc.name=c.name and c.host=gc.host 
            WHERE gc.name in(select name from javascript_cookies j where j.name=gc.name and j.host=gc.host and j.record_type != 'deleted' order by time_stamp desc limit 1)
            ) group by name, host) as r_cookies where id in (select id from javascript_cookies tmp where r_cookies.name=tmp.name and r_cookies.host=tmp.host order by id desc limit 1) 
            and j.record_type!='deleted') as c inner join site_visits as s on s.visit_id = c.visit_id);


                """
            getSQLItems(query_update, root_site_id, database, is_script=True)

        query = "select c.*, s.site_rank from javascript_cookies as c inner join site_visits as s on s.visit_id = c.visit_id WHERE c.visit_id = " + str(visit_id) +";"

        rows = getSQLItems(query, root_site_id, database)

        cookieList = []

        for r in rows:
            cookie = {}

            cookie['sqlite_browser_id'] = r[1]
            cookie['sqlite_visit_id'] = r[2]
            cookie['extension_session_uuid'] = r[3]
            cookie['event_ordinal'] = r[4]
            cookie['record_type'] = r[5]
            cookie['change_cause'] = r[6]
            cookie['expiry'] = addTime2Datetime(r[7], 2)
            cookie['is_http_only'] = r[8]
            cookie['is_host_only'] = r[9]
            cookie['is_session'] = r[10]
            cookie['host'] = r[11]
            cookie['is_secure'] = r[12]
            cookie['name'] = r[13]
            cookie['path'] = r[14]
            cookie['value'] = r[15]
            cookie['same_site'] = r[16]
            cookie['first_party_domain'] = r[17]
            cookie['store_id'] = r[18]

            # timedelta(hours=2)
            cookie['time_stamp'] = addTime2Datetime(r[19], 2)
            cookie['site_id'] = root_site_id  # r[8] #by openwpm
            cookie['in_cookiejar'] = r[20]
            cookie['site_rank'] = r[21]
            cookie['hold_id'] = None  # isPossibleId(r[4])
            cookie['visit_id'] = str(root_site_id) + '_' + str(subpage_id)
            cookie['browser_id'] = getMode()
            try:
                cookie['category'] = COOKIES_CLASSIFIED[cookie['name']]
            except:
                cookie['category'] = None

            cookie['valid_entropy'] = None
            cookie['valid_expires_date'] = None

            cookieList.append(cookie)
        return cookieList
    except:
        logger.exception(f"{root_site_id} getCookies")

# Process one database folder
def process_folder(folder_path):
    folder_id = os.path.basename(folder_path)
    db_path = os.path.join(folder_path, NAME_DATABASE)
    visit_ids = getVisitID(folder_id, db_path)

    all_js = []
    for subpage_id, visit_id in enumerate(visit_ids):
        js = getCookies(folder_id, visit_id, subpage_id, db_path)
        if js:
            all_js.extend(js)

    if all_js:
        os.makedirs("extracted_cookies_json", exist_ok=True)
        out_file = os.path.join("extracted_cookies_json", f"Cookies_{getMode()}_{folder_id}.json")
        try:
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(all_js, f, indent=2)
            logger.info(f"Wrote {len(all_js)} Cookies records to {out_file}")
        except Exception:
            logger.exception(f"Failed to write JSON for {folder_id}")

# Async execution for folders
async def extract_all_javascript(folders):
    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor(max_workers=min(32, os.cpu_count() or 4)) as executor:
        tasks = [loop.run_in_executor(executor, process_folder, folder) for folder in folders]
        for f in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Extracting Cookies"):
            await f

# Main execution
if __name__ == '__main__':
    logger.info("Loading cookie categories...")
    COOKIES_CLASSIFIED = load_cookie_categories()

    all_folders = sorted(
        [os.path.join(DATA_PATH, d) for d in os.listdir(DATA_PATH) if d.isdigit()],
        key=lambda p: int(os.path.basename(p))
    )
    logger.info(f"Found {len(all_folders)} folders to process for Cookies extraction.")
    asyncio.run(extract_all_javascript(all_folders))
