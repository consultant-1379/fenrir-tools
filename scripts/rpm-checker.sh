#!/bin/bash
BLUE='\033[38;2;0;119;190m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NO_COLOR='\033[0m'
CONTENTS_DIR=rpm_contents



file_flag="FALSE"
rpm_flag="FALSE"
path_flag="FALSE"

find_rpms() {
  path_to_rpms=$1
  found_rpms=$(find "$path_to_rpms" -name '*SNAPSHOT*.rpm')
  echo "$found_rpms"
}

unpack_rpm() {
  rpm_path_in_integrated_repo=$1
  integrated_repo=$2
  mkdir -p "$integrated_repo/$CONTENTS_DIR"
  get_files_in_rpm=$(rpm2cpio "$rpm_path_in_integrated_repo" | cpio -idmv -D "$integrated_repo/$CONTENTS_DIR" 2>&1)
  echo "$get_files_in_rpm"
}

echo_with_color() {
  if [ "$file_flag" = "TRUE" ]; then
    FILE_NAME="${BLUE}$1${NO_COLOR}"
  fi

  if [ "$rpm_flag" = "TRUE" ]; then
    RPM_NAME="${GREEN}$2${NO_COLOR}"
  fi

  if [ "$path_flag" = "TRUE" ]; then
    PATH_NAME="${YELLOW}$3${NO_COLOR}"
  fi
  echo -e "$FILE_NAME $RPM_NAME $PATH_NAME" >>"$OUTPUT_FILE"
}

check_contents_of_jar() {
  java_file=$1
  file_name_without_java_ending="${java_file%.java}"
  integrated_repo=$2
  rpm_file_path=$3
  rpm_name=$4

  if grep -q "$file_name_without_java_ending.class" <<<"$(jar -tf $integrated_repo/$CONTENTS_DIR/$rpm_file_path)"; then
    echo_with_color "$java_file" "$rpm_name" "$rpm_file_path"
  fi
}

choose_path() {
  if grep -q "$file_name_in_integrated_repo" <<<"$rpm_file_path"; then
    echo_with_color "$file_name_in_integrated_repo" "$rpm_full_path" "${rpm_file_path#./}"
  elif [[ $file_name_in_integrated_repo == *.java ]] && [[ $rpm_file_path == *SNAPSHOT*.jar ]]; then
    check_contents_of_jar "$file_name_in_integrated_repo" "$integrated_repo" "${rpm_file_path#./}" "$rpm_full_path"
  elif [[ $file_name_in_integrated_repo == *.java ]] && [[ $rpm_file_path == *.war ]]; then
    $(cd $integrated_repo/$CONTENTS_DIR && jar -xf $rpm_file_path)
    compare_changed_files_to_rpm_files "$file_name_in_integrated_repo" "$(jar -tf $integrated_repo/$CONTENTS_DIR/${rpm_file_path#./})" "$rpm_full_path" "$integrated_repo"
  elif [[ $file_name_in_integrated_repo == *.java ]] && [[ $rpm_file_path == *.ear ]]; then
    $(cd $integrated_repo/$CONTENTS_DIR && jar -xf $rpm_file_path)
    compare_changed_files_to_rpm_files "$file_name_in_integrated_repo" "$(jar -tf $integrated_repo/$CONTENTS_DIR/${rpm_file_path#./})" "$rpm_full_path" "$integrated_repo"
  elif [[ $file_name_in_integrated_repo == *.java ]] && [[ $rpm_file_path == *.rar ]]; then
    $(cd $integrated_repo/$CONTENTS_DIR && jar -xf $rpm_file_path)
    compare_changed_files_to_rpm_files "$file_name_in_integrated_repo" "$(jar -tf $integrated_repo/$CONTENTS_DIR/${rpm_file_path#./})" "$rpm_full_path" "$integrated_repo"
  fi
}

unpack_archives() {
  integrated_repo=$1
  rpm_file_path=$2
  eval "$(cd $integrated_repo/$CONTENTS_DIR && jar -xf $rpm_file_path)"
}

compare_changed_files_to_rpm_files() {
  file_name_in_integrated_repo=$1
  all_files_paths_within_rpm=$2
  rpm_full_path=$3
  rpm_name=$(basename "$3")
  integrated_repo=$4
  for rpm_file_path in $all_files_paths_within_rpm; do
    if grep -q "$file_name_in_integrated_repo" <<<"$rpm_file_path"; then
      echo_with_color "$file_name_in_integrated_repo" "$rpm_full_path" "${rpm_file_path#./}"
    elif [[ $file_name_in_integrated_repo == *.java ]] && [[ $rpm_file_path == *SNAPSHOT*.jar ]]; then
      check_contents_of_jar "$file_name_in_integrated_repo" "$integrated_repo" "${rpm_file_path#./}" "$rpm_full_path"
    elif [[ $rpm_file_path == *.war ]]; then
      unpack_archives "$integrated_repo" "$rpm_file_path"
      compare_changed_files_to_rpm_files "$file_name_in_integrated_repo" "$(jar -tf $integrated_repo/$CONTENTS_DIR/${rpm_file_path#./})" "$rpm_full_path" "$integrated_repo"
    elif [[ $rpm_file_path == *.ear ]]; then
      unpack_archives "$integrated_repo" "$rpm_file_path"
      compare_changed_files_to_rpm_files "$file_name_in_integrated_repo" "$(jar -tf $integrated_repo/$CONTENTS_DIR/${rpm_file_path#./})" "$rpm_full_path" "$integrated_repo"
    elif [[ $rpm_file_path == *.rar ]]; then
      unpack_archives "$integrated_repo" "$rpm_file_path"
      compare_changed_files_to_rpm_files "$file_name_in_integrated_repo" "$(jar -tf $integrated_repo/$CONTENTS_DIR/${rpm_file_path#./})" "$rpm_full_path" "$integrated_repo"
    fi
  done
}

remove_directory() {
  integrated_repo=$1
  rm -rf "$integrated_repo/$CONTENTS_DIR"
}

print_help_message() {
  printf "%s\n" \
    "Description: Scan rpms produced in repos to figure out into which rpms modified files go into" \
    "Usage: rpm-checker <option> <repo> <filename(s)>" \
    "Perform an action based on <option>" \
    "Guide: https://confluence-oss.seli.wh.rnd.internal.ericsson.com/display/FEN/rpm-checker" \
    "" \
    "Options:" \
    "  -f, --file    Displays the filename, e.g -f <repo> <filename>" \
    "  -r, --rpm     Displays the rpm names that the file(s) are present in, e.g. -r <repo> <filename>" \
    "  -p, --path    Displays the fullpath of the file within a rpm e.g. -p <repo> <filename>" \
    "  -h, --help    Display this help and exit"
}

parse_commandline() {
  if [ $# -eq 0 ]; then
    print_help_message
    exit 0
  fi

  while (("$#")); do
    case "$1" in
    -f | --file)
      file_flag="TRUE"
      shift
      ;;
    -r | --rpm)
      rpm_flag="TRUE"
      shift
      ;;
    -p | --path)
      path_flag="TRUE"
      shift
      ;;
    -h | --help)
      print_help_message
      exit 0
      ;;
    *)
      if [[ $1 =~ ^- ]]; then
        echo "Invalid option: $1" >&2
        exit 1
      else
        break
      fi
      ;;
    esac
  done

  OUTPUT_FILE=$(mktemp)
  integrated_repo="$1"
  files_to_check_in_rpms=("${@:1}")
  relative_directory_of_rpms_in_integrated_repo=$(find_rpms "$integrated_repo")
  remove_directory "$integrated_repo"
  for relative_directory_of_rpm in $relative_directory_of_rpms_in_integrated_repo; do
    unpacked_rpm_files=$(unpack_rpm "$relative_directory_of_rpm" "$integrated_repo")
    for file in "${files_to_check_in_rpms[@]}"; do
      compare_changed_files_to_rpm_files "$file" "$unpacked_rpm_files" "$relative_directory_of_rpm" "$integrated_repo"
    done
    remove_directory "$integrated_repo"
  done

  cat "$OUTPUT_FILE" | sed 's/[[:space:]]*$//'
  rm "$OUTPUT_FILE"
}

parse_commandline "$@"
