#!/bin/bash
vercomp () {
    if [[ $1 == $2 ]]
    then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2) # Removed curly braces for array assignment
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++))
    do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++))
    do
        # Removing leading zeros for proper integer comparison
        ver1[i]=${ver1[i]#0}
        ver2[i]=${ver2[i]#0}

        # Check if field is empty after removing leading zeros
        [[ -z ${ver1[i]} ]] && ver1[i]=0
        [[ -z ${ver2[i]} ]] && ver2[i]=0

        if ((10#${ver1[i]} > 10#${ver2[i]}))
        then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]}))
        then
            return 2
        fi
    done
    return 0
}


testvercomp () {
    vercomp $1 $2
    case $? in
        0) op='=';;
        1) op='>';;
        2) op='<';;
    esac
    if [[ $op != $3 ]]
    then
        echo "[NODE][VERSION][MISMATCH] | Expected '$2', Actual '$1', Arg1 '$1'"
        exit 1
    else
        echo "MATCHED VERSION: '$1 $op $2'"
    fi
}

check_version_format() {
    local version_string=$1
    # Check if version string contains '>=' or other range specifiers
    if [[ $version_string =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "[NODE][VERSION]: Version format is correct."
    else
        echo "[NODE][VERSION][NOT ALLOWED]: In package.json engines node version must be exact, not ranges."
        exit 1
    fi
}


FILE_PATH=./package.json

echo "Checking $FILE_PATH"
NODE_VERSION=$(node -v | sed 's/v//g')
ENGINE_VERSION=$(node -pe "require('$FILE_PATH').engines.node")
check_version_format "$ENGINE_VERSION"
echo "ENGINE_VERSION $ENGINE_VERSION --- NODE_VERSION = $NODE_VERSION"
testvercomp "$ENGINE_VERSION" "$NODE_VERSION" =
echo "[NODE][VERSION][OK]"
exit 0
# if [[ "$ENGINE_VERSION" == *"2$NODE_VERSION"* ]]; then
#   echo "[NODE][VERSION][OK]"
# else
#   echo "[NODE][VERSION][MISMATCH] | REQUIRED/INSTALLED: $ENGINE_VERSION/$NODE_VERSION"
#   exit 1
# fi
# Improve this script with actual version comparision
# https://stackoverflow.com/a/4025065