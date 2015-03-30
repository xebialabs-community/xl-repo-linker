XL Repo Linker
=======

When you reproduced some issue in XL Deploy and you want to share your environment with somebody else this tool will 
be helpful for you. Central point of communication of `snapshots` is Jira. When you prepared your environment you just 
need to enter an issue number and press `Export` button. As easy as that is required from the part who wants to import 
it - enter issue number and press `Import` button. 
 
To setup XL Repo Linker you need to install 2 parts of application: npm module as a server and Chrome extension as a client. 

Installation
-------------

When you run xl-repo-linker first time, it will create **.xl-repo-linker-config.yml** in your user home directory, 
where you will need to provide for some of the properties your specific values related to credentials of Jira user and XL Deploy.


## Installing globally:

Installation via `npm`.  If you don't have `npm` yet:

     curl https://npmjs.org/install.sh | sh

Once you have `npm`:

     npm install xl-repo-linker -g

This will install `xl-repo-linker` globally so that it may be run from the command line.

## How to run the server:

     xl-repo-linker

## Chrome Extension
 
   After you installed the server part you need to install the Chrome Extension. Currently it is available by [this link](https://chrome.google.com/webstore/detail/xl-repo-linker/eijgifcjmgogkgcindlfkhebacniffod)