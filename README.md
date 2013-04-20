TypeScript Playground on Ace
==========================
TypeScript Playground build on ace editor

http://basarat.github.com/typescripteditor/

It is built "around" the ace editor so uses ACE to manage dependencies instead of requirejs etc.

This means you either use the compiled typescript files and change :
define(function(require, exports, module) {
to something like:
define('typescriptServices', ['require', 'exports', 'module' ], function(require, exports, module) {

OR look at how we manually define exports FileService.ts

See Also
-----------------

TypeScript Playground
http://www.typescriptlang.org/Playground/

Ace
http://ace.ajax.org
