import json
from backend.routes.objects import SpaceObject

with open('data/objects.json', 'r', encoding='utf-8') as f:
    objs = json.load(f)

print(f"Checking {len(objs)} objects...")
errors = 0
for i, o in enumerate(objs):
    try:
        SpaceObject(**o)
    except Exception as e:
        print(f"Error on item {i} ({o.get('id')}): {e}")
        errors += 1

if errors == 0:
    print("All objects passed Pydantic validation successfully!")
