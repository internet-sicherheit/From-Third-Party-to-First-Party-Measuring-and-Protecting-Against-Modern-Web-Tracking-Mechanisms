########################## IMPORTS #########################
import sys
import re
import os
import logging
import psycopg
import sqlite3
import numpy as np
import pandas as pd
from glob import glob
from tqdm import tqdm
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

########################## PATHS ############################
PROFILE_BASEPATH = os.path.join(os.getcwd(), 'profiles', 'openwpm')
PROFILE_FOLDERS = os.listdir(PROFILE_BASEPATH)
############################################################

########################## VARIABLES #######################
# Connection string for the PostgreSQL database
CONSTRING = "user=sst  password=oHg10&c15#!- host=194.94.127.116 port=5432 dbname=sst_visit_sites"
############################################################

########################## DATA PROCESSING #################
def get_sqlite_db(path):
    return os.path.join(path, 'crawl-data.sqlite')
############################################################

########################## DATABASE PROCESSING #############
def db_connect(conString=CONSTRING):
    """
    Connect to the PostgreSQL database and return a connection
    :param conString: Connection string
    :return: connection
    """
    try:
        connection = psycopg.connect(conString)
        cr = connection.cursor()
        connection.autocommit = True
        logger.debug("Successfully connected to postgres database")
        return cr
    except (Exception, psycopg.Error) as error:
        logger.exception(f"Error while connecting to PostgreSQL: {error}")


def getSQLItems(query, root_site_id, is_script=False):
    try:
        sqliteConnection = sqlite3.connect()
        cursor = sqliteConnection.cursor()

        if is_script:
            rows = cursor.executescript(query).fetchall()
        else:
            rows = cursor.execute(query).fetchall()
        sqliteConnection.close()
        return rows
    except Exception as e:
        print(e)

############################################################


if __name__ == '__main__':
    for folder in PROFILE_FOLDERS:
        db = get_sqlite_db(folder)