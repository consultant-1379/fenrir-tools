#!/usr/bin/env python3
import json
import yaml

class ConfigReader:
    def __init__(self, config_file):
        self.config_file = config_file
        self.config = self._read_config()

    def _read_config(self):
        with open(self.config_file, "r") as f:
            if self.config_file.endswith('.json'):
                return json.load(f)
            elif self.config_file.endswith(".yaml") or self.config_file.endswith(".yml"):
                return yaml.safe_load(f)
            else:
                raise ValueError("Unsupported file format. Please provide a JSON or YAML config file.")

    def _extract_long_loop_suites(self):
        long_loop_suites = []
        for team, data in self.config["Teams"].items():
            long_loop_suites.extend(data["Suites"].get("Long Loop", []))
        return '*'.join(long_loop_suites)

    def _extract_rfa_suites(self):
        rfa_suites = []
        for team, data in self.config["Teams"].items():
            rfa_suites.extend(data["Suites"].get("RFA", []))
        return '*'.join(rfa_suites)

    def _extract_email_suites(self):
        email_suites = {}
        for team, data in self.config["Teams"].items():
            emails = data.get("Emails", [])
            for email in emails:
                email_suites[email] = {
                    "Long Loop": data["Suites"].get("Long Loop", []),
                    "RFA": data["Suites"].get("RFA", [])
                }
        return email_suites

    def get_long_loop_string(self):
        return self._extract_long_loop_suites()

    def get_rfa_string(self):
        return self._extract_rfa_suites()

    def get_email_suites(self):
        return self._extract_email_suites()

