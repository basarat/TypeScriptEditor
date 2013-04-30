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

See Also
-----------------

TypeScript Playground
http://www.typescriptlang.org/Playground/

Ace
http://ace.ajax.org

The src of ace was used. You can build using r.js if you want.

This is a fork of the excellent original project : https://github.com/hi104/typescript-playground-on-ace

The key changes from that project are that this one does not duplicate code (no more multiple version of typescriptServices.js), does not rely on Coffeescript and uses the source of ace which makes it easier for other people to extend.
