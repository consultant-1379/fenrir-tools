import json
import sys

import time
import read_config_file
import requests
import maintrack_api_calls

SCRIPT_EXECUTION_TIME = time.time()
HOURS_SINCE_LAST_EXECUTION = 4


def seconds_since_last_execution():
    seconds_since_last_execution = HOURS_SINCE_LAST_EXECUTION * 60 * 60 # Convert hours to seconds
    timestamp_since_last_execution = SCRIPT_EXECUTION_TIME - seconds_since_last_execution
    return timestamp_since_last_execution


def is_green_iso(iso_report):
    return iso_report.get("isoVersion") in maintrack_api_calls.get_successful_iso_versions()


def get_report_execution_time(iso_report):
    try:
        verify_allure_link = "/".join(iso_report.get("allureUrl").split("/", 4)[:4]) + "/"
        report_widget_data = requests.get(f"{verify_allure_link}data/widgets.json").json()
        return report_widget_data["data"][0]["time"]["stop"] / 1000  # Convert ms to s
    except:
        print(f"Allure link is not formatted correctly for {iso_report.get('allureUrl')}.")
        return None


def is_report_execution_time_over_x_hours(report_execution_time):
    return report_execution_time is not None and report_execution_time >= seconds_since_last_execution()


def check_for_failed_suites(iso_report, trend):
    pass_percentage = trend.get("testResult")
    if pass_percentage is not None and float(pass_percentage) < 100:
        return {
            "suiteName": trend.get("suiteName"),
            "isoVersion": iso_report.get("isoVersion"),
            "passPercentage": pass_percentage,
            "allureUrl": iso_report.get("allureUrl")
        }
    return None


def filter_suite_data(response):
    error_list = []

    try:
        response_in_json = response.json()

        for iso_report in response_in_json:
            if is_green_iso(iso_report):
                report_execution_time = get_report_execution_time(iso_report)
                if is_report_execution_time_over_x_hours(report_execution_time):
                    trends_by_team_iso_vos = iso_report.get("trendsByTeamIsoVOs", {})
                    for trend in trends_by_team_iso_vos:
                        error_dict = check_for_failed_suites(iso_report, trend)
                        if error_dict:
                            error_list.append(error_dict)

        return error_list

    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)


def generate_suite_failure_reports(suites, suite_type):
    result_dict = {}

    suite_type_name = get_suite_type_name(suite_type)

    for suite in suites:
        result_dict.setdefault(suite["suiteName"], []).append((suite["isoVersion"], suite["allureUrl"]))

    return [{"suiteName": suite_name,
             "suiteFailedIsos": [iso_data[0] for iso_data in iso_versions],
             "allureReports": [iso_data[1] for iso_data in iso_versions],
             "suiteType": suite_type_name}
            for suite_name, iso_versions in result_dict.items()]


def get_suite_type_name(suite_type):
    if suite_type == "long_loop_trends":
        suite_type_name = "Long Loop"
    elif suite_type == "venm_rfa_trends_all":
        suite_type_name = "RFA"
    else:
        suite_type_name = "None"
    return suite_type_name


def process_api_calls(long_loop_string, rfa_string, payloads):
    suite_reports = []

    def process_suite_report(suite_type):
        suite_data = maintrack_api_calls.get_maintrack_suite_report(suite_type, payloads)
        filtered_suites = filter_suite_data(suite_data)
        return generate_suite_failure_reports(filtered_suites, suite_type)

    if rfa_string:
        rfa_all_suite_report = process_suite_report("venm_rfa_trends_all")
        suite_reports.extend(rfa_all_suite_report)

    if long_loop_string:
        ll_suite_report = process_suite_report("long_loop_trends")
        suite_reports.extend(ll_suite_report)

    return suite_reports


def generate_report(matched_suites):
    report = ""
    for suite in matched_suites:
        failed_iso_and_allure = "".join(
            f"\n\t{iso} - {allure}" for iso, allure in zip(suite.get("suiteFailedIsos"), suite.get("allureReports"))
        )
        report += f"[{suite.get('suiteType')}] {suite.get('suiteName')} Failed Iso(s): {failed_iso_and_allure}\n\n"
    return report


def get_email_and_report(email_suites, all_suite_reports):
    email_reports = {}
    for email, suites in email_suites.items():
        matching_suites = set(suites.get("Long Loop", []) + suites.get("RFA", []))

        matched_suites = [suite_report for suite_report in all_suite_reports if suite_report["suiteName"] in matching_suites]

        if matched_suites:
            report = "\n".join([generate_report(matched_suites)])
            email_reports[email] = f"------------ Suite(s) failed in the last {HOURS_SINCE_LAST_EXECUTION} Hour! ------------ \n\n{report}\n"

    return email_reports


def main():
    # Read configuration
    config_reader = read_config_file.ConfigReader("config.yaml")
    email_suites = config_reader.get_email_suites()
    rfa_string = config_reader.get_rfa_string()
    long_loop_string = config_reader.get_long_loop_string()

    # Populate payloads
    payloads = maintrack_api_calls.populate_pay_load_data(long_loop_string, rfa_string)

    if payloads:
        # Process API calls
        all_suite_reports = process_api_calls(long_loop_string, rfa_string, payloads)

        # Generate and print reports for each email
        emails_and_reports_dict = get_email_and_report(email_suites, all_suite_reports)

        # dict that will be read by Jenkins to send mails
        print(json.dumps(emails_and_reports_dict, indent=2))


if __name__ == "__main__":
    main()
