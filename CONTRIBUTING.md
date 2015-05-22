# Running locally
Just run locally using the following and visit whatever URL is printed:

```
npm install http-server -g
node http-server
```

# TypeScript source

Files used from the Typescript project on codeplex:
- lightHarness (from harness.js)
- typescriptServices.js
were used from the typescript project.

Comments are mentioned in how they were modified, so you should be able to update to the latest version of Typescript fairly easily.

## Adding a TypeScript Mode 
Needs files in the ace modes folder
specifically:

```ts
// Existing
typescript_highlight_rules.js
typescript.js
```
It is conventional to put files that *additional* files need into the `modes/typescript/` folder so that they do not pollute the root modes folder.

### File Details
#### Original
* `typescript_highlight_rules` is taken as is from core `ace` source (no modifications needed).
* `typescript.js` was modified to create a worker. Basically just the `createWorker` function is redirected to our own file

#### New files
* `typescript_create_worker` : starts a webworker.
* `typescript_worker.js` this file is new. Its based on the `javascript_worker.js` This file talks to the TypeScript language service.

# Ace
http://ace.ajax.org 
The `/lib/ace` folder here is same as `/lib/ace` from ace to make it easier to port this code.

# Research 
## ACE Docs
Best found on github : https://github.com/ajaxorg/ace/tree/gh-pages/api
Being served at : http://ace.c9.io/api/index.html

## Mode
https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode

## Autocomplete 
Docs : https://github.com/ajaxorg/ace/wiki/How-to-enable-Autocomplete-in-the-Ace-editor
Sample : http://plnkr.co/edit/6MVntVmXYUbjR0DI82Cr?p=preview

## Others
Much code is taken from : https://github.com/hi104/typescript-playground-on-ace
The key changes from that project are that this one does not duplicate code (no more multiple version of typescriptServices.js), does not rely on CoffeeScript and provides our code unminified which makes it easier for other people to extend and understand.
