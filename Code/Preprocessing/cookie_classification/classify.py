import os
import pandas as pd
import time
import sqlite3
import os
import logging
import psycopg2
from glob import glob
from tqdm import tqdm

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

def getCookies():
    return glob(os.path.join(os.getcwd(), 'cookies', 'llm_analysis.csv'))


def getCat(name):

    import requests
    import re
    url = "https://cookiepedia.co.uk/cookies/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}

    full_url = url + name

    req = requests.get(full_url, headers=headers)
    if req.status_code != 200:
        pass

    lbl_cat = ''

    response = req.content.decode('utf8')
    if response.find('<strong>Strictly Necessary</strong>') != -1:
        lbl_cat = "Strictly Necessary"
    if response.find('<strong>Targeting/Advertising</strong>') != -1:
        lbl_cat = "Targeting/Advertising"
    if response.find('<strong>Unknown</strong>') != -1:
        lbl_cat = "Unknown"
    if response.find('<strong>Functionality</strong>') != -1:
        lbl_cat = "Functionality"
    if response.find('<strong>Performance</strong>') != -1:
        lbl_cat = "Performance"
    if response.find('<span data-translate="error">Error</span>') != -1:
        lbl_cat = "Rate Limited"
    return lbl_cat

def run(df):
    cookie_classified = list()
    for index, row in tqdm(df.iterrows(), total=len(df), desc="Classify Cookies..."):
        cookie_name = row['name']
        cookie_classified.append({'cookie_name':cookie_name, 'category':getCat(cookie_name)})
        time.sleep(10)

        df = pd.DataFrame.from_records(cookie_classified)
        df.to_csv('cookies_classified.csv', index=False, mode='a', header=False)

#def update(cookie, cat):


def run_2():
    files = getCookies()
    df = pd.DataFrame()
    for file in tqdm(files, total=len(files), desc="Reading files..."):
        _df = pd.read_csv(file)
        df = pd.concat([df, _df], ignore_index=True)


    #cookie_names = [row[0] for row in data]

    from pathlib import Path

    if not Path("cookies_classified_16_25.csv").is_file():
        f = open("cookies_classified_16_25.csv", 'x')
    out_path = Path("cookies_classified_16_25.csv")
    write_header = not out_path.exists()

    if not write_header:
        check_df = pd.read_csv(out_path)
        already_checked_cookies = check_df['cookie_name'].tolist()
    else:
        already_checked_cookies = []

    name_log = []
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Classify Cookies..."):
        try:
            cookie = row["name"]
            if cookie not in already_checked_cookies:
                name_log.append(cookie)
                category = getCat(cookie)  # must return a scalar/string

                time.sleep(10)

                if category == "Rate Limited":
                    logger.info(f"{cookie}, {category}")
                    time.sleep(900)

                # build a one-row frame with the desired columns
                pd.DataFrame(
                    [[cookie, category]],
                    columns=["cookie_name", "category"]
                ).to_csv(
                    out_path,
                    index=False,
                    mode="a",
                    header=write_header
                )
                write_header = False  # only write header for the very first write
                print("Wrote one row")

        except Exception as e:
            print("Error:", e)
            with open("cookie_log.txt", "a", encoding="utf-8") as f:
                for n in name_log:
                    f.write(n + "\n")
            name_log.clear()  # avoid re-logging the same names


def recheck():
    f = os.path.join(os.getcwd(), "cookiepedia_cookies_classified.csv")
    df = pd.read_csv(f)
    df.columns = df.columns.str.replace('\ufeff', '', regex=False).str.strip()
    df = df.fillna('')

    for index, row in tqdm(df.iterrows(), total=len(df), desc='Rechecking cookies'):
        cookie_name = row['name']
        cookie_cat = row['category']

        if cookie_cat == "":
            category = getCat(cookie_name)

            if category != cookie_cat:
                df.loc[df['name'] == cookie_name] = category
                df.to_csv("recheck.csv", index=False, header=False)




if __name__ == "__main__":
    #path = os.path.join(os.getcwd(), 'cookie_wo_classification.csv')
    #cookies_to_classify = pd.read_csv(path)
    #cookies_to_classify['category'] = ""

    #run(cookies_to_classify)

    run_2()

    #recheck()
