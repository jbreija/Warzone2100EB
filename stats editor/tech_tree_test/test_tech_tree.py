
import json
import os

RESULTS_TXT = "results.txt"
RESULTS_XLSX = "results.xlsx"

if "nt" in os.name.lower():
    RESEARCH_JSON = ".\\research.json"
else:
    RESEARCH_JSON = "./research.json"

with open(RESEARCH_JSON) as f:
    JSON_DATA = json.load(f)


START_RESEARCH = ["R-Vehicle-Engine01", "R-Sys-Sensor-Turret01", "R-Wpn-MG1Mk1", "R-Sys-Engineering01"]
RESEARCH_ITEMS_WITH_NO_DEPENDENCY = []
RESEARCH_FACILITY = 14  # check researchPoints in structures.json
RESEARCH_MODULE = 7  # check moduleResearchPoints in structures.json
UNFINISHED_RESEARCH = []
NEXT_RESEARCH = {}
CURRENT_RESEARCH = {}
FINISHED_RESEARCH = {}
UPGRADE_DICT = {}
RES_MOD = "R-Struc-Research-Module"

def prepare_research():
    for research_item in START_RESEARCH:
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
    try:
        for key, value in FINISHED_RESEARCH.items():
            if FINISHED_RESEARCH[key] < UPGRADE_DICT[RES_MOD]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                                "seconds": JSON_DATA[key]['researchPoints']/RESEARCH_FACILITY,
                                "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": FINISHED_RESEARCH[key] / RESEARCH_FACILITY,
                                "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT[RES_MOD]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade01"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                                "seconds": (JSON_DATA[key]['researchPoints']/UPGRADE_DICT[RES_MOD]['upgrade']),
                                "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": ((FINISHED_RESEARCH[key]-UPGRADE_DICT[RES_MOD]['points'])/UPGRADE_DICT[RES_MOD]['upgrade'])+UPGRADE_DICT[RES_MOD]['seconds'],
                                "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade01"]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade02"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds": (JSON_DATA[key]['researchPoints']/UPGRADE_DICT["R-Struc-Research-Upgrade01"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                    "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade01"]['points']) /
                        UPGRADE_DICT["R-Struc-Research-Upgrade01"]['upgrade'] + UPGRADE_DICT["R-Struc-Research-Upgrade01"]["seconds"]),
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade02"]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade03"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds": (JSON_DATA[key]['researchPoints'] / UPGRADE_DICT["R-Struc-Research-Upgrade02"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                    "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade02"]['points']) /
                                            UPGRADE_DICT["R-Struc-Research-Upgrade02"]['upgrade']) +
                                           UPGRADE_DICT["R-Struc-Research-Upgrade02"]["seconds"],
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade03"]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade04"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds": (JSON_DATA[key]['researchPoints']/ UPGRADE_DICT["R-Struc-Research-Upgrade03"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade03"][
                                    'points']) /
                                            UPGRADE_DICT["R-Struc-Research-Upgrade03"]['upgrade']) +
                                           UPGRADE_DICT["R-Struc-Research-Upgrade03"]["seconds"],
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade04"]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade05"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds": (JSON_DATA[key]['researchPoints'] /UPGRADE_DICT["R-Struc-Research-Upgrade04"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade04"][
                                    'points']) /
                                            UPGRADE_DICT["R-Struc-Research-Upgrade04"]['upgrade']) +
                                           UPGRADE_DICT["R-Struc-Research-Upgrade04"]["seconds"],
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade05"]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade06"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds": (JSON_DATA[key]['researchPoints']/UPGRADE_DICT["R-Struc-Research-Upgrade05"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade05"][
                                    'points']) /
                                            UPGRADE_DICT["R-Struc-Research-Upgrade05"]['upgrade']) +
                                           UPGRADE_DICT["R-Struc-Research-Upgrade05"]["seconds"],
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade06"]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade07"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds": (JSON_DATA[key]['researchPoints']/UPGRADE_DICT["R-Struc-Research-Upgrade06"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade06"][
                                    'points']) /
                                            UPGRADE_DICT["R-Struc-Research-Upgrade06"]['upgrade']) +
                                           UPGRADE_DICT["R-Struc-Research-Upgrade06"]["seconds"],
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade07"]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade08"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds": (JSON_DATA[key]['researchPoints']/UPGRADE_DICT["R-Struc-Research-Upgrade07"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade07"][
                                    'points']) /
                                            UPGRADE_DICT["R-Struc-Research-Upgrade07"]['upgrade']) +
                                           UPGRADE_DICT["R-Struc-Research-Upgrade07"]["seconds"],
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade08"]['points'] < FINISHED_RESEARCH[key] < UPGRADE_DICT["R-Struc-Research-Upgrade09"]['points']:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds": (JSON_DATA[key]['researchPoints']/UPGRADE_DICT["R-Struc-Research-Upgrade08"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade08"][
                                    'points']) /
                                            UPGRADE_DICT["R-Struc-Research-Upgrade08"]['upgrade']) +
                                           UPGRADE_DICT["R-Struc-Research-Upgrade08"]["seconds"],
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
            elif UPGRADE_DICT["R-Struc-Research-Upgrade09"]['points'] < FINISHED_RESEARCH[key]:
                results[key] = {"total_points": FINISHED_RESEARCH[key],
                    "seconds":(JSON_DATA[key]['researchPoints']/UPGRADE_DICT["R-Struc-Research-Upgrade09"]['upgrade']),
                    "points": JSON_DATA[key]['researchPoints'],
                                "total_seconds": ((FINISHED_RESEARCH[key] - UPGRADE_DICT["R-Struc-Research-Upgrade09"][
                                    'points']) /
                                            UPGRADE_DICT["R-Struc-Research-Upgrade09"]['upgrade']+
                                           UPGRADE_DICT["R-Struc-Research-Upgrade09"]["seconds"]),
                    "cost_per_point": JSON_DATA[key]['researchPoints']/JSON_DATA[key]['researchPower']}
    except Exception as e:
        pass
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
