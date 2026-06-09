########################## IMPORTS #########################
import os
import re
import logging
import sqlite3
import asyncio
import ndjson
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

import pandas as pd
import tldextract
from tqdm import tqdm

from Ops import addTime2Datetime, isThirdParty
from setup import getMode

########################## CONFIG #########################
NAME_DATABASE = "crawl-data.sqlite"
DATA_PATH = os.path.join(os.getcwd(), 'profiles', 'openwpm')
EASYLIST_FILE = os.path.join(os.getcwd(), '..', 'resources', 'easylists', 'easylist_19052025.txt')
EASYPRIVACY_FILE = os.path.join(os.getcwd(), '..', 'resources', 'easylists', 'easyprivacy_19052025.txt')
COOKIE_CATEGORIES_CSV = os.path.join(os.getcwd(), '..', 'Code', 'Preprocessing', 'cookie_classification', 'cookie_cat.csv')
LOGFILE_NAME = f"{os.path.basename(__file__)}.log"
PATTERN = re.compile(
    r'^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d+ INFO\s+'
    r'flush_combined_data\s+'
    r'Processed folders in batch (?P<batch>\d+): '
    r'(?P<folder1>\d+), (?P<folder2>\d+), (?P<folder3>\d+), '
    r'(?P<folder4>\d+), (?P<folder5>\d+), (?P<folder6>\d+), '
    r'(?P<folder7>\d+), (?P<folder8>\d+), (?P<folder9>\d+), '
    r'(?P<folder10>\d+)'
)


def setup_logger():
    formatter = logging.Formatter('%(asctime)s %(levelname)-8s %(funcName)-30s %(message)s')
    fh = logging.FileHandler(LOGFILE_NAME)
    sh = logging.StreamHandler()
    fh.setLevel(logging.DEBUG)
    sh.setLevel(logging.ERROR)
    fh.setFormatter(formatter)
    sh.setFormatter(formatter)

    log = logging.getLogger(__name__)
    log.addHandler(fh)
    log.addHandler(sh)
    log.setLevel(logging.DEBUG)
    log.propagate = False
    return log


logger = setup_logger()

########################## LOADERS #########################
def load_cookie_categories():
    df = pd.read_csv(COOKIE_CATEGORIES_CSV).drop(['classified'], axis=1).fillna('')
    return dict(zip(df['cookie_name'], df['category']))

def getLoggedFolder(log_file=LOGFILE_NAME, pattern=PATTERN):
    try:
        with open(log_file, 'r') as f:
            return [{'batch': int(m.group('batch')),
                     'folder1': int(m.group('folder1')),
                     'folder2': int(m.group('folder2')),
                     'folder3': int(m.group('folder3')),
                     'folder4': int(m.group('folder4')),
                     'folder5': int(m.group('folder5')),
                     'folder6': int(m.group('folder6')),
                     'folder7': int(m.group('folder7')),
                     'folder8': int(m.group('folder8')),
                     'folder9': int(m.group('folder9')),
                     'folder10': int(m.group('folder10'))}
                    for line in f if(m := pattern.match(line))]
    except FileNotFoundError:
        return []

def listFolder(folder):
    folder_number_in_log = list()
    for d in tqdm(folder, total=len(folder), desc='Collecting already analyzed folders'):
        for i in range(1,11):
            search = f'folder{i}'
            folder_number_in_log.append(d[search])
    return folder_number_in_log

def already_analyed_files():
    data = getLoggedFolder()
    folder_in_log = listFolder(data)
    return folder_in_log

########################## SQL HELPER #########################
def getSQLItems(query, root_site_id, database, is_script=False):
    try:
        with sqlite3.connect(database) as conn:
            cur = conn.cursor()
            return cur.executescript(query).fetchall() if is_script else cur.execute(query).fetchall()
    except Exception:
        logger.exception(f"{root_site_id} getSQLItems()")
        return []

def getVisitID(root_site_id, database):
    try:
        return [row[0] for row in getSQLItems("SELECT DISTINCT visit_id FROM site_visits ORDER BY site_rank ASC;", root_site_id, database)]
    except Exception:
        logger.exception(f"{root_site_id} getVisitID")
        return []

# ------------------------ Extractor Functions (Same as before) ------------------------
def getJavaScript(root_site_id, visit_id, subpage_id, database):
    #logger.info("Get JavaScript data")
    try:
        query = "SELECT * FROM javascript WHERE visit_id = " + str(visit_id) +";"
        rows = getSQLItems(query, root_site_id, database)
        jsList = []
        for r in rows:
            res = {}

            res['incognito'] = r[1]
            res['sqlite_browser_id'] = r[2]
            res['sqlite_visit_id'] = r[3]
            res['extension_session_uuid'] = r[4]
            res['event_ordinal'] = r[5]
            res['page_scoped_event_ordinal'] = r[6]
            res['window_id'] = r[7]
            res['tab_id'] = r[8]
            res['frame_id'] = r[9]
            res['script_url'] = r[10]
            res['script_line'] = r[11]
            res['script_col'] = r[12]
            res['func_name'] = r[13]
            res['script_loc_eval'] = r[14]
            res['document_url'] = r[15]
            res['top_level_url'] = r[16]
            res['call_stack'] = r[17]
            res['symbol'] = r[18]
            res['operation'] = r[19]
            res['value'] = r[20]
            res['arguments'] = r[21]
            res['time_stamp'] = addTime2Datetime(r[22], 2)
            res['visit_id'] = str(root_site_id) + '_' + str(subpage_id)
            res['site_id'] = root_site_id
            res['subpage_id'] = subpage_id
            res['browser_id'] = getMode()
            script_url = tldextract.extract(r[10])
            document_url = tldextract.extract(r[15])
            top_level_url = tldextract.extract(r[16])
            res['script_url_etld'] = script_url.domain + '.' + script_url.suffix
            res['document_url_etld'] = document_url.domain + '.' + document_url.suffix
            res['top_level_url_etld'] = top_level_url.domain + '.' + top_level_url.suffix
            res['first_party_script'] = res['script_url_etld'] == res['top_level_url_etld']
            res['set_first_party_cookies'] = res['document_url'] == res['top_level_url_etld']

            jsList.append(res)

        return jsList
    except:
            logger.exception(f"{root_site_id} getJavascript")


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

            cookie['valid_entropy'] = len(cookie['value']) >= 8
            cookie['valid_expires_date'] = False

            cookieList.append(cookie)
        return cookieList
    except:
        logger.exception(f"{root_site_id} getCookies")

def getResponses(root_site_id, visit_id, subpage_id, database):
    try:
        query = "SELECT * FROM http_responses WHERE visit_id = " + str(visit_id) +";"
        rows = getSQLItems(query, root_site_id, database)
        resList = []
        for r in rows:
            res = {}
            res['incognito'] = r[1]
            res['sqlite_browser_id'] = r[2]
            res['sqlite_visit_id'] = r[3]
            res['extension_session_uuid'] = r[4]
            res['event_ordinal'] = r[5]
            res['window_id'] = r[6]
            res['tab_id'] = r[7]
            res['frame_id'] = r[8]
            res['url'] = r[9]
            res['method'] = r[10]
            res['response_status'] = r[11]
            res['response_status_text'] = r[12]
            res['is_cached'] = r[13]
            res['headers'] = r[14]
            res['request_id'] = r[15]
            res['location'] = r[16]


            res['time_stamp'] = addTime2Datetime(r[17], 2)

            res['content_hash'] = r[18]
            res['visit_id'] = str(root_site_id) + '_' + str(subpage_id)

            etld = tldextract.extract(res['url'])
            res['etld'] = etld.domain + '.' + etld.suffix


            res['site_id'] = root_site_id
            res['subpage_id'] = subpage_id
            res['browser_id'] = getMode()
            res['is_javascript'] = 'javascript' in res['headers']
            res['is_setcookie'] = 'set-cookie' in res['headers']

            resList.append(res)

        return resList
    except:
        logger.exception(f"{root_site_id} getResponses")

def getRequests(root_site_id, visit_id,subpage_id, database):
    try:
        query = "SELECT * FROM http_requests WHERE visit_id = " + str(visit_id) +";"
        rows = getSQLItems(query, root_site_id, database)
        reqList = []
        for r in rows:
            req = {}

            req['incognito'] = r[1]
            req['sqlite_browser_id'] = r[2]
            req['sqlite_visit_id'] = r[3]
            req['extension_session_uuid'] = r[4]
            req['event_ordinal'] = r[5]
            req['window_id'] = r[6]
            req['tab_id'] = r[7]
            req['frame_id'] = r[8]
            req['url'] = r[9]
            req['top_level_url'] = r[10]
            req['parent_frame_id'] = r[11]
            req['frame_ancestors'] = r[12]
            req['method'] = r[13]
            req['referrer'] = r[14]
            req['headers'] = r[15]
            req['request_id'] = r[16]
            req['is_XHR'] = r[17]

            req['is_third_party_channel'] = isThirdParty(
                req['top_level_url'], req['url'])  # req['is_third_party_channel'] = r[9]

            req['is_third_party_to_top_window'] = r[19]

            req['triggering_origin'] = r[20]
            req['loading_origin'] = r[21]
            req['loading_href'] = r[22]
            req['req_call_stack'] = r[23]

            req['resource_type'] = r[24]
            if req['resource_type'] == 'websocket':
                req['is_websocket'] = 1
            else:
                req['is_websocket'] = 0

            req['post_body'] = r[25]
            req['post_body_raw'] = r[26]


            req['time_stamp'] = addTime2Datetime(r[27], 2)

            req['site_id'] = root_site_id
            req['visit_id'] = str(root_site_id) + '_' + str(subpage_id)
            req['subpage_id'] = subpage_id
            req['browser_id'] = getMode()

            req['easylist_blocked'] = False #RULES_EASYLIST.should_block(req['url'])
            req['easylist_privacy_blocked'] = False #RULES_EASYLIST.should_block(req['url'])
            req['is_tracker'] = False
            etld = tldextract.extract(req['url'])
            req['etld'] = etld.domain + '.' + etld.suffix

            reqList.append(req)

        return reqList
    except:
        logger.exception(f"{root_site_id} getRequests")

########################## PROCESS AND COLLECT #########################
def process_and_collect(folder_path, folder_id, analyzed_tables, cookies_classified):
    db_path = os.path.join(folder_path, NAME_DATABASE)
    logger.info(f"[{folder_id}] Starting...")

    try:
        visit_ids = getVisitID(folder_id, db_path)
        if not visit_ids:
            logger.warning(f"[{folder_id}] No visit_ids found.")
            return {}

        req, res, cookies, js = [], [], [], []

        for subpage_id, visit_id in enumerate(visit_ids):
            #if 'requests' not in analyzed_tables:
            req.extend(getRequests(folder_id, visit_id, subpage_id, db_path))
            #if 'responses' not in analyzed_tables:
            res.extend(getResponses(folder_id, visit_id, subpage_id, db_path))
            #if 'cookie' not in analyzed_tables:
            cookies.extend(getCookies(folder_id, visit_id, subpage_id, db_path))
            #if 'javascript' not in analyzed_tables:
            js.extend(getJavaScript(folder_id, visit_id, subpage_id, db_path))

        logger.info(f"[{folder_id}] requests: {len(req)}; responses: {len(res)}, cookies: {len(cookies)}, javascript: {len(js)}.")
        logger.info(f"[{folder_id}] Processed successfully.")
        return folder_id, {
            "requests": req,
            "responses": res,
            "cookies": cookies,
            "javascript": js
        }
    except Exception:
        logger.exception(f"[{folder_id}] Failed to process database")
        return folder_id, {}

########################## ASYNC EXECUTION #########################
async def run_all_extractions(folder_paths, analyzed_info, cookies_classified):
    loop = asyncio.get_running_loop()
    batch_size = 10
    folder_counter = 0

    def task(folder):
        folder_id = os.path.basename(folder)
        #analyzed_tables = [e['table'] for e in analyzed_info if str(e['id']) == folder_id]
        return process_and_collect(folder, folder_id, False, cookies_classified)

    def flush_combined_data(batch_num, combined_data, processed_folders):
        os.makedirs("extracet_tables", exist_ok=True)
        for table_name, records in combined_data.items():
            if records:
                out_path = os.path.join("extracet_tables", f"{table_name}.ndjson")
                try:
                    with open(out_path, 'a', encoding='utf-8') as f:
                        writer = ndjson.writer(f, ensure_ascii=False)
                        for record in records:
                            writer.writerow(record)
                    logger.info(f"Wrote {len(records)} records to {out_path}")
                except Exception as e:
                    logger.exception(f"Failed to write {table_name}_.ndjson on batch {batch_num}: {e}")

            # Log processed folders in this batch
        logger.info(f"Processed folders in batch {batch_num}: {', '.join(processed_folders)}")

    with ThreadPoolExecutor(max_workers=min(32, os.cpu_count() or 4)) as executor:
        futures = []
        combined_data = defaultdict(list)
        processed_folders = []

        for i, folder in enumerate(folder_paths):
            futures.append(loop.run_in_executor(executor, task, folder))

            if (i + 1) % batch_size == 0 or (i + 1) == len(folder_paths):
                for f in tqdm(asyncio.as_completed(futures), total=len(futures), desc=f"Batch {folder_counter + 1}"):
                    folder_id, result = await f
                    processed_folders.append(folder_id)
                    for k in result:
                        if result[k]:
                            combined_data[k].extend(result[k])

                flush_combined_data(folder_counter + 1, combined_data, processed_folders)

                folder_counter += 1
                futures = []
                combined_data.clear()
                processed_folders.clear()

if __name__ == '__main__':
    logger.info("Loading classification data and blocklists...")
    COOKIES_CLASSIFIED = load_cookie_categories()
    ALREADY_ANALYZED = already_analyed_files()

    # Get all folders and filter out already analyzed ones
    FOLDER_WO_PATH = os.listdir(DATA_PATH)
    FOLDER_W_PATH = sorted(
        [os.path.join(DATA_PATH, f) for f in FOLDER_WO_PATH if int(f) not in ALREADY_ANALYZED],
        key=lambda p: int(os.path.basename(p))
    )

    logger.info(f"Found {len(FOLDER_W_PATH)} folders to process after filtering {len(ALREADY_ANALYZED)} analyzed ones.")
    logger.info("Starting extraction using multithreading...")
    asyncio.run(run_all_extractions(FOLDER_W_PATH, ALREADY_ANALYZED, COOKIES_CLASSIFIED))
