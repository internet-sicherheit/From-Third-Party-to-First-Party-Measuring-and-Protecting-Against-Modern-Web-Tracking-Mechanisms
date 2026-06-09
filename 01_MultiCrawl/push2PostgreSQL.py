########################## IMPORTS #########################
import sys
import re
import os
import logging
import psycopg2
import sqlite3
import numpy as np
import pandas as pd
import tldextract
from glob import glob
from tqdm import tqdm
from Ops import addTime2Datetime, isThirdParty
from setup import getMode
from psycopg2.extras import execute_values
from adblockparser import AdblockRules
############################################################

########################## Logging #########################
# Initialize logging
# Each log line includes the date and time, the log level, the current function and the message
formatter = logging.Formatter('%(asctime)s %(levelname)-8s %(funcName)-30s %(message)s')
# The log file is the same as the module name plus the suffix ".log"
# i.e.: calculate.py -> calculate.py.log
fh = logging.FileHandler("%s.log" % (os.path.basename(__file__)))
sh = logging.StreamHandler()
fh.setLevel(logging.DEBUG)      # set the log level for the log file
fh.setFormatter(formatter)
sh.setFormatter(formatter)
sh.setLevel(logging.ERROR)       # set the log level for the console
logger = logging.getLogger(__name__)
logger.addHandler(fh)
logger.addHandler(sh)
logger.setLevel(logging.DEBUG)
logger.propagate = False
############################################################

########################## VARIABLES #######################
# Data Paths
DATA_PATH = os.path.join(os.getcwd(), 'profiles', 'openwpm')

#DATA_PATH = os.path.join('D:', 'SST-DATA', 'OpenWPM', 'openwpm_test_measurement', 'openwpm') # Needs to be changed


FOLDER_WO_PATH = os.listdir(DATA_PATH)
NAME_DATABASE = "crawl-data.sqlite"
NAME_SCRIPT_FOLDER = "sources"

FOLDER_W_PATH = list()

for folder in FOLDER_WO_PATH:
    full_path = os.path.join(DATA_PATH, folder)
    FOLDER_W_PATH.append(full_path)

FOLDER_W_PATH = sorted(FOLDER_W_PATH, key=lambda p: int(os.path.basename(p))) # sort by number of root_number

# Enable progress bar for performance tracking
tqdm.pandas()

# Connection string for the PostgreSQL database
CONSTRING = "user=  password= host= port= dbname="

BASEPATH_TO_EASYLIST = os.path.join(os.getcwd(), '..', 'resources', 'easylists')
EASYLIST = os.path.join(BASEPATH_TO_EASYLIST, 'easylist_19052025.txt')
EASYPRIVACY = os.path.join(BASEPATH_TO_EASYLIST, 'easyprivacy_19052025.txt')

with open(EASYLIST, "r", encoding="utf-8") as f:
    filters = f.readlines()
clean_filters = [line.strip() for line in filters if line.strip() and not line.startswith('!')]
RULES_EASYLIST = AdblockRules(clean_filters)

with open(EASYPRIVACY, "r", encoding="utf-8") as f:
    filters = f.readlines()
clean_filters = [line.strip() for line in filters if line.strip() and not line.startswith('!')]
RULES_EASYPRIVACY = AdblockRules(clean_filters)

SPECIFIC_PIHOLE_FILE_NAME = os.path.join(BASEPATH_TO_EASYLIST, 'pi_hole_hosts.txt')

import re
import os

def already_analyed_files():
    # Updated regex to match new log format and capture 'table' and 'id'
    pattern = re.compile(
        r'^'
        r'(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})'
        r'\s+DEBUG\s+insertIntoPostgreSQL\s+'
        r'Successfully insert data into '
        r'(?P<table>\w+) on (?P<id>\d+)'
        r'$'
    )

    input_path = 'push2PostgreSQL.py.log'
    entries = []

    with open(input_path, 'r') as infile:
        for line in infile:
            m = pattern.match(line)
            if m:
                entries.append({
                    'timestamp': m.group('timestamp'),
                    'table': m.group('table'),
                    'id': int(m.group('id'))
                })

    return entries

ALREADY_ANALYZED = already_analyed_files()

def filter_folder_paths(FOLDER_W_PATH):
    required_tables = {'responses', 'requests', 'cookie', 'javascript'}
    analyzed = already_analyed_files()

    # Group tables by id
    id_to_tables = {}
    for entry in analyzed:
        entry_id = entry['id']
        entry_table = entry['table']
        id_to_tables.setdefault(entry_id, set()).add(entry_table)

    # Filter out paths with all required tables present
    filtered = []
    for path in FOLDER_W_PATH:
        basename = os.path.basename(path)
        if id_to_tables.get(basename, set()) >= required_tables:
            # skip this path (it has all required tables)
            continue
        filtered.append(path)

    return filtered

#FOLDER_W_PATH = filter_folder_paths(FOLDER_W_PATH)

############################################################

########################## DATA PROCESSING #################
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

def isPossibleId(cookie_name):
    query = """ SELECT is_id FROM value_analysis_results WHERE cookie_name = %s;"""

def read_pihole_urls():
    """
    Reads PiHole rules from file.
    :return: A set containing the filter rules
    """
    url_ruleset = set()

    # Read blocking rules from file
    with open(SPECIFIC_PIHOLE_FILE_NAME) as pihole_file:
        while line := pihole_file.readline():
            line = line.rstrip()
            # Skip comments and empty lines
            if line.startswith("#") or len(line) == 0:
                continue
            # Add the URLs (eTLD+1) for each domain
            url_ruleset.add(line.split(' ')[1])

    return url_ruleset

PI_RULES = read_pihole_urls()
############################################################

########################## TABLE PROCESSING ################
def getJavascript(root_site_id, visit_id, subpage_id, database):
    try:
        query = "SELECT incognito, event_ordinal, page_scoped_event_ordinal, window_id , tab_id, frame_id, " \
                "script_url, script_line, script_col, func_name, script_loc_eval, document_url," \
                "top_level_url, call_stack, symbol, operation, value, arguments , time_stamp from javascript WHERE visit_id ="+str(visit_id)+";"
        rows = getSQLItems(query, root_site_id, database)
        jsList = []
        for r in rows:
            res = {}

            res['incognito'] = r[0]
            res['event_ordinal'] = r[1]
            res['page_scoped_event_ordinal'] = r[2]
            res['window_id'] = r[3]
            res['tab_id'] = r[4]
            res['frame_id'] = r[5]
            res['script_url'] = r[6]
            res['script_line'] = r[7]
            res['script_col'] = r[8]
            res['func_name'] = r[9]
            res['script_loc_eval'] = r[10]
            res['document_url'] = r[11]
            res['top_level_url'] = r[12]
            res['call_stack'] = r[13]
            res['symbol'] = r[14]
            res['operation'] = r[15]
            res['value'] = r[16]
            res['arguments'] = r[17]
            res['time_stamp'] = addTime2Datetime(r[18], 2)
            res['visit_id'] = str(root_site_id) + '_' + str(subpage_id)
            res['site_id'] = root_site_id
            res['subpage_id'] = subpage_id
            res['browser_id'] = getMode()
            jsList.append(res)

        return jsList
    except:
        logger.exception(f"{root_site_id} getJavascript")

def getResponses(root_site_id, visit_id, subpage_id, database):
    try:
        query = "SELECT method, headers, url, time_stamp, response_status, response_status_text, browser_id, visit_id, content_hash, request_id FROM http_responses WHERE visit_id = "+ str(visit_id) +";"
        rows = getSQLItems(query, root_site_id, database)
        resList = []
        for r in rows:
            res = {}

            res['method'] = r[0]
            res['headers'] = r[1]
            res['url'] = r[2]
            res['time_stamp'] = addTime2Datetime(r[3], 2)
            res['response_status'] = r[4]
            res['response_status_text'] = r[5]
            res['content_hash'] = r[8]
            res['visit_id'] = str(root_site_id) + '_' + str(subpage_id)

            etld = tldextract.extract(r[2])
            res['etld'] = etld.domain + '.' + etld.suffix

            res['request_id'] = r[9]
            res['site_id'] = root_site_id
            res['subpage_id'] = subpage_id
            res['browser_id'] = getMode()

            resList.append(res)

        return resList
    except:
        logger.exception(f"{root_site_id} getResponses")


def getCookies(root_site_id, visit_id, database):
    try:
        # Check if in_cookiejar column already exists
        columns_info = getSQLItems("PRAGMA table_info(javascript_cookies)",root_site_id, database)
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

        query = """
		select expiry, is_secure, is_http_only, same_site, name, host, path, 
		time_stamp, c.visit_id, value, first_party_domain, is_session, is_host_only, s.site_rank, record_type, change_cause, in_cookiejar, event_ordinal
            from javascript_cookies as c inner join site_visits as s on s.visit_id = c.visit_id;
            """
        rows = getSQLItems(query, root_site_id, database)

        cookieList = []

        for r in rows:
            cookie = {}
            cookie['expiry'] = addTime2Datetime(r[0], 2)
            cookie['is_secure'] = r[1]
            cookie['is_http_only'] = r[2]
            cookie['same_site'] = r[3]
            cookie['name'] = r[4]
            cookie['host'] = r[5]
            cookie['path'] = r[6]
            cookie_date = r[7]
            # timedelta(hours=2)
            cookie['time_stamp'] = addTime2Datetime(r[7], 2)
            cookie['site_id'] = root_site_id  # r[8] #by openwpm
            cookie['is_host_only'] = r[12]
            cookie['is_session'] = r[11]
            cookie['value'] = r[9]
            #cookie['is_third_party'] = isThirdParty(root_site_url, r[10])
            cookie['record_type'] = r[14]
            cookie['change_cause'] = r[15]
            cookie['in_cookiejar'] = r[16]

            cookie['hold_id'] = None #isPossibleId(r[4])

            cookie['visit_id'] = str(root_site_id) + '_' + str(r[13])

            cookie['browser_id'] = getMode()
            cookie['category'] = ""
            cookie['event_ordinal'] = r[17]
            cookieList.append(cookie)
        return cookieList
    except:
        logger.exception(f"{root_site_id} getCookies")


def getRequests(root_site_id, visit_id,subpage_id, database):
    try:
        query = "SELECT method, headers, url, time_stamp, is_XHR, referrer, post_body, browser_id, visit_id, is_third_party_channel, is_third_party_to_top_window, resource_type, top_level_url, window_id, tab_id, frame_id, parent_frame_id, frame_ancestors,  request_id, triggering_origin, loading_origin, loading_href, req_call_stack, post_body, post_body_raw FROM http_requests WHERE visit_id = " + str(visit_id) +";"
        rows = getSQLItems(query, root_site_id, database)
        reqList = []
        for r in rows:
            req = {}
            req['method'] = r[0]
            req['headers'] = r[1]
            req['url'] = r[2]
            req['time_stamp'] = addTime2Datetime(r[3], 2)
            req['is_XHR'] = r[4]
            req['referrer'] = r[5]
            req['body'] = r[6]

            req['is_third_party_channel'] = isThirdParty(
                r[12], r[2])  # req['is_third_party_channel'] = r[9]

            req['is_third_party_to_top_window'] = r[10]

            req['resource_type'] = r[11]
            if r[11] == 'websocket':
                req['is_websocket'] = 1
            else:
                req['is_websocket'] = 0
            req['top_level_url'] = r[12]
            req['window_id'] = r[13]
            req['tab_id'] = r[14]
            req['frame_id'] = r[15]
            req['parent_frame_id'] = r[16]
            req['frame_ancestors'] = r[17]
            req['request_id'] = r[18]
            req['triggering_origin'] = r[19]
            req['loading_origin'] = r[20]
            req['loading_href'] = r[21]
            req['req_call_stack'] = r[22]
            req['post_body'] = r[23]
            req['post_body_raw'] = r[24]

            req['site_id'] = root_site_id
            req['visit_id'] = str(root_site_id) + '_' + str(subpage_id)
            req['subpage_id'] = subpage_id
            req['browser_id'] = getMode()
            #req['easylist_blocked'] = False #RULES_EASYLIST.should_block(r[2])
            #req['easylist_privacy_blocked'] = False #RULES_EASYLIST.should_block(r[2])
            etld = tldextract.extract(r[2])
            req['etld'] = etld.domain + '.' + etld.suffix
            #req['pi_hole_blocked'] = False #etld in PI_RULES
            reqList.append(req)
        return reqList
    except:
        logger.exception(f"{root_site_id} getRequests")

def getVisitID(root_site_id, database):
    query = """ SELECT 
                        visit_id    
                    FROM 
                        site_visits
                        ORDER BY 
                        site_rank ASC; """
    return pd.DataFrame(getSQLItems(query, root_site_id, database), columns=['visit_id'])['visit_id'].tolist()

def insertIntoPostgreSQL(table, data, root_site_id):
    #try:
    columns = list(data[0].keys())
    column_string = ','.join(columns)
    rows = [tuple(row[col] for col in columns) for row in data]
    query = f"INSERT INTO {table} ({column_string}) VALUES %s"
    #except Exception as e:
    #    logger.exception(f"Error while preprocessing data for {table} on {root_site_id}")

    try:
        conn = psycopg2.connect(CONSTRING)
        cur = conn.cursor()
        execute_values(cur, query, rows)
        conn.commit()
        cur.close()
        conn.close()
        logger.debug(f"Successfully insert data into {table} on {root_site_id}")
    except Exception as e:
        logger.exception(f"Error while trying to insert data into {table} on {root_site_id}")
############################################################

########################## MAIN ############################
if __name__ == '__main__':
    for folder in tqdm(FOLDER_W_PATH, total=len(FOLDER_W_PATH), desc='Processing SQLite Databases'):
        sqlite_database = glob(os.path.join(folder, NAME_DATABASE))[0] # return name of the database + path
        folder_name = os.path.basename(folder)

        already_analyzed = list()
        for entry in ALREADY_ANALYZED:
            if str(entry['id']) == str(folder_name):
                already_analyzed.append(entry['table'])

        if len(already_analyzed) != 4:

            visit_ids = getVisitID(folder_name, sqlite_database)

            req = list()
            res = list()
            cookies = list()
            js = list()

            # Get data from the side
            for subpage_id, visit_id in enumerate(visit_ids):
                if 'requests' not in already_analyzed:
                    _req = getRequests(folder_name, visit_id, subpage_id, sqlite_database)
                    req += _req

                if 'responses' not in already_analyzed:
                    _res = getResponses(folder_name, visit_id, subpage_id, sqlite_database)
                    res += _res

                if 'cookie' not in already_analyzed:
                    _cookies = getCookies(folder_name, visit_id, sqlite_database)
                    cookies += _cookies

                if 'javascript' not in already_analyzed:
                    _js = getJavascript(folder_name, visit_id, subpage_id, sqlite_database)
                    js += _js

            if len(req) > 0:
                insertIntoPostgreSQL('requests', req, folder_name)

            if len(res) > 0:
                insertIntoPostgreSQL('responses', res, folder_name)

            if len(cookies) > 0:
                insertIntoPostgreSQL('cookie', cookies, folder_name)

            if len(js) > 0:
                insertIntoPostgreSQL('javascript', js, folder_name)


