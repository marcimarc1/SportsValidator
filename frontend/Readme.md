# Readme

### Running the Web App

The Webapp was only developed and tested on a Linux (Ubuntu 20.4) environment, but in theory it should work anywhere regardless of the operating system.

1. Install node and npm (I am currently using node 10.19. and npm 6.14.4).
See for example https://docs.npmjs.com/downloading-and-installing-node-js-and-npm or simply install both of these through your normal package manager.

2. Clone this repository.

3. Navigate into the frontend folder of this repo (where this file is located) and run the following commands:
    - `npm install` to install all dependencies.  
    In case that does not work you can try deleting frontend/package-lock.json and try again.  
    If there are any dependency issues you can try running `npm audit fix`.  
    
    - `npm start` to build the app in development mode. This should automatically run the app locally and open a browser window. The app is usually served by default at localhost:3000.  
      
In case the HOST environmental variable is set, the app might not be served at localhost. Try unsetting it temporarily by running `unset HOST` in your terminal or change your bash configuration in order to not set it (see https://stackoverflow.com/questions/53912056/npm-start-on-new-create-react-app-build-returns-elifecycle-error for more information and instructions).
    
Currently, the Tracking Editor requires a reload (just refresh the page manually) in order to show the first frame in the tracking editor.

For making a production build of the app have a look at https://create-react-app.dev/docs/deployment/
    
### Further Documentation

For my final report on this webapp which includes an overview of the features and the development process as well as documentation for further development, see the file ../documentation/frontend/final_report/Final_Report_Frontend.pdf