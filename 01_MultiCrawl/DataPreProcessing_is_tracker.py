import os
import glob
import time
import multiprocessing
import socket
import re
from google.cloud import bigquery
from adblockparser import AdblockRules
from datetime import datetime
from tqdm import tqdm


PATH_TO_BLOCKLISTS = os.path.join(os.getcwd(), 'resources', 'filterlists')

def getEasyListRules():
    print("Reading rules from filter lists")
    filterlists = glob.glob(PATH_TO_BLOCKLISTS + "/*.txt")

    d = dict()

    for filterlist in tqdm(filterlists, desc="Reading filterlists..."):
        name = os.path.basename(filterlist).replace('.txt', '')

        if "Indian" in name:
            name = name.replace('_cleaned', '')

        with open(filterlist, encoding="utf-8") as f:
            raw_rules = f.read().splitlines()

        # blocker = AdblockRules(raw_rules, use_re2=True,
        #                      max_mem=512*1024*1024)

        try:
            blocker = AdblockRules(raw_rules, use_re2=False,
                                 max_mem=512*1024*1024)
            #blocker = AdblockRules(raw_rules)
            d[name] = blocker
        except Exception as e:
            print("Error in ", name, e)



    return d

# def rule_to_regex(rule):
#     """
#     Convert AdBlock rule to a regular expression.
#     """
#     if not rule:
#         return rule
#
#     # Check if the rule isn't already regexp
#     if rule.startswith('/') and rule.endswith('/'):
#         if len(rule) > 1:
#             rule = rule[1:-1]
#         else:
#             raise AdblockParsingError('Invalid rule')
#         return rule
#
#     # escape special regex characters
#     rule = re.sub(r"([.$+?{}()\[\]\\])", r"\\\1", rule)
#
#     # XXX: the resulting regex must use non-capturing groups (?:
#     # for performance reasons; also, there is a limit on number
#     # of capturing groups, no using them would prevent building
#     # a single regex out of several rules.
#
#     # Separator character ^ matches anything but a letter, a digit, or
#     # one of the following: _ - . %. The end of the address is also
#     # accepted as separator.
#     rule = rule.replace("^", "(?:[^\w\d_\-.%]|$)")
#
#     # * symbol
#     rule = rule.replace("*", ".*")
#
#     # | in the end means the end of the address
#     if rule[-1] == '|':
#         rule = rule[:-1] + '$'
#
#     # || in the beginning means beginning of the domain name
#     if rule[:2] == '||':
#         # XXX: it is better to use urlparse for such things,
#         # but urlparse doesn't give us a single regex.
#         # Regex is based on http://tools.ietf.org/html/rfc3986#appendix-B
#         if len(rule) > 2:
#             #          |            | complete part     |
#             #          |  scheme    | of the domain     |
#             rule = r"^(?:[^:/?#]+:)?(?://(?:[^/?#]*\.)?)?" + rule[2:]
#
#     elif rule[0] == '|':
#         # | in the beginning means start of the address
#         rule = '^' + rule[1:]
#
#     # other | symbols should be escaped
#     # we have "|$" in our regexp - do not touch it
#     rule = re.sub("(\|)[^$]", r"\|", rule)
#
#     return rule
#
# def getEasyListRules():
#     print("Reading rules from filter lists")
#     filterlists = glob.glob(PATH_TO_BLOCKLISTS + "/*.txt")
#
#     d = dict()
#
#     for filterlist in filterlists:
#         name = os.path.basename(filterlist).replace('.txt', '')
#
#         if "Indian" in name:
#             name = name.replace('_cleaned', '')
#
#         with open(filterlist, encoding="utf-8") as f:
#             raw_rules = f.read().splitlines()
#
#         raw_rules_clean = [rule for rule in raw_rules if not rule.startswith(('!', '[Adblock'))]
#
#
#         rules = list()
#         for rule in tqdm(raw_rules_clean, desc="Add rules to dict"):
#             rule = rule_to_regex(rule)
#             rules.append(rule)
#
#         d[name] = rules
#
#     return d



seq = ' (group_id = 1 or group_id = 2) and processed is null'
thread_count = 128 # erhähen!
chunk_size = 250
limit_size = 100

rules_per_region = getEasyListRules()

#rules = AdblockRules(getEasyListRules(), use_re2=True,
#                     max_mem=512*1024*1024)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getcwd() + \
    '/resources/google.json'
client = bigquery.Client()


def get_browser_id():
    hostname = socket.gethostname()

    if hostname == 'measurement-1':
        return ['1']
    elif hostname == 'measurement-2':
        return ['2']
    elif hostname == 'measurement-3':
        return ['3']
    elif hostname == 'measurement-4':
        return ['4']
    elif hostname == 'measurement-5':
        return ['5']
    elif hostname == 'measurement-6':
        return ['6']
    elif hostname == 'measurement-7':
        return ['7']
    elif hostname == 'measurement-8':
        return ['8']
    elif hostname == 'measurement-9':
        return ['9']
    elif hostname == 'measurement-10':
        return ['10']
    elif hostname == 'measurement-11':
        return ['11']
    elif hostname == 'measurement-12':
        return ['12']
    elif hostname == 'measurement-13':
        return ['13']
    elif hostname == 'measurement-14':
        return ['14']
    elif hostname == 'measurement-15':
        return ['15']
    elif hostname == 'measurement-16':
        return ['16']
    elif hostname == 'measurement-17':
        return ['17']
    elif hostname == 'measurement-18':
        return ['18']
    elif hostname == 'measurement-19':
        return ['19']
    elif hostname == 'measurement-20':
        return ['20']
    elif hostname == 'measurement-21':
        return ['21']
    elif hostname == 'measurement-22':
        return ['22']
    elif hostname == 'measurement-23':
        return ['23']
    elif hostname == 'measurement-24':
        return ['24']
    elif hostname == 'measurement-25':
        return ['25']
    elif hostname == 'measurement-26':
        return ['26']
    elif hostname == 'measurement-27':
        return ['27']
    elif hostname == 'measurement-28':
        return ['28']
    elif hostname == 'measurement-29':
        return ['29']
    elif hostname == 'measurement-30':
        return ['30']
    elif hostname == 'measurement-31':
        return ['31']
    elif hostname == 'measurement-32':
        return ['32']
    elif hostname == 'measurement-33':
        return ['33']
    elif hostname == 'measurement-34':
        return ['34']
    elif hostname == 'measurement-35':
        return ['35']
    elif hostname == 'measurement-36':
        return ['36']
    elif hostname == 'measurement-37':
        return ['37']
    elif hostname == 'measurement-38':
        return ['38']
    elif hostname == 'measurement-39':
        return ['39']
    elif hostname == 'measurement-40':
        return ['40']
    elif hostname == 'measurement-41':
        return ['41']
    elif hostname == 'measurement-42':
        return ['42']
    elif hostname == 'measurement-43':
        return ['43']
    elif hostname == 'measurement-44':
        return ['44']
    elif hostname == 'measurement-45':
        return ['45']
    elif hostname == 'measurement-46':
        return ['46']
    elif hostname == 'measurement-47':
        return ['47']
    elif hostname == 'measurement-48':
        return ['48']
    elif hostname == 'measurement-49':
        return ['49']
    elif hostname == 'measurement-50':
        return ['50']
    elif hostname == 'measurement-filsterlists':
        return ['50']
    # else:
    #     return ['openwpm_native_us', 'openwpm_native_cn', 'openwpm_native_jp', 'openwpm_native_in', 'openwpm_native_de', 'openwpm_native_no', 'openwpm_native_fr', 'openwpm_native_il', 'openwpm_native_ae']

def pushRows(p_tableID, p_rows, p_timeout=60):
    table_id = p_tableID

    #print(table_id, p_rows)

    try:
        errors = client.insert_rows_json(table_id, p_rows, timeout=p_timeout)
        if errors == []:
            print('pushed rows to BigQuery:' +
                  p_tableID + ': ' + str(len(p_rows)))
        else:
            raise Exception(
                p_tableID + ": Encountered errors while inserting rows: {}".format(errors))
    except:
        print('error while pushing.. retry..')
        errors = client.insert_rows_json(table_id, p_rows, timeout=30)
        if errors == []:
            print('pushed rows to BigQuery:' +
                  p_tableID + ': ' + str(len(p_rows)))
        else:
            raise Exception(
                p_tableID + ": Encountered errors while inserting rows: {}".format(errors))


def startWithBQ():
    if isinstance(get_browser_id(), list):
        for browser_id in tqdm(get_browser_id(), desc='Browser IDs'):
            #query = "SELECT id, url FROM diff.tmp_requests_tracker where " + \
            #    str(seq) #+ " LIMIT " + str(limit_size)
            #query="select * from preprocessing.is_tracker_2 "
            query=f"select distinct(url) from measurement.tmp_distinct_requests where url NOT IN(  SELECT     url   FROM     measurement.tmp_requests_tracker_processed) and cat={browser_id} limit 100"#00000"
            query_job = client.query(query)
            try:
                rows_BQ = query_job.result().to_dataframe().values.tolist()
                print('query data loaded.')
            except Exception as e:
                print(e)
                print('error')


            totalRow = len(rows_BQ)
            print("Total Rows: ", totalRow)
            avarageRows = int(totalRow/thread_count)

            rows = []

            for item in rows_BQ:
                rows.append([item[0]])

            del rows_BQ

            splittedRows = []
            for i in range(thread_count):
                if i == len(range(thread_count))-1:
                    splittedRows.append(rows)
                else:
                    splittedRows.append(rows[0:avarageRows])
                    del rows[0:avarageRows]

                print("splittedRows count: " + str(len(splittedRows)))
                print("row count: " + str(len(rows)))

            for item in splittedRows:
                p1 = multiprocessing.Process(
                    target=doAnalyse, args=(item,browser_id,))
                p1.start()
    else:
        print("Error")


def doAnalyse(rows, browser_id):
    reqList = []
    for item in tqdm(rows, desc="Processing URLs"):
        r = {}
        r['url'] = item[0]
        r['json'] = dict()
        r['browser_id'] = ""
        r['rules'] = dict()

        #print(len(rules_per_region))
        b = False
        pattern = ""
        for region, rules in tqdm(rules_per_region.items(), desc="Analyze rules per region"):
            #for rule in tqdm(rules, desc="Processing rules for URL"):
                #print("Search in ",item, "with", rule, type(rule))#
            b, pattern = rules.should_block(item[0])
                #b, pattern = re2.search(rule, item[0])

                # if b:
                #     continue

            #print(f"Should block", b)

            r['json'][region] = b

            if not b:
                r['rules'][region] = ""
            else:
                #print(url[1])
                r['rules'][region] = pattern

            #r['json'][region] = int(rules.should_block(item[0])) # Skript erweiterun um Regel abzufangen und auszugeben -> Speichren in Datenbank


        r['json'] = str([r['json']])
        r['rules'] = str([r['rules']])
        reqList.append(r)

        if len(reqList) > chunk_size:
            pushRows('measurement.tmp_requests_tracker_processed', reqList)
            reqList = []

    exit()
    pushRows('measurement.tmp_requests_tracker_processed', reqList)


if __name__ == '__main__':
    startWithBQ()
