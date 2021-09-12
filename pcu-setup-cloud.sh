#!/bin/bash

echo Generating /var/pcu-cloud directories...
sudo mkdir -p /var/pcu-cloud/{files,files_pending,internal}
# FIXME: Do not hardcode user
sudo chown -R http:http /var/pcu-cloud
