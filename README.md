XL Repo Linker
=======

You can find slides [here](http://slides.com/acierto/xl-repo-linker)

Introduction
------------

When you reproduced some issue in XL Deploy and you want to share your environment with somebody else this tool will 
be helpful for you. Central point of communication of `snapshots` are Jira and Google Drive, also you can collect your 
snapshots on your local computer. When you prepared your environment you need to export it by using command line or 
chrome extension. Currently Chrome Extension supports only Jira, for other modes you need to use command line tool. In
coming releases you can do it in both ways. 
 
To setup XL Repo Linker you need to install 2 parts of application: npm module as a server and Chrome extension as a client. 

Installation
-------------

When you run xl-repo-linker first time, just by running xl-repo-linker command, it will 
create **.xl-repo-linker-config.yml** in your user home directory, where you will need to provide for some of the 
properties your specific values related to credentials of Jira user and XL Deploy.

If you skip some required fields in the configuration file XL Repo Linker will tell you about it when you try to run it. 
 
For using Google Drive mode you need to ask me Google Drive Key and Mongo ApiKey. I don't add it by default there due to 
security concerns. 

## Installing globally:

Installation via `npm`.  If you don't have `npm` yet:

     curl https://npmjs.org/install.sh | sh

Once you have `npm`:

     npm install xl-repo-linker -g
     
If you already have installed node, please check that it is not older then 0.10:
 
    node -v

This will install `xl-repo-linker` globally so that it may be run from the command line.

To update to the latest version after a while:

    npm update xl-repo-linker -g 
    
To check current version of xl-repo-linker:

    npm list -g | grep xl-repo-linker
    
## How does it work

  Currently it is available 3 modes:
     
  * Local (by default) - the local repository in ~/.xld-repo will be created and you can save all your snapshots locally.
  It is perfectly suits the needs when you don't need to share your snapshots with nobody else, but just recover your previous
  state.
  
  
    xl-repo-linker -e my-snapshot-name --mode local # (alternatively you can change the mode inside ~/.xl-repo-linker-config.yml)
  
  * Jira - when you have to attach your snapshot to Jira issue and share your snapshot with a person who has an access to Jira as well.
   It does work only with relatively small artifacts (by default it is 10Mb, but administrator can increase this value).


    xl-repo-linker -e DEPL-1000 --mode jira # (alternatively you can change the mode inside ~/.xl-repo-linker-config.yml)
  
  * Google Drive - when your snapshot is big and you don't want to make Jira slow, or both parties doesn't have access to Jira then 
  this way becomes better to share.


    xl-repo-linker -e my-snapshot-name --mode google-drive # (alternatively you can change the mode inside ~/.xl-repo-linker-config.yml)
  
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
    
## Configuration

You can configure XL Repo Linker for your needs, you can find many configuration sections for that in **.xl-repo-linker-config.yml** inside your user home directory

### Snapshot section
    
This section is responsible for the folders/files which will be included into snapshot. For examples how to use it you can
 find it [here] (https://github.com/cowboy/node-globule)

## Chrome Extension
 
   After you installed the server part you need to install the Chrome Extension. Currently it is available by [this link](https://chrome.google.com/webstore/detail/xl-repo-linker/aclpjhlfbodcpenmbeibgocfpknkllcn)
   
## Feedback
 
   If you feel lack of documentation or not clear enough how to use or setup it, please let me now about it. Feel free to add your comments/improvement/issues 
   [here](https://github.com/xebialabs-community/xl-repo-linker/issues)