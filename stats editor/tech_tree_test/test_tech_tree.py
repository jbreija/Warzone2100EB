
import json
import os


START_RESEARCH = ["R-Sys-Sensor-Turret01", "R-Wpn-MG1Mk1", "R-Sys-Engineering01",
                  "R-Vehicle-Prop-Wheels", "R-Vehicle-Body01", "R-Sys-Spade1Mk1"]
RESEARCH_FACILITY = 14  # check researchPoints in structures.json
RESEARCH_MODULE = 7  # check moduleResearchPoints in structures.json
RESULTS_TXT = "results.txt"
RESULTS_XLSX = "results.xlsx"

if "nt" in os.name.lower():
    RESEARCH_JSON = ".\\research.json"
else:
    RESEARCH_JSON = "./research.json"
with open(RESEARCH_JSON) as f:
    JSON_DATA = json.load(f)



RESEARCH_ITEMS_WITH_NO_DEPENDENCY = []
UNFINISHED_RESEARCH = []
NEXT_RESEARCH = {}
CURRENT_RESEARCH = {}
FINISHED_RESEARCH = {}
UPGRADE_DICT = {}
RES_MOD = "R-Struc-Research-Module"

def prepare_research():
    for research_item in START_RESEARCH:
        #if research_item in JSON_DATA:
        CURRENT_RESEARCH[research_item] = JSON_DATA[research_item]['researchPoints']

    for key, value in JSON_DATA.items():
        if "requiredResearch" not in value:
            RESEARCH_ITEMS_WITH_NO_DEPENDENCY.append(key)
        elif key not in START_RESEARCH:
            UNFINISHED_RESEARCH.append(key)

def calculate_dependencies():
    while len(UNFINISHED_RESEARCH) != 0:
        counter = len(UNFINISHED_RESEARCH)
        for key in UNFINISHED_RESEARCH:
            available = True
            shortest_path = []
            for each_item in JSON_DATA[key]['requiredResearch']:
                if each_item in FINISHED_RESEARCH.keys():
                    shortest_path.append(FINISHED_RESEARCH[each_item])
                elif each_item in CURRENT_RESEARCH.keys():
                    shortest_path.append(CURRENT_RESEARCH[each_item])
                else:
                    available = False
                    break

            if available:
                shortest_path = sorted(shortest_path)
                NEXT_RESEARCH[key] = shortest_path[0] + JSON_DATA[key]["researchPoints"]

        for key, value in CURRENT_RESEARCH.items():
            FINISHED_RESEARCH[key] = value
        CURRENT_RESEARCH.clear()

        for key, value in NEXT_RESEARCH.items():
            CURRENT_RESEARCH[key] = value
            UNFINISHED_RESEARCH.remove(key)
        NEXT_RESEARCH.clear()

        if counter == len(UNFINISHED_RESEARCH):
            break

def calculate_upgrades():
    upgrade_string = "R-Struc-Research-Upgrade0"
    UPGRADE_DICT[RES_MOD] = {"points": FINISHED_RESEARCH[RES_MOD],
                             "upgrade": (RESEARCH_FACILITY + RESEARCH_MODULE),
                             "seconds": FINISHED_RESEARCH[RES_MOD]/RESEARCH_FACILITY}

    for x in range(1, 10):
        upgrade_name = f"{upgrade_string}{x}"
        upgrade_value = (JSON_DATA[upgrade_name]["results"][0]["value"] / 100) * RESEARCH_FACILITY
        if x == 1:
            num_points = FINISHED_RESEARCH[upgrade_name]
            upgrade = upgrade_value + UPGRADE_DICT[RES_MOD]['upgrade']
            num_sec = (FINISHED_RESEARCH[upgrade_name]/upgrade_value + UPGRADE_DICT[RES_MOD]['upgrade'])
            UPGRADE_DICT[upgrade_name] = {"points": num_points,
                                           "upgrade": upgrade,
                                          "seconds": num_sec}
        else:
            num_points = FINISHED_RESEARCH[upgrade_name]
            num_prev_points = UPGRADE_DICT[f"{upgrade_string}{x - 1}"]['points']
            upgrade = (upgrade_value + UPGRADE_DICT[f"{upgrade_string}{x - 1}"]['upgrade'])
            num_sec = ((num_points - num_prev_points)/upgrade)+UPGRADE_DICT[f"{upgrade_string}{x - 1}"]['seconds']
            UPGRADE_DICT[upgrade_name] = {"points": num_points,
                                          "upgrade": upgrade,
                                          "seconds": num_sec
                                          }

def apply_upgrades():
    results = {}
    res = "R-Struc-Research-Upgrade0"
    res1 = f"{res}{1}"
    res2 = f"{res}{2}"
    res3 = f"{res}{3}"
    res4 = f"{res}{4}"
    res5 = f"{res}{5}"
    res6 = f"{res}{6}"
    res7 = f"{res}{7}"
    res8 = f"{res}{8}"
    res9 = f"{res}{9}"

    for key, value in FINISHED_RESEARCH.items():
        if FINISHED_RESEARCH[key] < UPGRADE_DICT[RES_MOD]['points']:
            num_seconds = JSON_DATA[key]['researchPoints'] / RESEARCH_FACILITY
            total_seconds = FINISHED_RESEARCH[key] / RESEARCH_FACILITY
        elif UPGRADE_DICT[RES_MOD]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res1]['points']:
            num_seconds = (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[RES_MOD]['upgrade'])
            total_seconds = UPGRADE_DICT[RES_MOD]["seconds"] + num_seconds
        elif UPGRADE_DICT[res1]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res2]['points']:
            num_seconds = (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res1]['upgrade'])
            total_seconds = UPGRADE_DICT[res1]["seconds"] + num_seconds
        elif UPGRADE_DICT[res2]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res3]['points']:
            num_seconds = (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res2]['upgrade'])
            total_seconds = UPGRADE_DICT[res2]["seconds"] + num_seconds
        elif UPGRADE_DICT[res3]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res4]['points']:
            num_seconds = (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res3]['upgrade'])
            total_seconds = UPGRADE_DICT[res3]["seconds"] + num_seconds
        elif UPGRADE_DICT[res4]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res5]['points']:
            num_seconds = (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res4]['upgrade'])
            total_seconds = UPGRADE_DICT[res4]["seconds"] + num_seconds
        elif UPGRADE_DICT[res5]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res6]['points']:
            num_seconds = (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res5]['upgrade'])
            total_seconds = UPGRADE_DICT[res5]["seconds"] + num_seconds
        elif UPGRADE_DICT[res6]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res7]['points']:
            num_seconds = (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res6]['upgrade'])
            total_seconds = UPGRADE_DICT[res6]["seconds"] + num_seconds
        elif UPGRADE_DICT[res7]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res8]['points']:
            num_seconds = (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res7]['upgrade'])
            total_seconds = UPGRADE_DICT[res7]["seconds"] + num_seconds
        elif UPGRADE_DICT[res8]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT[res9]['points']:
            num_seconds = JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res8]['upgrade']
            total_seconds = UPGRADE_DICT[res8]["seconds"] + num_seconds
        elif UPGRADE_DICT[res9]['points'] < FINISHED_RESEARCH[key]:
            num_seconds = JSON_DATA[key]['researchPoints'] / UPGRADE_DICT[res9]['upgrade']
            total_seconds = UPGRADE_DICT[res9]["seconds"] + num_seconds

        if "researchPower" in JSON_DATA[key]:
            cost_per_point = JSON_DATA[key]['researchPoints'] / JSON_DATA[key]['researchPower']
        else:
            cost_per_point = 0

        results[key] = {"total_points": FINISHED_RESEARCH[key],
                        "seconds": num_seconds,
                        "points": JSON_DATA[key]['researchPoints'],
                        "total_seconds": total_seconds,
                        "cost_per_point": cost_per_point}
    return results

def results_to_excel(RESULTS):
    import xlsxwriter
    workbook = xlsxwriter.Workbook(RESULTS_XLSX)
    worksheet = workbook.add_worksheet()
    row = 0
    col = 0

    worksheet.write(row, col, "research_name")
    worksheet.write(row, col + 1, "total_points")
    worksheet.write(row, col + 2, "seconds")
    worksheet.write(row, col + 3, "points")
    worksheet.write(row, col + 4, "total_seconds")
    worksheet.write(row, col + 5, "cost_per_points")

    for key in RESULTS:
        row += 1
        worksheet.write(row, col, key)
        i = 1
        for item in RESULTS[key]:
            worksheet.write(row, col + i, RESULTS[key][item])
            i += 1
    workbook.close()

def results_to_txt(RESULTS):
    for each_research in RESEARCH_ITEMS_WITH_NO_DEPENDENCY:
        if each_research not in START_RESEARCH:
            UNFINISHED_RESEARCH.append(each_research)
    with open(RESULTS_TXT, 'w') as f:
        f.write("These research items are unreachable or have no dependencies")
        f.write(json.dumps(UNFINISHED_RESEARCH, indent=4, sort_keys=True))
        f.write(json.dumps(RESULTS, indent=4, sort_keys=True))

if __name__ == "__main__":
    prepare_research()
    calculate_dependencies()
    calculate_upgrades()
    results = apply_upgrades()
    results_to_txt(results)
    results_to_excel(results)
