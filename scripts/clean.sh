docker-compose down --rmi all -v --remove-orphans
docker image prune --force
docker builder prune --force

rm -r backend/react-app