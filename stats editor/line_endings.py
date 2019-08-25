

import json
import os


for i in os.listdir(".\\stats"):
    with open(f".\\stats\\{i}") as f:
        JSON_DATA = json.load(f)

    with open(f".\\stats\\{i}", "w") as f:
        f.write(json.dumps(JSON_DATA, indent=4, sort_keys=True))