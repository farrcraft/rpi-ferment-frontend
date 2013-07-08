#!/bin/sh
#
# This script can be used to run the rpi-ferment-frontend server.
#
# Written By: Josh Farr <j.wgasa@gmail.com>
#

config_env=$1

[[ ! $1 ]] && config_env=development

pushd .
cd ../lib

function createDir() {
    if [ ! -d $1 ]
    then
        echo "Creating directory [$1]..."
        mkdir $1
    fi
}

frontend_path=`pwd`

createDir "pids"
createDir "logs"

echo "Running node rpi-ferment-frontend for environment [$config_env]..."

start_mode="start"

if [ -r $frontend_path/pids/cluster02.sock ]
then 
    start_mode="restart"
fi

echo "Starting in mode $start_mode..."

NODE_ENV=$config_env node frontend.js $start_mode &

exit 0
