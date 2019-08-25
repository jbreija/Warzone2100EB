# Formatting from Warzone stats editor is not readable. This script makes the .json files readable
import json
import os

for each_file in os.listdir(".\\stats"):
    with open(f".\\stats\\{each_file}") as f:
        JSON_DATA = json.load(f)

    with open(f".\\stats\\{each_file}", "w") as f:
        f.write(json.dumps(JSON_DATA, indent=4, sort_keys=True))