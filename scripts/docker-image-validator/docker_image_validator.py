#!/usr/bin/env python
import os, sys, requests, yaml, glob, re
from enum import Enum

environment_variable_name_for_artifactory_key = 'ARM_TOKEN'

file_name_or_directory = ""
artifactory_user_key = ""
artifactory_url = "https://{}/artifactory"
artifactory_api_search_url = "/api/search/aql"
response_cache = {}
service_groups = []
include_disabled_images_in_report = False


class InvalidArtifactoryKeyException(Exception):
    pass


class DockerImageStatus(Enum):
    UNKNOWN = 1
    FOUND = 2
    NOT_FOUND = 3
    ERROR_IN_REQUEST = 4
    DISABLED = 5


class DockerImage:
    def __init__(self, artifactory_host, repo_path, image_name, image_tag):
        self.artifactory_host = artifactory_host
        self.repo_path = repo_path
        self.image_name = image_name
        self.image_tag = image_tag
        self.status = DockerImageStatus.UNKNOWN
        self.message = None

    def form_full_image_path_with_tag(self):
        return self.artifactory_host + "/" + self.repo_path + "/" + self.image_name + ":" + self.image_tag


class ServiceGroup:
    def __init__(self, name, path_to_values_yaml_file):
        self.name = name
        self.path_to_values_yaml_file = path_to_values_yaml_file
        self.missing_images = []
        self.disabled_images = []
        self.error_in_request_images = []
        self.error_message = None

    def add_missing_image(self, docker_image):
        self.missing_images.append(docker_image)

    def add_disabled_image(self, docker_image):
        self.disabled_images.append(docker_image)

    def add_error_in_request_image(self, docker_image):
        self.error_in_request_images.append(docker_image)


def values_file_is_part_of_the_helmchart_library(list_of_values_yaml_index):
    if list_of_values_yaml_index.endswith(os.path.join("eric-enm-common-helmchart-library", "values.yaml")):
        return True
    else:
        return False


def cleanse_list_of_values_yaml_files(list_of_values_yaml):
    cleansed_list_of_values_yaml_files = []
    for i in list_of_values_yaml:
        if not values_file_is_part_of_the_helmchart_library(i):
            cleansed_list_of_values_yaml_files.append(i)
    return cleansed_list_of_values_yaml_files


def get_list_of_values_yaml_files(path):
    pathname = path + os.sep + "**" + os.sep + "values.yaml"
    return glob.glob(pathname, recursive=True)


def initialise_service_groups_with_values_yaml_files(list_of_values_yaml_files):
    global service_groups

    for current_values_yaml_file in list_of_values_yaml_files:
        values_yaml_file_path_pattern = "(.*)(\/|\\\)charts(\/|\\\)(.*)(\/|\\\)(values.yaml)"
        pattern = re.compile(values_yaml_file_path_pattern)
        match = pattern.match(current_values_yaml_file)
        if match:
            service_group_name = match.group(4)
        else:
            service_group_name = current_values_yaml_file

        service_groups.append(ServiceGroup(service_group_name, current_values_yaml_file))


def execute_http_query_for_docker_image_in_artifactory(docker_image):
    global artifactory_user_key
    global artifactory_url
    global artifactory_api_search_url

    image = docker_image.repo_path + "/" + docker_image.image_name
    headers = {'Content-type': 'text/plain', 'X-JFrog-Art-Api': artifactory_user_key}
    post_data = """items.find(
    {{
    "$and":[
      {{"$or":[
        {{"$and":[
          {{"name":{{"$eq":"manifest.json"}}}},
          {{"$or":[
            {{"@docker.repoName":{{"$match":"{}"}}}},
            {{"@docker.repoName":{{"$match":"library/{}"}}}}
          ]}}
        ]}}
      ]}},
      {{"$or":[
        {{"$and":[
          {{"name":{{"$eq":"manifest.json"}}}},
          {{"$or":[
            {{"@docker.manifest":{{"$match":"{}"}}}},
            {{"@docker.manifest":{{"$match":"library/{}"}}}}
          ]}}
        ]}}
      ]}},
      {{"$rf":[
        {{"$or":[
          {{"property.key":{{"$eq":"docker.manifest"}}}},
          {{"property.key":{{"$eq":"sha256"}}}},
          {{"property.key":{{"$eq":"docker.repoName"}}}}
        ]}}
      ]}}
    ]
    }}
    ).
    include("original_md5","type","modified_by","created_by","id","updated","repo","name","original_sha1","actual_sha1","depth","sha256","property.key","property.value","actual_md5","created","modified","size","path").
    limit(1)
    """.format(image, image, docker_image.image_tag, docker_image.image_tag)

    post_url = artifactory_url.format(docker_image.artifactory_host) + artifactory_api_search_url

    response = requests.post(post_url, headers=headers, data=post_data)
    return response


def response_contains_at_least_one_image(response_json):
    if len(response_json["results"]) > 0:
        return True
    else:
        return False


def validate_image_in_artifactory(docker_image):
    current_image_key = docker_image.form_full_image_path_with_tag()
    global response_cache

    if current_image_key in response_cache:
        response = response_cache[current_image_key]
    else:
        try:
            response = execute_http_query_for_docker_image_in_artifactory(docker_image)
            if response.status_code == 403:
                raise InvalidArtifactoryKeyException("\nServer replied 403 [FORBIDDEN]. "
                                                     "You may need to check if your Artifactory Key is valid.")

            response_cache[current_image_key] = response

            if response.status_code == 200:
                response_json = response.json()

                if response_contains_at_least_one_image(response_json):
                    docker_image.status = DockerImageStatus.FOUND
                else:
                    docker_image.status = DockerImageStatus.NOT_FOUND
            else:
                docker_image.status = DockerImageStatus.ERROR_IN_REQUEST
        except requests.exceptions.RequestException as e:
            docker_image.status = DockerImageStatus.ERROR_IN_REQUEST
            docker_image.message = e


def validate_images(service_group, service_group_values_yaml, artifactory_host, repo_path):
    for image_element_in_values_yaml, value in service_group_values_yaml["images"].items():
        repo_path_for_validation = resolve_repo_path_for_non_standard_cases(image_element_in_values_yaml,
                                                                            service_group_values_yaml,
                                                                            repo_path)
        docker_image = DockerImage(artifactory_host, repo_path_for_validation, value["name"], value["tag"])
        if "enabled" in value and value["enabled"] is False:
            docker_image.status == DockerImageStatus.DISABLED
            service_group.add_disabled_image(docker_image)
        else:
            validate_image_in_artifactory(docker_image)
            if docker_image.status == DockerImageStatus.NOT_FOUND:
                service_group.add_missing_image(docker_image)
            elif docker_image.status == DockerImageStatus.ERROR_IN_REQUEST:
                service_group.add_error_in_request_image(docker_image)
                service_group.error_message = docker_image.message


def resolve_repo_path_for_non_standard_cases(image_element_in_values_yaml, service_group_values_yaml, chart_repo_path):
    if (image_element_in_values_yaml == "logshipper"):
        return service_group_values_yaml["imageCredentials"]["logshipper"]["repoPath"]
    else:
        return chart_repo_path


def parse_service_group_values_yaml_file_and_validate_images(service_group):
    print(".", end="", flush=True)
    try:
        with open(service_group.path_to_values_yaml_file, "r") as f:
            service_group_values_yaml = yaml.load(f, Loader=yaml.FullLoader)

            registry = service_group_values_yaml["global"]["registry"]
            artifactory_host = registry["url"]
            repo_path = service_group_values_yaml["imageCredentials"]["repoPath"]
            if (repo_path != "aia_releases"):
                validate_images(service_group, service_group_values_yaml, artifactory_host, repo_path)
    except InvalidArtifactoryKeyException as e:
        print(e)
        sys.exit(0)
    except Exception as e:
        print(e)


def validate_files_in_directory_and_print_report():
    global file_name_or_directory
    list_of_values_yaml_files = cleanse_list_of_values_yaml_files(get_list_of_values_yaml_files(file_name_or_directory))
    parse_list_of_values_yaml_files_and_process_each_service_group(list_of_values_yaml_files)
    print_report()


def validate_single_file_and_print_report():
    global file_name_or_directory
    list_of_values_yaml_files = [file_name_or_directory]
    parse_list_of_values_yaml_files_and_process_each_service_group(list_of_values_yaml_files)
    print_report()


def parse_list_of_values_yaml_files_and_process_each_service_group(list_of_values_yaml_files):
    global service_groups
    print("Processing.", end="")

    initialise_service_groups_with_values_yaml_files(list_of_values_yaml_files)

    for service_group in service_groups:
        parse_service_group_values_yaml_file_and_validate_images(service_group)


def print_header(service_group):
    print("\nService Group: {} \nPath to values.yaml file: {}"
          .format(service_group.name, service_group.path_to_values_yaml_file))


def print_error_in_request_images_report(service_group):
    print_header(service_group)
    print("Error: {}".format(service_group.error_message))

    if service_group.error_in_request_images:
        print("The following image(s) had an error in request: ")
        for i in service_group.error_in_request_images:
            print("\t", i.form_full_image_path_with_tag())


def print_missing_images_report(service_group):
    print_header(service_group)
    print("Missing image(s) in Artifactory:")
    for i in service_group.missing_images:
        print("\t", i.form_full_image_path_with_tag())


def print_disabled_images_report(service_group, missing_images_found):
    if missing_images_found == False:
        print_header(service_group)
    print("Disabled image(s):".format(service_group.name))
    for i in service_group.disabled_images:
        print("\t", i.form_full_image_path_with_tag())


def print_report():
    global service_groups
    global file_name_or_directory
    global include_disabled_images_in_report

    missing_images_found = False

    print("\nBase directory/file scanned: {}".format(file_name_or_directory))
    print("--------------------------------------------------------------------------------\n")

    for service_group in service_groups:
        if service_group.error_message:
            print_error_in_request_images_report(service_group)
        else:
            if service_group.missing_images:
                missing_images_found = True
                print_missing_images_report(service_group)
            if service_group.disabled_images and include_disabled_images_in_report:
                print_disabled_images_report(service_group, missing_images_found)

    if not missing_images_found:
        print("Processing finished. There were no missing images found in {}".format(
            service_group.path_to_values_yaml_file))
    else:
        raise Exception('Image(s) are missing in the repository!')


def print_usage():
    print(
        "Usage: \n    python docker-image-validator.py [PATH_TO_VALIDATE]\n"
        "where:\n"
        "  PATH_TO_VALIDATE - path to a single values.yaml file or a directory to scan for values.yaml files")


def main():
    if len(sys.argv) >= 2:
        global artifactory_user_key
        global file_name_or_directory

        file_name_or_directory = sys.argv[1]
        if (os.environ.get(environment_variable_name_for_artifactory_key)):
            artifactory_user_key = os.environ[environment_variable_name_for_artifactory_key]
        else:
            artifactory_user_key = input("Enter your Artifactory User Key and press enter: ")

        if not artifactory_user_key:
            print("Key wasn't set")
            print_usage()
            exit(0)
        else:
            if os.path.exists(file_name_or_directory):
                if os.path.isdir(file_name_or_directory):
                    validate_files_in_directory_and_print_report()
                elif os.path.isfile(file_name_or_directory):
                    validate_single_file_and_print_report()
            else:
                print("Path {} doesn't exist. Terminating program.".format(file_name_or_directory))
    else:
        print_usage()


if __name__ == "__main__":
    main()
