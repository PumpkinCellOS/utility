#!/bin/bash

# Production deployment script.

. ./pcu-generate-devel.sh

echo Copying files...
sudo rm -r /var/www/pcu-prod
sudo mkdir /var/www/pcu-prod
sudo cp -prT ../html-build /var/www/pcu-prod

# Install Apache config files
echo Copying Apache config files...
sudo cp -r apache/* /etc/apache2

# TODO: Setup database if it was not done before
# TODO: Do not reload apache double
echo Reloading Apache...
sudo systemctl reload apache2
echo Done!
