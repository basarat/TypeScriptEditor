TypeScript Playground on Ace
==========================
TypeScript Playground build on ace editor

http://basarat.github.io/TypeScriptEditor/

It is built "around" the ace editor. Uses AMD with RequireJS.

Files used from the Typescript project on codeplex:
- lightHarness (from harness.js)
- typescriptServices.js
were used from the typescript project.

Comments are mentioned in how they were modified, so you should be able to update to the latest version of Typescript fairly easily

Also supports loading of custom definition files. Currently only loads lib.d.ts locally.

# Contributing
Just run locally using the following and visit whatever URL is printed:

```
node http-server
```

# Research 
## Autocomplete 
Docs : https://github.com/ajaxorg/ace/wiki/How-to-enable-Autocomplete-in-the-Ace-editor
Sample : http://plnkr.co/edit/6MVntVmXYUbjR0DI82Cr?p=preview

See Also
-----------------

TypeScript Playground
http://www.typescriptlang.org/Playground/

Ace
http://ace.ajax.org

The src of ace was used. You can build using r.js if you want.

This is a fork of the excellent original project : https://github.com/hi104/typescript-playground-on-ace

The key changes from that project are that this one does not duplicate code (no more multiple version of typescriptServices.js), does not rely on Coffeescript and uses the source of ace which makes it easier for other people to extend.
