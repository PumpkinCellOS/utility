#!/bin/bash

# Production deployment script.

PCU_SOURCE_DIR=$(dirname $(realpath $0))

# Ensure that html-build is up-to-date
cd ${PCU_SOURCE_DIR}
echo Running Gulp...
gulp

echo Copying files...
sudo rm -r /var/www/pcu-prod
sudo mkdir /var/www/pcu-prod
sudo cp -prT ../html-build /var/www/pcu-prod

# TODO: Install Apache config files
sudo cp -r apache/* /etc/apache2

# TODO: Setup database if it was not done before
echo Reloading Apache...
sudo systemctl reload apache2
echo Done!
