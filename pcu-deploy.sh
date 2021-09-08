#!/bin/bash

# Production deployment script.

set -e

. ./pcu-generate-devel.sh

echo Clearing old build...
rm -r build-prod

echo Copying files...
mkdir build-prod
cp -prT build build-prod

. ./install-apache.sh

echo Successfully deployed to $PCU_DEPLOY_DIR.
