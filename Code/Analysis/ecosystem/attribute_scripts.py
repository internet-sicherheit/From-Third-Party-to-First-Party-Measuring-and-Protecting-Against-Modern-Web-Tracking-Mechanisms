import os
import pandas as pd
import sys
import os
sys.path.append(os.path.join(os.getcwd(), '..', '..', '..', "02_Data" , "whotracksme"))
from trackerdb import TrackerDB
from tqdm import tqdm

tqdm.pandas()

# Init Tracker DB
DATABASE = TrackerDB()

def add_category(domain) -> str:
    try:
        result = DATABASE.match_domain(domain)
        return result[0]['pattern']['category']
    except IndexError:
        return "Unknown"

def add_org(domain) -> str:
    try:
        result = DATABASE.match_domain(domain)
        return result[0]['pattern']['organization']
    except IndexError:
        return "Unknown"


def main() -> None:
    # Load URLs
    #path = os.path.join(os.getcwd(), 'cluster_script_url_etlds_third_party.csv')
    path = os.path.join(os.getcwd(), 'cluster_script_url_etlds_fp_party.csv')
    df = pd.read_csv(path)

    # Get category
    df['category'] = df['script_url_etld'].progress_apply(add_category)

    # Get org
    df['organization'] = df['script_url_etld'].progress_apply(add_org)

    # Save Store
    df.to_csv('cluster_fp_attribution_store_27112025.csv', index=False)

    # Get all IDs
    cluster_id = set(list(df['cluster'].tolist()))

    # Grouping by IDs
    df_grouped = df.groupby('cluster')

    # Define output list
    output = list()

    max_i = 0

    for id in tqdm(cluster_id, total=len(cluster_id), desc='Grouping cluster...'):
        res = dict()
        res['cluster'] = id

        _df = df_grouped.get_group(id)
        _df = _df.drop(_df[_df['organization'] == 'Unknown'].index)
        values = _df['organization'].value_counts()
        d = values.to_dict()
        total = sum(d.values())

        i = 0
        for k, v in d.items():
            res[f'domain_{i}'] = k
            res[f'value_{i}'] = v
            res[f'share_{i}'] = v / total
            i += 1

        output.append(res)

    output_df = pd.DataFrame(output)
    output_df = output_df.fillna('')
    output_df.to_csv('fp_cluster_attribution_27112025.csv', index=False)

if __name__ == '__main__':
    main()
