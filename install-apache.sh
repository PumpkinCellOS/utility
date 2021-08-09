#!/bin/sh

# Install Apache config files (only devel)
echo Copying Apache config files...
sudo cp -r apache/sites-available/* /etc/apache2/sites-available
sudo cp -rP apache/sites-enabled/* /etc/apache2/sites-enabled

echo Filling variable fields
# TODO: Are there some variables in apache config files? maybe use them if so.
sudo sed -i.bak "s#\\\${PCU_BUILD_DIR}#$PCU_BUILD_DIR#" /etc/apache2/sites-available/pcu-devel.conf
sudo sed -i.bak "s#\\\${PCU_DEPLOY_DIR}#$PCU_DEPLOY_DIR#" /etc/apache2/sites-available/pcu-prod-le-ssl.conf
sudo sed -i.bak "s#\\\${PCU_DEPLOY_DIR}#$PCU_DEPLOY_DIR#" /etc/apache2/sites-available/pcu-prod-ssl.conf