import csv
import json


def parse_cell(value):
    s = (value or "").strip().strip("[]")
    return [x.strip() for x in s.split(",") if x.strip()]


with open("cookiegraph.json", "r", encoding="utf-8") as f:
    cookiegraph = json.load(f)

cg_cookies = {
    cookie
    for domain_data in cookiegraph.values()
    if isinstance(domain_data, dict)
    for cookie in domain_data.keys()
}

our_cookies = set()
with open("sst.csv", "r", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        for col in ("cookies_cleaned", "cookies_cleaned_1"):
            our_cookies.update(parse_cell(row.get(col)))

our_non_empty = {c for c in our_cookies if c}
cg_non_empty = {c for c in cg_cookies if c}

exact_overlap = len(our_cookies & cg_cookies)
prefix_overlap = sum(
    1 for c in our_non_empty if any(c.startswith(p) for p in cg_non_empty)
)
reverse_prefix = sum(
    1 for c in cg_non_empty if any(c.startswith(p) for p in our_non_empty)
)

print(f"Unique cookies von CookieGraph: {len(cg_cookies)}")
print(f"Unique cookies von uns: {len(our_cookies)}")
print()
print(
    f"Exact overlap: {exact_overlap} / {len(our_cookies)} = "
    f"{exact_overlap / len(our_cookies) * 100:.2f}%"
)
print(
    f"Prefix overlap: {prefix_overlap} / {len(our_cookies)} = "
    f"{prefix_overlap / len(our_cookies) * 100:.2f}%"
)
print(
    f"Rev. Prefix (CookieGraph in unseren Daten): "
    f"{reverse_prefix} / {len(cg_cookies)} = "
    f"{reverse_prefix / len(cg_cookies) * 100:.2f}%"
)
