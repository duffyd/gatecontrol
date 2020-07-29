#!/bin/bash
WORKING_DIR=/home/pi/webapps/gatecontrol
ACTIVATE_PATH=/home/pi/webapps/gatecontrol/api/venv/bin/activate
cd ${WORKING_DIR}
source ${ACTIVATE_PATH}
exec $@
