########################## IMPORTS #########################
import os
import re
import logging
import csv
import sqlite3
from adblockparser import AdblockRules
import pandas as pd
import tldextract
from glob import glob
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor
import asyncio
from Ops import addTime2Datetime, isThirdParty
from setup import getMode

########################## Logging #########################
formatter = logging.Formatter('%(asctime)s %(levelname)-8s %(funcName)-30s %(message)s')
fh = logging.FileHandler("%s.log" % (os.path.basename(__file__)))
sh = logging.StreamHandler()
fh.setLevel(logging.DEBUG)
fh.setFormatter(formatter)
sh.setFormatter(formatter)
sh.setLevel(logging.ERROR)
logger = logging.getLogger(__name__)
logger.addHandler(fh)
logger.addHandler(sh)
logger.setLevel(logging.DEBUG)
logger.propagate = False

########################## GLOBAL VARIABLES #########################
DATA_PATH = os.path.join(os.getcwd(), 'profiles', 'openwpm')
FOLDER_WO_PATH = os.listdir(DATA_PATH)
NAME_DATABASE = "crawl-data.sqlite"
FOLDER_W_PATH = sorted([os.path.join(DATA_PATH, f) for f in FOLDER_WO_PATH], key=lambda p: int(os.path.basename(p)))
BASEPATH_TO_EASYLIST = os.path.join(os.getcwd(), '..', 'resources', 'easylists')
EASYLIST = os.path.join(BASEPATH_TO_EASYLIST, 'easylist_19052025.txt')
EASYPRIVACY = os.path.join(BASEPATH_TO_EASYLIST, 'easyprivacy_19052025.txt')

with open(EASYLIST, "r", encoding="utf-8") as f:
    RULES_EASYLIST = AdblockRules([line.strip() for line in f if line.strip() and not line.startswith('!')])

with open(EASYPRIVACY, "r", encoding="utf-8") as f:
    RULES_EASYPRIVACY = AdblockRules([line.strip() for line in f if line.strip() and not line.startswith('!')])

COOKIES_CLASSIFIED = dict()
tqdm.pandas()

########################## HELPER FUNCTIONS #########################

def already_analyed_files():
    pattern = re.compile(r'^.*Successfully insert data into (?P<table>\w+) on (?P<id>\d+).*$')
    entries = []
    try:
        with open('extract_tables_to_csv_multi.py.log', 'r') as infile:
            for line in infile:
                m = pattern.match(line)
                if m:
                    entries.append({'table': m.group('table'), 'id': int(m.group('id'))})
    except FileNotFoundError:
        pass
    return entries

def load_cookie_categories():
    path = os.path.join(os.getcwd(), '..', 'Code', 'Preprocessing', 'cookie_classification', 'cookie_cat.csv')
    cookie_df = pd.read_csv(path).drop(['classified'], axis=1).fillna('')
    return dict(zip(cookie_df['cookie_name'], cookie_df['category']))

def getSQLItems(query, root_site_id, database, is_script=False):
    try:
        sqliteConnection = sqlite3.connect(database)
        cursor = sqliteConnection.cursor()

        if is_script:
            rows = cursor.executescript(query).fetchall()
        else:
            rows = cursor.execute(query).fetchall()
        sqliteConnection.close()
        return rows
    except Exception as e:
        logger.exception(f"{root_site_id} getSQLItems()")
        print(e)

def getVisitID(root_site_id, database):
    return [row[0] for row in getSQLItems("SELECT DISTINCT visit_id FROM site_visits ORDER BY site_rank ASC;",root_site_id, database)]

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
            res['set_first_party_cookies'] = res['document_url_etld'] == res['top_level_url_etld']

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

            req['easylist_blocked'] = RULES_EASYLIST.should_block(req['url'])
            req['easylist_privacy_blocked'] = RULES_EASYLIST.should_block(req['url'])
            etld = tldextract.extract(req['url'])
            req['etld'] = etld.domain + '.' + etld.suffix

            reqList.append(req)

        return reqList
    except:
        logger.exception(f"{root_site_id} getRequests")

########################## PROCESSING FUNCTION #########################

def process_database(folder_path):
    folder_id = os.path.basename(folder_path)
    sqlite_database = os.path.join(folder_path, NAME_DATABASE)
    logger.info(f"[{folder_id}] Starting...")

    analyzed_tables = [e['table'] for e in ALREADY_ANALYZED if str(e['id']) == folder_id]

    try:
        visit_ids = getVisitID(folder_id, sqlite_database)
        req, res, cookies, js = [], [], [], []

        for subpage_id, visit_id in enumerate(visit_ids):
            if 'requests' not in analyzed_tables:
                req.extend(getRequests(folder_id, visit_id, subpage_id, sqlite_database))
            if 'responses' not in analyzed_tables:
                res.extend(getResponses(folder_id, visit_id, subpage_id, sqlite_database))
            if 'cookie' not in analyzed_tables:
                cookies.extend(getCookies(folder_id, visit_id, subpage_id, sqlite_database))
            if 'javascript' not in analyzed_tables:
                js.extend(getJavaScript(folder_id, visit_id, subpage_id, sqlite_database))

        output_dir = os.path.join("extracted_csvs", folder_id)
        os.makedirs(output_dir, exist_ok=True)
        if req: pd.DataFrame(req).to_csv(os.path.join(output_dir, "requests.csv"), index=False)
        if res: pd.DataFrame(res).to_csv(os.path.join(output_dir, "responses.csv"), index=False)
        if cookies: pd.DataFrame(cookies).to_csv(os.path.join(output_dir, "cookies.csv"), index=False)
        if js: pd.DataFrame(js).to_csv(os.path.join(output_dir, "javascript.csv"), index=False)

        logger.info(f"[{folder_id}] Extraction completed.")
    except Exception as e:
        logger.exception(f"[{folder_id}] Failed to process database")

########################## ASYNC ORCHESTRATION #########################

async def run_all_extractions():
    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
        tasks = []
        for folder in FOLDER_W_PATH:
            tasks.append(loop.run_in_executor(executor, process_database, folder))
        for f in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Multithreaded Extraction"):
            await f

########################## MAIN #########################

if __name__ == '__main__':
    logger.info("Loading cookie categories...")
    COOKIES_CLASSIFIED = load_cookie_categories()

    logger.info("Checking already analyzed files...")
    ALREADY_ANALYZED = already_analyed_files()

    logger.info("Starting extraction using multithreading...")
    asyncio.run(run_all_extractions())
