#!/bin/bash

# Development build generation.

echo Generating build...
PCU_SOURCE_DIR=$(dirname $(realpath $0))

# Ensure that html-build is up-to-date
cd ${PCU_SOURCE_DIR}
echo Running Gulp...
gulp

# Install Apache config files (only devel)
echo Copying Apache config files...
sudo cp -r apache/sites-available/pcu-devel.conf /etc/apache2/sites-available/pcu-devel.conf
sudo cp -r apache/sites-enabled/pcu-devel.conf /etc/apache2/sites-enabled/pcu-devel.conf

# TODO: Setup database if it was not done before
echo Reloading Apache...
sudo systemctl reload apache2
echo Done!
