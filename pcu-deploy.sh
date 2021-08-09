#!/bin/bash

# Production deployment script.

. ./pcu-generate-devel.sh

echo Copying files...
sudo rm -r build-prod
sudo mkdir build-prod
sudo cp -prT build build-prod

echo Successfully deployed to $PCU_DEPLOY_DIR.
