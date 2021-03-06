# Workshop at Outbox the 7th of October 2015

## Prerequisites

For working with this code you need node and npm installed. Below are instructions for getting this application up and running on your machine.

Install git: https://confluence.atlassian.com/bitbucket/set-up-git-744723531.html

### Windows
Install node and npm: http://blog.teamtreehouse.com/install-node-js-npm-windows

### Mac OSX
Install node and npm: http://coolestguidesontheplanet.com/installing-node-js-on-osx-10-10-yosemite/

### Linux (Ubuntu)
Install node and npm: sudo apt-get install nodejs npm

## Preparing and testing the code

Getting and testing the code
* Open a terminal
* Go to a directory where you want this source code
* Run: git clone https://github.com/acken/outbox-workshop.git
* In the terminal go into the handler directory
* Run: npm install
* You can now start the application with
    * Windows run: set DEBUG=handler & npm start
    * Mac OSX / Linux run: DEBUG=handler npm start
* If it says queue service not found you are good

If everything works you should get a greeting in json format in your browser. If not write me an issue at https://github.com/acken/outbox-workshop/issues and I'll help you out.

You'll find more documentation in the wiki at https://github.com/acken/outbox-workshop/wiki
