#!/bin/bash

# Development build generation.

# Setup useful variables
export PCU_BUILD_DIR=`realpath $PWD/build`
export PCU_DEPLOY_DIR=`realpath $PWD/build-prod`

# NOTE: This doesn't reload apache!
# We need to do this manually.
. ./install-apache.sh
echo Reloading Apache...
sudo systemctl reload apache2

# Ensure that build is up-to-date
echo Generating build...
PCU_SOURCE_DIR=$(dirname $(realpath $0))
cd ${PCU_SOURCE_DIR}
echo Running Gulp for PCU...
pushd pcu
    npm install
    gulp
popd

cp -r \
    .htaccess \
    errors \
    index.html \
    res \
    build

# TODO: Setup database if it was not done before
