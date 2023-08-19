# Developer guide for the backend

Useful resources :
- Backbone : https://github.com/letsgetrusty/api-deployment-example/tree/master


## Docker

### Setup
- The `Dockerfile` under backend specifies how the docker container for the rust web server should be built
- The postgres container is simply pulled from DockerHub

TODO : 
- Set username and password, currently hardcoded as "user" and "pass", to environment variables for safety
cf Backbone resource
- Use a filesystem volume in db container in order to make database changes persistent accross deployments

### Commands
Running and stopping the app :
- Run : `docker compose up`
- Stop : ctrl+c for now

Other useful docker commands :
- List running container : `docker ps -a`
- List all existing containers : `docker container ls -a`
- List all existing images : `docker image ls -a`
- Inspect all docker disk space : `docker system df -v`


TODO Look into
- `docker compose up --build` : forces container to rebuild ?
- `docker compose stop` : stops running containers
- `docker compose rm -f` : removes container but also volumes ? Does it affect external volumes ?
- Attaching to docker compose + each container individually



## Sqlx

Structural changes to the database are managed by migration files, which sqlx library makes sure they are only ever ran once. These files have to follow a particular naming convention, which is why it is easier to create them via the command :
`sqlx migrate add <name>`




## Frontend

TODO : 
- Have an automated script that integrates the frontend into the backend before running `docker compose up`