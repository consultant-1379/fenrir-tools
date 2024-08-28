#!/usr/bin/env python3

import json
import requests

def populate_pay_load_data(ll_suites_needed, rfa_suites_needed):
    current_sprint = get_sprint_drop("current")
    previous_sprint = get_sprint_drop("previous")

    current_sprint_iso_report = get_iso_version(current_sprint)

    if not current_sprint_iso_report:
        print(f"There are no ISO's available for the current sprint {current_sprint}")
        return None

    current_sprint_iso = get_iso_versions(current_sprint_iso_report)

    successful_iso = get_successful_iso_versions()
    last_20_successful_iso_versions = get_last_20_successful_iso_versions(successful_iso)

    return {
        "long_loop_trends": {
            "drop": f"{current_sprint}",
            "isosFrom": f"{current_sprint_iso[0]}",
            "isosTo": f"{current_sprint_iso[-1]}",
            "suites": f"{ll_suites_needed}"
        },
        "venm_rfa_trends": {
            "drop": f"{current_sprint},{previous_sprint}",
            "suites": f"{rfa_suites_needed}",
            "isoStatus": "Working ISO",
            "isos": f"{last_20_successful_iso_versions}"
        },
        "venm_rfa_trends_all": {
            "drop": f"{current_sprint}",
            "suites": f"{rfa_suites_needed}",
        },

    }


def get_maintrack_suite_report(testing_trends_url, payloads):
    BASE_URL = "https://mtportal.seli.wh.rnd.internal.ericsson.com/metrics-services/"

    URLS = {
        "long_loop_trends": "long-loop-trends-by-teams",
        "venm_rfa_trends": "rfa-trends-by-teams-failreport",
        "venm_rfa_trends_all": "rfa-trends-by-teams-failreport"
    }

    HEADERS = {
        "Content-Type": "application/json"
    }

    url = BASE_URL + URLS[testing_trends_url]
    payload = payloads[testing_trends_url]
    encoded_data = json.dumps(payload).encode("utf-8")
    response = requests.post(url, headers=HEADERS, data=encoded_data)
    return response


def get_sprint_drop(sprint_wanted):
    sprint_info_since_sprint_24_02 = requests.get(
        f"https://mtportal.seli.wh.rnd.internal.ericsson.com/metrics-services/sprint-details-from?sprint=24.02")

    if sprint_wanted == "current":
        current_sprint_info = sprint_info_since_sprint_24_02.json()[0]
        current_sprint_drop = current_sprint_info["name"]
        return current_sprint_drop
    else:
        previous_sprint_info = sprint_info_since_sprint_24_02.json()[1]
        previous_sprint_drop = previous_sprint_info["name"]
        return previous_sprint_drop


def get_iso_status_report(sprint_drop, previous_sprint_drop):
    return requests.get(
        f"https://mtportal.seli.wh.rnd.internal.ericsson.com/metrics-services/list-iso-versions-failreport?drop={sprint_drop},{previous_sprint_drop}").json()


def get_iso_version(sprint_drop):
    return requests.get(
        f"https://mtportal.seli.wh.rnd.internal.ericsson.com/metrics-services/list-iso-versions?drop={sprint_drop}").json()


def get_iso_versions(iso_report):
    return [d["value"] for d in iso_report]


def get_successful_iso_versions():
    return [d["value"] for d in iso_report if d.get("baseLine", "") == "SUCCESS"]


def get_last_20_successful_iso_versions(successful_iso):
    last_20_successful_iso = successful_iso[-20:]
    return ",".join(last_20_successful_iso)


iso_report = get_iso_status_report(get_sprint_drop("current"), get_sprint_drop("previous"))
