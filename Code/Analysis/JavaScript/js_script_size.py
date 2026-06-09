import os
import numpy as np
from tqdm import tqdm
from glob import glob

DATA = os.path.join(os.getcwd(), '..', '..', '..', '01_MultiCrawl', 'profiles', 'openwpm')
FOLDERS = os.listdir(DATA)

sizes = list()
no_js_sites = 0

for folder in tqdm(FOLDERS, total=len(FOLDERS), desc='Scan folder...'):
    path = os.path.join(DATA, folder, 'sources')
    files = glob(os.path.join(path, '*.zip'))
    if len(files) == 0:
        no_js_sites += 1
    for file in files:
        size = os.path.getsize(file)
        sizes.append(size)


print(f"[Measurement.Overview.JavaScript.2.0] Size of JavaScript files - mean: {np.mean(sizes)}, min: {np.min(sizes)}, max: {np.max(sizes)}, SD: {np.std(sizes)}")
print(f"[Measurement.Overview.JavaScript.2.1] Total size: {np.sum(sizes)}")
print(f"[Measurement.Overview.JavaScript.2.2] Sites without JS : {no_js_sites}")
