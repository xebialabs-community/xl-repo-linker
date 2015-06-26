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

To update to the latest version after a while:

    npm update xl-repo-linker -g 
    
To check current version of xl-repo-linker:

    npm list -g | grep xl-repo-linker
    
## How does it work

  Currently it is available 1 out of 3 modes:
     
  * Local (by default) - the local repository in ~/.xld-repo will be created and you can save all your snapshots locally.
  It is perfectly suits the needs when you don't need to share your snapshots with nobody else, but just recover your previous
  state.
  
  * Jira - when you want to attach your snapshot to Jira issue and share your snapshot with a person who has an access to Jira as well.
   It does work only with relatively small artifacts (by default it is 10Mb, but administrator can increase this value).
  
  * Google Drive - when your snapshot is really big and you don't want to make Jira slow, this is a better way to make share. 
  
  This modes you can change in the configuration file or override it with extra option: --mode <mode>

## How to run the server:

     xl-repo-linker
     
## How to use it cli mode:

You can see all options by running

    xl-repo-linker -h
    
### How to export xld-snapshot to Jira?

    xl-repo-linker -e DEPL-1000
    
### How to import xld-snapshot from Jira issue?

    xl-repo-linker -i DEPL-1000

## Chrome Extension
 
   After you installed the server part you need to install the Chrome Extension. Currently it is available by [this link](https://chrome.google.com/webstore/detail/xl-repo-linker/eijgifcjmgogkgcindlfkhebacniffod)