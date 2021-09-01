#!/bin/bash

# Production deployment script.

set -e

. ./pcu-generate-devel.sh

echo Clearing old build...
sudo rm -r build-prod

echo Copying files...
sudo mkdir build-prod
sudo cp -prT build build-prod

echo Successfully deployed to $PCU_DEPLOY_DIR.
