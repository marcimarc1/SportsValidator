# Readme

### Running the Web App

1. Install node and npm (I am currently using node 10.19. and npm 6.14.4).
See for example https://docs.npmjs.com/downloading-and-installing-node-js-and-npm.

2. Clone this repository.

3. Navigate to the local root of this repo and run the following commands:
    - `npm install` to install all dependencies.  
    In case that does not work you can try deleting frontend/package-lock.json and try again.  
    If there are any dependency issues you can try running `npm audit fix`.  
    
    - `npm start` to build the app in development mode. This should automatically run the app locally and open a browser window.
    
### Using the Web App

The header still needs some changes in order to properly navigate between the different pages.  
For now, apart from having a look at the start page, its best to manually enter the URL `http://localhost:3000/games` (replace 3000 with your port if it is a different one). From there you can open the Analyses and Tracking Editor pages for the first entry in the file list via the green buttons on the right.  
  
Currently, the Tracking Editor requires a reload (just refresh the page manually) in order to show the first frame in the tracking editor.