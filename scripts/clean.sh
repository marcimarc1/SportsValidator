#!/bin/sh
set -e

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $SCRIPT_DIR/..
sudo docker compose down --rmi all -v --remove-orphans || true

# Optional :
# sudo docker system prune