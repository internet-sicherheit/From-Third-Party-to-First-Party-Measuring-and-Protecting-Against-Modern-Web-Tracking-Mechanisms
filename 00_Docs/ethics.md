# Ethical Considerations

This document summarizes the ethical considerations of the data
collection process, adapted from Section 7 ("Ethics, Limitations, and
Threats to Validity") of the paper *"From Third-Party to First-Party:
Measuring and Protecting Against Modern Web Tracking Mechanisms"*
(ACSAC 2026).

## No Personal Data of End Users

The crawls were performed with fresh, stateless browser profiles. No
user accounts were created, no logins were performed, and no real
users interacted with the crawler. The dataset therefore contains no
personal data of end users; it reflects only content and behavior that
websites deliver to any first-time visitor. Consequently, the study
does not involve human subjects, and no IRB / ethics board approval
was required.

## Resource Usage of Crawled Sites

As with all large-scale Web measurement studies, running the crawler
generates traffic and consumes resources of the hosting parties of the
analyzed sites (e.g., energy) that could otherwise be used
differently. Furthermore, visited pages might serve ads to the
crawler, thereby consuming a portion of advertisers' ad budgets. Since
each crawler visits each page only once, we consider these effects
minor; this trade-off is widely accepted within the Web measurement
community.

## Consent Banner Interaction

To observe realistic tracking behavior, the crawler used a modified
version of the Consent-O-Matic browser extension to accept all cookies
on visited pages. This interaction is automated and affects only the
crawler's own (stateless) browsing session; no consent decisions were
made on behalf of any real user.

## Environmental Footprint

The analysis was performed using Google BigQuery. As with other cloud
providers and local computation, this creates a CO2 footprint for
storing the data and running the analysis code. According to the
BigQuery Carbon Footprint calculator, the experiment generated roughly
1,000 kg of CO2.

## Dataset Release

The released dataset contains data that websites expose publicly to
any visitor (cookies, requests, JavaScript resources). It contains no
end-user data and no non-public information about site operators
beyond what any browser would observe. Cookie values in the released
dataset are the values set for the crawler's own sessions.

## Responsible Use

The artifact classifies cookies and scripts as tracking-capable under
the criteria defined in the paper. These classifications are research
results, not legal determinations (e.g., under GDPR / ePrivacy), and
must not be used to make compliance claims about individual sites or
operators (see the artifact's intended-use statement in the README).