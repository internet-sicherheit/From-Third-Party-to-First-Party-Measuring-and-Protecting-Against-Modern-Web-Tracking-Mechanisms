# Towards Understanding Server-Side Tracking Ecosystems
The project contains the code for the server side tracking crawler.

## Table of Contents
- [Technical Setting](#Technical-Settings)
  - [Extension](#Extension)
  - [Changes in MultiCrawl/OpenWPM](#Changes-in-MultiCrawl/OpenWPM)
- [Database Schema](#Database-Schema)
- [Cite our work](#Cite-our-work)

## Technical Settings
### Extension
- Get XPI for Consent-O-Mat
- Unpack XPI
- Change the default settings to "accept all"
- [Path to the extension folder](/01_MultiCrawl/resources/extensions)

### Changes in MultiCrawl/OpenWPM
#### [01_MultiCrawl/openwpm/conifg.py](01_MultiCrawl/openwpm/conifg.py)
Set the default value for stealth_js and change tp_cookies to never.
```
stealth_js_instrument: bool = False
...
tp_cookies: str = "never"
```

#### [01_MultiCrawl/custom_command.py](01_MultiCrawl/custom_command.py)
Change names for the extension that should be used:
```
if browser_config == 'omaticall':
   ext_path = ext_path + "consent_o_matic-accept_all_1.1.3.xpi"
   webdriver.install_addon(ext_path)
```

#### [01_MultiCrawl/DBOps.py](01_MultiCrawl/DBOps.py)
- Change _conString_ variable to the data for the PostgreSQL database

#### [01_MultiCrawl/Ops.py](01_MultiCrawl/Ops.py)
- Change _getSitesTableName()_ method to return the table name for each location
```
def getSitesTableName():
    host_name = socket.gethostname()
    if host_name == 'measurement_usa_1':
        return 'measurement_us_1'
    elif host_name == 'measurement_usa_1':
        return 'measurement_us_2'
    elif host_name == 'measurement_eu_1':
        return 'measurement_eu_1'
    elif host_name == 'measurement_eu_1':
        return 'measurement_eu_2'
```

#### [01_MultiCrawl/setup.py](01_MultiCrawl/setup.py)
- Change the _getMode()_ method, the extension 'omaticall' instructs the framework to use the extension measuremt
```
def getMode():

    if os.name == 'nt':
        # return "chrome_interaction_ger"
        return "windows"

    host_name = socket.gethostname()

    if host_name == 'measurement_usa_1':
        return 'openwpm_native_usa1_omaticall'
    elif host_name == 'measurement_usa_1':
        return 'openwpm_native_usa2_omaticall'
    elif host_name == 'measurement_eu_1':
        return 'openwpm_native_eu1_omaticall'
    elif host_name == 'measurement_eu_1':
        return 'openwpm_native_eu2_omaticall'


    return 0
```
- Please note, that the '_omaticall' have to also added in the PostgreSQL database!
- Since we measure located in Germany, we use a VPN and need to evaluate if the VPN connection is still established
- turn on 
```
def getConfig(name):
    params = {...
              "support_vpn":True
              }
```


#### [01_MultiCrawl/CrawlerOpenWPM_Wrapper.py](01_MultiCrawl/CrawlerOpenWPM_Wrapper.py)
- Add or change into for-loop:
```
...
# Record JS Web API calls
browser_param.js_instrument = True # changed
...
browser_param.channel_id = True  # Added
browser_param.content_script_instrument = True  # Added
browser_param.save_content = "script"  # Added
browser_param.stealth_js_instrument = True  # Added
```
- Add _LocalGzipProvider to the TaskManager
```
with TaskManager(
        manager_params,
        browser_params,
        SQLiteStorageProvider(
            Path("./profiles/openwpm/" + site_ID + "/crawl-data.sqlite")),
            LocalGzipProvider(Path("./profiles/openwpm/" + site_ID + "/sources/"))
    ) as manager:
```

#### [01_MultiCrawl/CrawlerOpenWPM.py](01_MultiCrawl/CrawlerOpenWPM.py)
- To persist the script data, comment the
```
delFolder(getProfileFolder(root_site_id)) -> #delFolder(getProfileFolder(root_site_id))
```
- may reduce the storage overhead by removing the SQLite database but keep the data
- In method _loadVisitList(...)_ uncomment:
```
#visit.javascript = getJavascript( 
       #root_site_id, visit_id_openwpm, subpage_id) -> visit.javascript = getJavascript (...)
```
- In method _getResponses(...)_ bug fix: content_hash got overwritten by wrong relation
```
res['content_hash'] = r[9] -> res['request_id'] = r[9]
```
- Update the SQL query in the method _getJavaScript(...)_ , bug fix: in earlier versions the query selected from the wrong table
```
query = "SELECT incognito, event_ordinal, page_scoped_event_ordinal, window_id , tab_id, frame_id, " \
                "script_url, script_line, script_col, func_name, script_loc_eval, document_url," \
                "top_level_url, call_stack, symbol, operation, value, arguments , time_stamp from javascript WHERE visit_id= " + \
                str(visit_id)
```

#### [01_MultiCrawl/openwpm/storage/local_storage.py](01_MultiCrawl/openwpm/storage/local_storage.py)
- Add the script [SimHash2](01_MultiCrawl/openwpm/storage/simhash2.py) to the folder
- Change the _LocalGzipProvider_ code:
```
import re
from simhash2 import Simhash

class LocalGzipProvider(UnstructuredStorageProvider):
    """Stores files as storage_path/hash.zip"""
  
    ...
  
    def get_features(self, s):
        width = 3  # n_gram = 3

        # Lower and remove single words
        s = s.lower()
        s = re.sub(r'[^a-zA-Z0-9\s]+', '', s)

        # Remove whitespace
        s = re.sub(r'[^\w]+', '', s)
        return [s[i:i + width] for i in range(max(len(s) - width + 1, 1))]



    async def store_blob(
        self, filename: str, blob: bytes, overwrite: bool = False
    ) -> None:
        path = self.storage_path / (filename + ".zip")
        hash_path = self.storage_path / (filename + ".txt")
        if path.exists() and not overwrite:
            self.logger.debug(
                "File %s already exists on disk. Not overwriting", filename
            )
            return
        compressed = self._compress(blob)
        with path.open(mode="wb") as f:
            f.write(compressed.read())

        with hash_path.open(mode="w") as f:
            tmp_content = blob.decode('utf-8')
            content = self.get_features(tmp_content)
            s1 = Simhash(content)
            f.write(str(s1.value))
            
    ...
```
- the added lines of code create a sim hash over the JavaScript and store it in a text file.

#### [01_MultiCrawl/PushOps.py](01_MultiCrawl/PushOps.py)
- Add google.json to 01_MultiCrawl/resources/google.json
- Change GCP and database
- Update method _stream2BQ_: These changes are strictly nessecary to push the JavaScript data into BQ!
```
...
all_javascripts = []
...
for visit in siteData.visitData:
...
   if visit.javascript is not None:
      for item in visit.javascript:
          all_javascripts.append(item)
          
...

# BEGIN JavaScript
        if all_javascripts:
            all_pushed_javascripts = False
            try:
                execBQRows('filterlists.measurement_sst.javascript', all_navigations, 45)
                all_pushed_javascripts = True
            except:
                all_pushed_javascripts = False
                pushError(siteData.site_id, 'push_bulk_javascript')
            if all_pushed_javascripts:
                str()  # update stats
            else:
                for visit in siteData.visitData:
                    javascript = chunkList(visit.javascript, max_row)
                    if javascript is not None:
                        for item in javascript:
                            print(siteData.site_id,
                                        ': pushing chunked javascript: ', str(len(item)))
                            try:
                                execBQRows(
                                            'filterlists.measurement_sst.javascript', item, 15)
                            except:
                                pushError(siteData.site_id,
                                                  'push_javascript', backup_json=item)
        # END JavaScript
```

#### [01_MultiCrawl/Extension/](01_MultiCrawl/Extension/)
- Modify OpenWPM that the _Navigator.Webdriver_ is set to false and OpenWPM will not be detected as bot
- Add the stealth_js to the [webpack.config.js](01_MultiCrawl/Extension/webpack.config.js) file
```
module.exports = {
  entry: {
    ...
    stealth: "./stealth.js/index.js",
  },
```
- Add the folder [stealth.js](01_MultiCrawl/Extension/stealth.js)
- Add stealth.js to the script [_feature.ts_](01_MultiCrawl/Extension/src/feature.ts)
```
config = {
      ...
      stealth_js_instrument:false,
      ...
```

## Classification of Cookies and JavaScript
For the classification of JavaScript, we used SimHash2 to build a hash value over the JavaScript code.

## Machine Learning

## Database Schema
Requests Table:
```
CREATE TABLE requests (
    id INTEGER,
    browser_id TEXT,
    site_id INTEGER,
    subpage_id INTEGER,
    visit_id TEXT,
    url TEXT,
    top_level_url TEXT,
    method TEXT,
    referrer TEXT,
    headers TEXT,
    is_XHR INTEGER,
    is_third_party_channel INTEGER,
    is_third_party_to_top_window INTEGER,
    resource_type TEXT,
    time_stamp TIMESTAMP,
    is_websocket INTEGER,
    body TEXT,
    etld TEXT,
    content_hash TEXT,
    is_tracker INTEGER,
    is_background_req INTEGER,
    in_scope INTEGER,
    window_id BIGINT,
    tab_id BIGINT,
    frame_id BIGINT,
    parent_frame_id BIGINT,
    frame_ancestors TEXT,
    request_id BIGINT,
    triggering_origin TEXT,
    loading_origin TEXT,
    loading_href TEXT,
    req_call_stack TEXT,
    post_body TEXT,
    post_body_raw TEXT,
    easylist_blocked BOOLEAN,
    easylist_privacy_blocked BOOLEAN,
    pi_hole_blocked BOOLEAN
);
```

Response Table:
```
CREATE TABLE responses (
    id INTEGER,
    browser_id TEXT,
    site_id INTEGER,
    subpage_id INTEGER,
    visit_id TEXT,
    url TEXT,
    time_stamp TIMESTAMP,
    response_status TEXT,
    response_status_text TEXT,
    request_id TEXT,
    content_hash TEXT,
    headers TEXT,
    body TEXT,
    etld TEXT,
    method TEXT,
    is_background_response INTEGER,
    is_tracker INTEGER,
    resource_type TEXT,
    in_scope INTEGER
);
```

Cookies Table:
```
CREATE TABLE cookie (
    id TEXT,
    browser_id TEXT,
    site_id INTEGER,
    visit_id TEXT,
    expiry TIMESTAMP,
    is_secure INTEGER,
    is_http_only INTEGER,
    same_site TEXT,
    name TEXT,
    value TEXT,
    host TEXT,
    path TEXT,
    time_stamp TIMESTAMP,
    is_host_only INTEGER,
    is_session INTEGER,
    is_third_party INTEGER,
    is_session_common INTEGER,
    in_scope INTEGER,
    subpage_id INTEGER,
    category TEXT,
    record_type TEXT,
  event_ordinal TEXT,
change_cause TEXT,
in_cookiejar Integer,
hold_id Integer
);
```

JavaScript Table:
```
CREATE TABLE javascript (
    id INTEGER,
    site_id TEXT,
    subpage_id TEXT,
    visit_id TEXT,
    browser_id TEXT,
    request_id TEXT,
    incognito TEXT,
    event_ordinal TEXT,
    page_scoped_event_ordinal TEXT,
    window_id TEXT,
    tab_id TEXT,
    frame_id TEXT,
    script_url TEXT,
    script_line TEXT,
    script_col TEXT,
    func_name TEXT,
    script_loc_eval TEXT,
    document_url TEXT,
    top_level_url TEXT,
    call_stack TEXT,
    symbol TEXT,
    operation TEXT,
    value TEXT,
    arguments TEXT,
    time_stamp TIMESTAMP
);
```

