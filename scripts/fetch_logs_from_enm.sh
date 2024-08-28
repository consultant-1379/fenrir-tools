#!/bin/bash

# This script will collects the server logs from pmserv, mspm, and pmrouterpolicy instances.
# It can also collects the netsim genstats logs in case specified.
# Once executed the scripts are collected in a newly created folder with the name 'log_<CLUSTER_ID>_<DATE>_<TIME>'
# (or 'log_<CLUSTER_ID>_<DATE>_<TIME>_<JIRA_TICKET>' in case executed with flag -j).
#
# It should be executed like:
#
# ># ./fetch_logs CLUSTER_ID [OPTIONS]
#
# where:
#   CLUSTER_ID - is the number of the physical cluster (239 for vapp) or id of cloud environment.
#   [OPTIONS] - available options:
#           -n, --netsim            flag that if specified collect logs from netsim as well
#           -j, --jira              jira ticket to be appended in the folder name for the collected logs
#           -s, --service-groups    comma separated list of service groups for log collection. If not specified the script collect logs from "pmserv", "mspm", and "pmrouterpolicy" ("medcore" in case of vapp)
#
# Examples:
#
# ># ./fetch_logs ieatenmc6a11
# ># ./fetch_logs ieatenmc6a11 -n
# ># ./fetch_logs ieatenmc6a11 -s mscm,mscmce,cmserv -j TORF-123456
#

# DIT and CI Portal Information (used get hosts for cloud and physical environments)
dit_url=https://atvdit.athtem.eei.ericsson.se
ci_portal_url=https://cifwk-oss.lmera.ericsson.se

# Timeout in seconds used in each step of the expect script.
# After the script executes a command it will wait for a particular text output for a maximum period defined by this variable.
# If this value is too low the command to download the files may be shutdown before the entire file is downloaded so it must be
# a high enough value in order to give enough time to download the files. A higher value will mean that the script may take
# a long time to execute in case any error occurs in any step of the execution.
expect_timeout=60

# Information for collecting logs from netsim
collect_netsim_logs=false
netsim_logs_dir="/netsim_users/pms/logs"
netsim_logs_to_collect="genStats_1min.log lte_rec_1min.log genStats_15min.log lte_rec_15min.log"
netsim_cfg_dir="/netsim"
netsim_cfg_file="netsim_cfg"
netsim_user="netsim"
netsim_password="netsim"

# Common information for physical environments
physical_ms_user="root"
physical_ms_password="12shroot"
physical_servicegroups="pmserv mspm pmrouterpolicy"
physical_servicegroup_user="cloud-user"
physical_servicegroup_cert="/root/.ssh/vm_private_key"

# Common information for cloud environments
cloud_vnflcm_user="cloud-user"
cloud_vnflcm_password="N3wP@55w0rd"
cloud_servicegroups="pmserv mspm pmrouterpolicy"
cloud_servicegroup_user="cloud-user"
cloud_servicegroup_cert="/var/tmp/pem_key/$1.pem"

# Information for cluster 239 (vApp)
env_239_type="vapp"
env_239_ms_host="192.168.0.42"
env_239_ms_user="root"
env_239_ms_password="12shroot"
env_239_servicegroups="pmserv mspm medcore"
env_239_servicegroup_user="cloud-user"
env_239_servicegroup_cert="/root/.ssh/vm_private_key"
env_239_netsim_hosts="netsim"

show_help_and_exit() {
    echo "Usage: ./fetch_logs_from_enm [OPTION]... CLUSTER_ID"
    echo "Collect logs from specified enm deployment. By default it will collect logs from the service groups: \"pmserv\", \"mspm\", and \"pmrouterpolicy\" (\"medcore\" in case of vapp)"
    echo -e "\nCLUSTER_ID identifies the enm deployment for log collection\n"
    echo -e "  -n, --netsim\t\tflag that if specified collect logs from netsim as well"
    echo -e "  -j, --jira\t\tjira ticket to be appended in the folder name for the collected logs"
    echo -e "  -s, --service-groups\tcomma separated list of service groups for log collection. If not specified the script collect logs from \"pmserv\", \"mspm\", and \"pmrouterpolicy\" (\"medcore\" in case of vapp)"
    echo -e "\nExamples"
    echo -e "  ./fetch_logs_from_enm.sh 239\t\t\t\tCollect logs from default service groups for a vApp".
    echo -e "  ./fetch_logs_from_enm.sh 239 -n\t\t\tCollect logs from default service groups and netsim VMs for a vApp".
    echo -e "  ./fetch_logs_from_enm.sh 267 -s=cmserv,mscm,mscmce\tCollect logs from service groups \"cmserv\", \"mscm\", and \"mscmce\" for cluster 267".
    echo -e "  ./fetch_logs_from_enm.sh ieatenmc3b09 -j=TORF-000000\tCollect logs default service groups for cluster ieatenmc3b09. It appends TORF-000000 into the name of the folder with the collected logs."
    exit 0
}

set_servicegroups_to_collect() {
    if [ ! -z ${1// } ]; then
        servicegroups_to_collect="$(echo $1 | tr ',' ' ')";
    fi
}

set_cluster_type() {
    env_type="env_${cluster}_type"
    if [ -z ${!env_type} ]; then
        # Check if cluster is cloud environment
        is_cluster_number="$(echo $cluster | egrep "^[0-9]+$" | sed 's/[[:space:]]*$//')"
        if [ -z $is_cluster_number ] ; then
            eval "env_${cluster}_type=cloud"
        else
            eval "env_${cluster}_type=physical"
        fi
    fi
    echo "Environment Type is ${!env_type}"
}

set_variables_for_cluster() {
    if [ ${!env_type} == "cloud" ]; then
        env_ms_user="cloud_vnflcm_user"
        env_ms_password="cloud_vnflcm_password"
        env_servicegroups="cloud_servicegroups"
        env_servicegroup_user="cloud_servicegroup_user"
        env_servicegroup_cert="cloud_servicegroup_cert"

        # Overwrite service groups if option was specified
        if [ ! -z ${servicegroups_to_collect// } ]; then
            env_servicegroups="servicegroups_to_collect"
        fi

        populate_hosts_for_cloud

        env_ms_host="env_${cluster}_ms_host"
        env_netsim_hosts="env_${cluster}_netsim_hosts"
    elif [ ${!env_type} == "physical" ]; then
        env_ms_host="env_${cluster}_ms_host"
        env_ms_user="physical_ms_user"
        env_ms_password="physical_ms_password"
        env_servicegroups="physical_servicegroups"
        env_servicegroup_user="physical_servicegroup_user"
        env_servicegroup_cert="physical_servicegroup_cert"
        env_netsim_hosts="env_${cluster}_netsim_hosts"

        # Overwrite service groups if option was specified
        if [ ! -z ${servicegroups_to_collect// } ]; then
            env_servicegroups="servicegroups_to_collect"
        fi

        populate_hosts_for_physical
    else
        env_ms_host="env_${cluster}_ms_host"
        env_ms_user="env_${cluster}_ms_user"
        env_ms_password="env_${cluster}_ms_password"
        env_servicegroups="env_${cluster}_servicegroups"
        env_servicegroup_user="env_${cluster}_servicegroup_user"
        env_servicegroup_cert="env_${cluster}_servicegroup_cert"
        env_netsim_hosts="env_${cluster}_netsim_hosts"

        # Overwrite service groups if option was specified
        if [ ! -z ${servicegroups_to_collect// } ]; then
            env_servicegroups="servicegroups_to_collect"
        fi

        populate_hosts_for_vapp
    fi
}

populate_hosts_for_cloud() {
    cluster_deployment_id=$(curl -X GET "${dit_url}/api/deployments?q=name%3D${cluster}&fields=id" -H "accept: application/json" -k 2>/dev/null | jq -r '.[].id')
    if [ -z ${cluster_deployment_id} ]; then
        echo -e "\nERROR - Cluster with name \"${cluster}\" not found in DIT\n"
        exit 1
    else
        # Get document id for enm sed and vnflcm sed
        enm_sed_document_id=$(curl -X GET "${dit_url}/api/deployments/${cluster_deployment_id}" -H "accept: application/json" -k 2>/dev/null | jq -r '.enm.sed_id')
        vnflcm_sed_document_id=$(curl -X GET "${dit_url}/api/deployments/${cluster_deployment_id}" -H "accept: application/json" -k 2>/dev/null | jq -r '.documents[] | select(.schema_name=="vnflcm_sed_schema")' | jq -r '.document_id')
        netsim_sed_document_id=$(curl -X GET "${dit_url}/api/deployments/${cluster_deployment_id}" -H "accept: application/json" -k 2>/dev/null | jq -r '.documents[] | select(.schema_name=="netsim")' | jq -r '.document_id')

        # Populate host for vnflcm (ms for cloud)
        vnflcm_sed_json=$(curl -X GET "https://atvdit.athtem.eei.ericsson.se/api/documents/${vnflcm_sed_document_id}" -H "accept: application/json" -k 2>/dev/null)
        eval "env_${cluster}_ms_host=$(echo $vnflcm_sed_json | awk -F "external_ipv4_vip_for_services\":\"" '{print $2}' | awk -F '\",' '{print $1}')"

        # Populate hosts for service groups
        enm_sed_json=$(curl -X GET "https://atvdit.athtem.eei.ericsson.se/api/documents/${enm_sed_document_id}" -H "accept: application/json" -k 2>/dev/null)
        for servicegroup in ${!env_servicegroups}; do
            eval "env_${cluster}_${servicegroup}_hosts=$(echo $enm_sed_json | awk -F "${servicegroup}_internal_ip_list\":\"" '{print $2}' | awk -F '\",' '{print $1}')"
            servicegroup_host_var=env_${cluster}_${servicegroup}_hosts
            eval "env_${cluster}_${servicegroup}_hosts=\"$(echo ${!servicegroup_host_var} | sed 's/,/ /g')\""
        done

        # Populate hosts for netsim
        netsim_sed_json=$(curl -X GET "https://atvdit.athtem.eei.ericsson.se/api/documents/${netsim_sed_document_id}" -H "accept: application/json" -k 2>/dev/null)
        #eval "env_${cluster}_netsim_hosts=($(echo $netsim_sed_json | jq -r '.content.vm[].ip'))"
        IFS=$'\n' read -r -d '' -a nestim_hosts_array \
        < <(set -o pipefail; echo $netsim_sed_json | jq -r '.content.vm[].ip' && printf '\0')

        netsim_cluster_hosts="env_${cluster}_netsim_hosts"
        for netsim_host_entry in ${nestim_hosts_array[@]}; do
            eval "env_${cluster}_netsim_hosts=\"${!netsim_cluster_hosts} ${netsim_host_entry}\""
        done
    fi
}

populate_hosts_for_physical() {
    # Populate MS address from CI Portal
    ci_cluster_page_html=$(curl -X GET "${ci_portal_url}/dmt/clusters/${cluster}/" -k 2>/dev/null)
    cluster_ms_address=$(echo $ci_cluster_page_html | grep -oE "ieatlms[0-9]+((-[0-9]+){0,1})" | sort --unique)
    if [ ! -z ${cluster_ms_address// } ]; then
        cluster_ms_address="${cluster_ms_address}.athtem.eei.ericsson.se"
        echo "Setting ms server host: \"${cluster_ms_address}\""
        eval "env_${cluster}_ms_host=\"${cluster_ms_address}\""
    else
        echo "ERROR - Cluster \"${cluster}\" not found in CI Portal"
        exit 1
    fi

    # Populate hosts for netsim VMs from CI Portal
    if $collect_netsim_logs; then
        eval "env_${cluster}_netsim_hosts=\"\""
        netsim_vm_ips=$(echo $ci_cluster_page_html | grep -oE "ieatnetsimv[0-9]+\-[0-9]+" | sort --unique | tr '\n' ' ')
        if [ ! -z ${netsim_vm_ips// } ]; then
            eval "env_${cluster}_netsim_hosts=\"${netsim_vm_ips}\""
        fi
    fi

    populate_servicegroups_from_host_file
}

populate_hosts_for_vapp() {
    populate_servicegroups_from_host_file
}

populate_servicegroups_from_host_file() {
    # Get /etc/hosts file from ms server
    expect -c "
        set timeout ${expect_timeout}
        spawn sftp -oStrictHostKeyChecking=no ${!env_ms_user}@${!env_ms_host}:/etc/hosts hosts_file
        expect {
            \"*password:\"  {send \"${!env_ms_password}\r\" ; exp_continue}
            \"*100%*\"
        }
    "

    # Populate hosts for each service group
    for servicegroup in ${!env_servicegroups}; do
        IFS=$'\n' GLOBIGNORE='*' command eval "sg_hosts_array=($(cat hosts_file | egrep -o "svc-[0-9]+-${servicegroup}[-]*[0-9]*[^a-zA-Z]"))"

        servicegroup_cluster_host=env_${cluster}_${servicegroup}_hosts

        for sg_host_entry in ${sg_hosts_array[@]}; do
            eval "env_${cluster}_${servicegroup}_hosts=\"${!servicegroup_cluster_host} ${sg_host_entry}\""
        done
    done

    rm -rf hosts_file
}

fetch_logs() {
    cluster=$1
    if [ -z $cluster ]; then
        echo "ERROR - The cluster id of the environment needs to be specified!"
        exit
    fi

    # Sets the cluster type for the specified cluster
    set_cluster_type

    # Define variables for selected cluster
    set_variables_for_cluster

    # Generate name for local folder that will store the logs
    current_date=$(date +"%Y%m%d_%H%M%S")
    logs_folder="logs_${cluster}_${current_date}"
    if [ ! -z ${jira_code// } ]; then
        logs_folder="${logs_folder}_${jira_code}"
    fi

    # Create folder to store logs for service groups
    mkdir -p ${logs_folder}
    echo -e "\n*********** Created folder \"${logs_folder}\" to store logs ***********\n"

    # Build command to collect logs from service groups
    expect_sg_to_ms_cmds=""
    for servicegroup in ${!env_servicegroups}; do
        env_servicegroup_hosts="env_${cluster}_${servicegroup}_hosts"

        servicegroup_number=0

        for servicegroup_host in ${!env_servicegroup_hosts}; do
            servicegroup_number=$(($servicegroup_number + 1))
            servicegroup_log_name=${servicegroup}_${servicegroup_number}

            mkdir -p "${logs_folder}/${servicegroup_log_name}"

            expect_sg_to_ms_cmds="${expect_sg_to_ms_cmds}
                send \"mkdir -p /tmp/${logs_folder}/${servicegroup_log_name}\r\"
                expect \"${!env_ms_user}@*\"
                send \"scp -r -o StrictHostKeyChecking=no -i ${!env_servicegroup_cert} ${!env_servicegroup_user}@${servicegroup_host}:/ericsson/3pp/jboss/standalone/log /tmp/${logs_folder}/${servicegroup_log_name}\r\"
                expect \"${!env_ms_user}@*\"
            "
        done
    done

    # Build command to collect logs from netsim VMs
    expect_netsim_to_ms_cmds=""

    if $collect_netsim_logs; then
        # Create folder to store logs for netsim
        mkdir -p ${logs_folder}/netsim

        netsim_vm_number=0
        for netsim_host in ${!env_netsim_hosts}; do
            netsim_vm_number=$(($netsim_vm_number + 1))

            for netsim_log_to_collect in ${netsim_logs_to_collect}; do
                netsim_log_name=netsim_${netsim_vm_number}_${netsim_log_to_collect}

                expect_netsim_to_ms_cmds="${expect_netsim_to_ms_cmds}
                    send \"sftp -oStrictHostKeyChecking=no ${netsim_user}@${netsim_host}:${netsim_logs_dir}/${netsim_log_to_collect} /tmp/${logs_folder}/${netsim_log_name}\r\"
                    expect {
                        \"*Password:\" {send \"${netsim_password}\r\" ; exp_continue}
                        \"*100%*\" {}
                        \"*not found*\" {}
                    }
                "
            done

            expect_netsim_to_ms_cmds="${expect_netsim_to_ms_cmds}
                send \"sftp -oStrictHostKeyChecking=no ${netsim_user}@${netsim_host}:${netsim_cfg_dir}/${netsim_cfg_file} /tmp/${logs_folder}/${netsim_cfg_file}_${netsim_vm_number}\r\"
                expect {
                    \"*Password:\" {send \"${netsim_password}\r\" ; exp_continue}
                    \"*100%*\" {}
                    \"*not found*\" {}
                }
                send \"ssh ${netsim_user}@${netsim_host} '( crontab -l )' > /tmp/${logs_folder}/netsim_${netsim_vm_number}_crontab.txt\r\"
                expect \"*Password:\"
                send \"${netsim_password}\r\"
                expect \"*${!env_ms_user}*\"
            "
        done
    fi

    # Collect logs from service groups and netsim to ms server
    echo -e "\n*********** Downloading Logs to ms server ***********\n"
    expect -c "
        set timeout ${expect_timeout}
        spawn ssh -o StrictHostKeyChecking=no ${!env_ms_user}@${!env_ms_host}
        expect {
            \"*password:\" {send \"${!env_ms_password}\r\" ; exp_continue}
            \"*${!env_ms_user}@*\"
        }
        send \"mkdir -p /tmp/${logs_folder}\r\"
        expect \"*${!env_ms_user}@*\"
        ${expect_sg_to_ms_cmds}
        ${expect_netsim_to_ms_cmds}
        send \"exit\r\"
    "

    # Collect service group logs to local machine
    echo -e "\n*********** Downloading service group logs to local machine ***********\n"
    for servicegroup in ${!env_servicegroups}; do
        env_servicegroup_hosts="env_${cluster}_${servicegroup}_hosts"

        servicegroup_number=0

        for servicegroup_host in ${!env_servicegroup_hosts}; do
            servicegroup_number=$(($servicegroup_number + 1))
            servicegroup_log_name=${servicegroup}_${servicegroup_number}

            expect -c "
                set timeout ${expect_timeout}
                spawn scp -r -o StrictHostKeyChecking=no ${!env_ms_user}@${!env_ms_host}:/tmp/${logs_folder}/${servicegroup_log_name} ${logs_folder}
                expect {
                    \"*password:*\" {send \"${!env_ms_password}\r\"; exp_continue}
                    \"*${!env_ms_user}@*\" {}
                    \"*not found*\" {}
                }
            "
        done
    done

    # Collect netsim logs to local machine
    echo -e "\n*********** Downloading netsim logs to local machine ***********\n"
    if $collect_netsim_logs; then
        netsim_vm_number=0
        for netsim_host in ${!env_netsim_hosts}; do
            netsim_vm_number=$(($netsim_vm_number + 1))

            for netsim_log_to_collect in ${netsim_logs_to_collect}; do
                netsim_log_name=netsim_${netsim_vm_number}_${netsim_log_to_collect}

                expect -c "
                    set timeout ${expect_timeout}
                    spawn sftp -oStrictHostKeyChecking=no ${!env_ms_user}@${!env_ms_host}:/tmp/${logs_folder}/${netsim_log_name} ${logs_folder}/netsim/${netsim_log_name}\r
                    expect {
                        \"*password:*\" {send \"${!env_ms_password}\r\"; exp_continue}
                        \"*100%*\" {}
                        \"*not found*\" {}
                    }
                "
            done

            expect -c "
                set timeout ${expect_timeout}
                spawn sftp -oStrictHostKeyChecking=no ${!env_ms_user}@${!env_ms_host}:/tmp/${logs_folder}/${netsim_cfg_file}_${netsim_vm_number} ${logs_folder}/netsim/${netsim_cfg_file}_${netsim_vm_number}\r
                expect {
                    \"*password:*\" {send \"${!env_ms_password}\r\"; exp_continue}
                    \"*100%*\" {}
                    \"*not found*\" {}
                }
            "

            expect -c "
                set timeout ${expect_timeout}
                spawn sftp -oStrictHostKeyChecking=no ${!env_ms_user}@${!env_ms_host}:/tmp/${logs_folder}/netsim_${netsim_vm_number}_crontab.txt ${logs_folder}/netsim/netsim_${netsim_vm_number}_crontab.txt\r
                expect {
                    \"*password:*\" {send \"${!env_ms_password}\r\"; exp_continue}
                    \"*100%*\" {}
                    \"*not found*\" {}
                }
            "
        done
    fi

    # Delete temp folder in ms
    echo -e "\n*********** Deleting temporary folder \"/tmp/${logs_folder}\" in ms server ***********\n"
    expect -c "
        set timeout ${expect_timeout}
        spawn ssh -o StrictHostKeyChecking=no ${!env_ms_user}@${!env_ms_host}
        expect {
            \"*password:\" {send \"${!env_ms_password}\r\" ; exp_continue}
            \"*${!env_ms_user}@*\"
        }
        send \"rm -rf /tmp/${logs_folder}\r\"
        expect \"*${!env_ms_user}@*\"
        send \"exit\r\"
    "
}

# Read options specified in parameters
PARAMETERS=$(getopt -o hnj:s: --long help,netsim,jira:,service-groups: -n 'fetch_logs_from_enm' -- "$@")
eval set -- "$PARAMETERS"
# extract options and their arguments into variables.
while true ; do
    case "$1" in
        -n|--netsim) collect_netsim_logs=true ; shift ;;
        -j|--jira)
            case "$2" in
                "") shift 2 ;;
                *) jira_code=$2 ; shift 2 ;;
            esac ;;
        -h|--help) show_help_and_exit ; shift ;;
        -s|--service-groups)
            case "$2" in
                "") shift 2 ;;
                *) set_servicegroups_to_collect $2 ; shift 2 ;;
            esac ;;
        --) shift ; break ;;
        *) echo "Internal error!" ; exit 1 ;;
    esac
done

fetch_logs $1