#!/bin/bash

PCU_SOURCE_DIR=$(dirname $(realpath $0))

# Ensure that html-build is up-to-date
cd ${PCU_SOURCE_DIR}
echo Running Gulp...
gulp

echo Copying files...
rm -r ../html-public
mkdir ../html-public
cp -prT ../html-build ../html-public
echo Restarting Apache...
sudo systemctl restart apache2
echo Done!
