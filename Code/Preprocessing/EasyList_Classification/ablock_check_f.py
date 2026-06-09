import os
import pandas as pd
from tqdm import tqdm
from adblockparser import AdblockRules

easylist = os.path.join(os.getcwd(), 'easylist_19052025.txt')
easyprivacy = os.path.join(os.getcwd(), 'easyprivacy_19052025.txt')
ulrs = os.path.join(os.getcwd(), 'set1.csv')
url_df = pd.read_csv(ulrs)
url_list = list(set(url_df['script_url'].tolist()))

def load_rules(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        filters = f.readlines()
    clean_filters = [line.strip() for line in filters if line.strip() and not line.startswith('!')]
    return AdblockRules(clean_filters, use_re2=False)

RULES_EASYLIST = load_rules(easylist)
RULES_EASYPRIVACY = load_rules(easyprivacy)

data = list()
for url in tqdm(url_list, total=len(url_list), desc='checking urls...'):
    try:
        r_e = RULES_EASYLIST.should_block(url)
    except:
        r_e = False

    try:
        r_e_p = RULES_EASYPRIVACY.should_block(url)
    except:
        r_e = False

    data.append({"url":url, 'blocked_easylist':r_e, 'blocked_easyprivacy':r_e_p})


df = pd.DataFrame.from_records(data)
df.to_csv('set1_classified.csv', index=False)