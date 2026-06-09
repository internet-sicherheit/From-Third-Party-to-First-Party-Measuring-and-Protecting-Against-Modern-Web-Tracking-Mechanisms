

RQ1: What do we need to analyse to identify server side tagging?

## Methods of server-side tagging
### Full Server Side Tagging
- Google Analytics 4 with GTM
- Own solutions (hard to identify?)

### Hybrid Server-Side Tagging
- Client and server-side tagging

### CNAME Cloaking
- Server side tagging with DNS (CNAME track.example.com -> tracking.thirdparty.com)

### Identification
- Analyse network traffic
- Cookie analysis
- suspicios subdomains

Without CNAME Cloaking, tracking requests needs to send data to the own domain (example.com)
- we need to indentify endpoints for tracking (/collect, /track, /analytics, /events)

#### First-Party Collectors
We need to identify first-party collectors. Those collectors send tracking data to the domain (or subdomain) of the host.
Therefore, we scrape all subdomains from the searched domain e.g., tracker.example.com


### Cookies
Cookie value in first party context with ```_gads```
- did the cookie value change?
- will the cookie be set in every session?

## Install
```
conda create -n google-sst
conda activate google-sst
pip install -r req.txt
```

## Crawling

1. We try to identify server side tracking
-> can we identify server side tracking in the wild?
2. We try to identify client side tracking
-> is no client side tracking an indicator for server side tracking?

### First Approach
We instrument a MITM-Prox to capture traffic from the client to the server.
In this traffic we try to identify tracking-data in e.g., API calls.

Google Tag Manager Server-Side
- https://yourserver.example.com/gtm
- analytics.example.com
- sgtm.example.com
- Regex: ```http(.*)\/gtm.js\?```

GA4 protocol sends data to sGTM
- Networkfilter on ```collect?v=2```
- additional parameters
  - sst.ucsst.rndsst.gse

Facebook Conversion API



#### Custom Headers oder Parameter
* x-client-id
* x-session-id
* x-pageview-id