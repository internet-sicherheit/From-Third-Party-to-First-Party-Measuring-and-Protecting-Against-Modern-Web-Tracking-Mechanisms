from abc import get_cache_token
from time import time
from DBOps import DBOps
import os
import json
from requests import get
import socket

import getpass
config_path = os.getcwd() + '/resources/params.json'


def registerMachine():
    db = DBOps()

    if getConfig('browser_mode') == None:
        query = 'SELECT name,has_command FROM modes WHERE state = 0 LIMIT 1'
        row = db.select(query)
        browser_mode = row[0][0]
        has_command = row[0][1]
        setConfig('browser_mode', browser_mode)
        setConfig('has_command', has_command)
        ip_adress = get('https://api.ipify.org').text
        query = "UPDATE modes SET state=1, IP='" + \
            ip_adress + "' WHERE name='" + browser_mode + "'"
        db.exec(query)
    else:
        print('Machine already registered!')


def getMode():

    if os.name == 'nt':
        # return "chrome_interaction_ger"
        return "windows"

    host_name = socket.gethostname()

    if host_name == 'sst-3':
        return 'openwpm_native_us_1_omaticall'
    elif host_name == 'sst-4.if-is.net':
        return 'openwpm_native_us_2_omaticall'
    elif host_name == 'sst-5.if-is.net':
        return 'openwpm_native_eu_1_omaticall'
    elif host_name == 'sst-6.if-is.net':
        return 'openwpm_native_eu_2_omaticall'


    return 0


def getConfig(name):
    params = {
        "bigquery_insert_rows": 500,
        "has_command": False,
        "thread_count": 10,
        "browser_mode_": "openwpm_native_eu",
        "browser_mode": "chrome_desktop_ger",
        "subpage_to_visit": 15,
        "timeout": 30,
        "timeout_site": 1800,
        "timeout_site_min": 30,
        "time_to_sleep": 1,
        "process_name_chrome": "/home/" + getpass.getuser() +"/miniforge3/envs/openwpm/bin/python3 CrawlerChrome.py",
        "process_name_openwpm": "/home/" + getpass.getuser() +"/miniforge3/envs/openwpm/bin/python3 CrawlerOpenWPM.py",
        "resolution": [1920, 1080],
        "resolution_mobile_openwpm": [760, 360],
        "user_agent_chrome":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36",
        "user_agent_openwpm":"Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
        "user_agent_mobile_openwpm": "Mozilla/5.0 (Android 11; Mobile; rv:87.0) Gecko/87.0 Firefox/87.0",
        "user_agent_mobile_chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36",
        "disable_blink_features": "AutomationControlled", # Added
        "modes": [
            "openwpm_interaction_old",
            "openwpm_interaction_1",
            "openwpm_interaction_2",
            "openwpm_desktop",
            "openwpm-headless_interaction"
        ],
        "support_vpn":True

    }
    return params[name]


def setConfig(name, value):
    with open(config_path) as f:
        configs = json.load(f)
    configs[name] = value
    with open(config_path, 'w') as f:
        json.dump(configs, f)


def getDriverPath():
    path = ''
    if os.name == 'nt':
        path = os.getcwd() + '/drivers/chromedriver.exe'
    else:
        path = os.getcwd() + '/drivers/chromedriver'
    return path

def getWorkspacePath():
    return os.getcwd()
