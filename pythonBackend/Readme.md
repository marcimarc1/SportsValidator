## Python API

### Structure
The Backend uses the FastAPI framework.
The Backend follows the layered architecture pattern, functionality in each subfolder can be summed up with:
- Routers handle incomming traffic. New routers need to be included in the fastAPI app in the main file.
(- Validators handle input validation)
- Logic-Classes provide the functionality of the system
- Database handles connection to the postgresql database and manages database models.
- There are two different model types:
    - db.db_models for data models
    - pydantic_models for automatic JSON (de)serialization with pydantic
- The alembic framework handles database migration and seed generation 
  There is a collection of useful alembic commands in the "alembic_commands.txt"-file.

### Running the Backend outside of docker
To install the packages from the requirements text use the command 'pip install -r requirements.txt' in the pythonBackend folder
After packages are installed you can start the backend with 'fastapi run' (or 'fastapi dev' for developer mode)

### Automatic Documentation and Swagger-UI
One useful tool FastAPI provides is an automated documentation of services in the swagger-UI.
You can access the web interface using the route "/docs".
The interface allows manual testing of API-services.
FastAPI-documentation: https://fastapi.tiangolo.com/features/#automatic-docs
 
      
