import json

with open('data/objects.json', 'r', encoding='utf-8') as f:
    objs = json.load(f)

print(f"Total: {len(objs)}")
print("| # | Object Name | Celestial Body | Year | Category | Location Accuracy | Verified Status |")
print("| :--- | :--- | :---: | :---: | :--- | :---: | :---: |")
for i, o in enumerate(objs, 1):
    ver = "✅ Verified" if o['verified'] else "⚠️ Unverified (TODO: verify)"
    print(f"| {i} | {o['name']} | {o['body']} | {o['year']} | {o['category']} | {o['location_accuracy']} | {ver} |")

unver = [o for o in objs if not o['verified']]
print("\n### Items Requiring Manual Verification (verified: false / TODO: verify)\n")
for u in unver:
    print(f"- **{u['name']}** ({u['body']} • {u['year']}):")
    print(f"  - **ID**: `{u['id']}`")
    print(f"  - **Category**: `{u['category']}` | **Status**: `{u['status']}` | **Location Accuracy**: `{u['location_accuracy']}`")
    print(f"  - **Coordinates in DB**: Lat `{u['lat']}`, Lon `{u['lon']}`")
    print(f"  - **Notes & Reason**: {u['where']}")
