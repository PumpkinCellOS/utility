#!/bin/bash

# Development build generation.

# Setup useful variables
export PCU_BUILD_DIR=`realpath $PWD/build`
export PCU_DEPLOY_DIR=`realpath $PWD/build-prod`

echo Clearing old build...
rm -r ${PCU_BUILD_DIR}

mkdir build

# Ensure that build is up-to-date
echo Generating build...
PCU_SOURCE_DIR=$(dirname $(realpath $0))
cd ${PCU_SOURCE_DIR}
echo Running Gulp for PCU...
pushd pcu
    #npm install
    gulp
popd

cp -r \
    *.php \
    *.css \
    .htaccess \
    about \
    errors \
    favicon.ico \
    res \
    tilify \
    build

# TODO: Setup database if it was not done before
