/// This is an extract of harness.js .
///   Just the ScriptInfo and the
///  TypeScriptLS classes.
/// Notice the manual require calls for ./typescriptServices.
define(function(require, exports, module) {

    var __extends = this.__extends || function (d, b) {
        function __() {
            this.constructor = d;
        }
        __.prototype = b.prototype;
        d.prototype = new __();
    };

    var Services = require('./typescriptServices').Services;
    var TypeScript = require('./typescriptServices').TypeScript;

	// paste script info. And add export at end 
	var ScriptInfo = (function () {
        function ScriptInfo(fileName, content, isOpen) {
            if (typeof isOpen === "undefined") { isOpen = true; }
            this.fileName = fileName;
            this.content = content;
            this.isOpen = isOpen;
            this.version = 1;
            this.editRanges = [];
            this.lineMap = null;
            this.setContent(content);
        }
        ScriptInfo.prototype.setContent = function (content) {
            this.content = content;
            this.lineMap = TypeScript.LineMap.fromString(content);
        };
        ScriptInfo.prototype.updateContent = function (content) {
            this.editRanges = [];
            this.setContent(content);
            this.version++;
        };
        ScriptInfo.prototype.editContent = function (minChar, limChar, newText) {
            var prefix = this.content.substring(0, minChar);
            var middle = newText;
            var suffix = this.content.substring(limChar);
            this.setContent(prefix + middle + suffix);
            this.editRanges.push({
                length: this.content.length,
                textChangeRange: new TypeScript.TextChangeRange(TypeScript.TextSpan.fromBounds(minChar, limChar), newText.length)
            });
            this.version++;
        };
        ScriptInfo.prototype.getTextChangeRangeBetweenVersions = function (startVersion, endVersion) {
            if (startVersion === endVersion) {
                return TypeScript.TextChangeRange.unchanged;
            }
            var initialEditRangeIndex = this.editRanges.length - (this.version - startVersion);
            var lastEditRangeIndex = this.editRanges.length - (this.version - endVersion);
            var entries = this.editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
            return TypeScript.TextChangeRange.collapseChangesAcrossMultipleVersions(entries.map(function (e) {
                return e.textChangeRange;
            }));
        };
        return ScriptInfo;
    })();
	// Added export 
	 exports.ScriptInfo = ScriptInfo;
	 // Paste TypeScriptLS: 
	 var TypeScriptLS = (function () {
        function TypeScriptLS() {
            this.ls = null;
            this.fileNameToScript = new TypeScript.StringHashTable();
        }
        TypeScriptLS.prototype.addDefaultLibrary = function () {
            this.addScript("lib.d.ts", Harness.Compiler.libText);
        };
        TypeScriptLS.prototype.addFile = function (fileName) {
            var code = readFile(name);
            this.addScript(name, code);
        };
        TypeScriptLS.prototype.getScriptInfo = function (fileName) {
            return this.fileNameToScript.lookup(fileName);
        };
        TypeScriptLS.prototype.addScript = function (fileName, content) {
            var script = new ScriptInfo(fileName, content);
            this.fileNameToScript.add(fileName, script);
        };
        TypeScriptLS.prototype.updateScript = function (fileName, content) {
            var script = this.getScriptInfo(fileName);
            if (script !== null) {
                script.updateContent(content);
                return;
            }
            this.addScript(fileName, content);
        };
        TypeScriptLS.prototype.editScript = function (fileName, minChar, limChar, newText) {
            var script = this.getScriptInfo(fileName);
            if (script !== null) {
                script.editContent(minChar, limChar, newText);
                return;
            }
            throw new Error("No script with name '" + name + "'");
        };
        TypeScriptLS.prototype.information = function () {
            return false;
        };
        TypeScriptLS.prototype.debug = function () {
            return true;
        };
        TypeScriptLS.prototype.warning = function () {
            return true;
        };
        TypeScriptLS.prototype.error = function () {
            return true;
        };
        TypeScriptLS.prototype.fatal = function () {
            return true;
        };
        TypeScriptLS.prototype.log = function (s) {
        };
        TypeScriptLS.prototype.getCompilationSettings = function () {
            return "";
        };
        TypeScriptLS.prototype.getScriptFileNames = function () {
            return JSON2.stringify(this.fileNameToScript.getAllKeys());
        };
        TypeScriptLS.prototype.getScriptSnapshot = function (fileName) {
            return new ScriptSnapshotShim(this.getScriptInfo(fileName));
        };
        TypeScriptLS.prototype.getScriptVersion = function (fileName) {
            return this.getScriptInfo(fileName).version;
        };
        TypeScriptLS.prototype.getScriptIsOpen = function (fileName) {
            return this.getScriptInfo(fileName).isOpen;
        };
        TypeScriptLS.prototype.getDiagnosticsObject = function () {
            return new LanguageServicesDiagnostics("");
        };
        TypeScriptLS.prototype.getLanguageService = function () {
            var ls = new Services.TypeScriptServicesFactory().createLanguageServiceShim(this);
            ls.refresh(true);
            this.ls = ls;
            return ls;
        };
        TypeScriptLS.prototype.parseSourceText = function (fileName, sourceText) {
            return TypeScript.SyntaxTreeToAstVisitor.visit(TypeScript.Parser.parse(fileName, TypeScript.SimpleText.fromScriptSnapshot(sourceText), TypeScript.isDTSFile(fileName)), fileName, new TypeScript.CompilationSettings());
        };
        TypeScriptLS.prototype.parseFile = function (fileName) {
            var sourceText = TypeScript.ScriptSnapshot.fromString(IO.readFile(fileName));
            return this.parseSourceText(fileName, sourceText);
        };
        TypeScriptLS.prototype.lineColToPosition = function (fileName, line, col) {
            var script = this.fileNameToScript.lookup(fileName);
            assert.notNull(script);
            assert.is(line >= 1);
            assert.is(col >= 1);
            return script.lineMap.getPosition(line - 1, col - 1);
        };
        TypeScriptLS.prototype.positionToZeroBasedLineCol = function (fileName, position) {
            var script = this.fileNameToScript.lookup(fileName);
            assert.notNull(script);
            var result = script.lineMap.getLineAndCharacterFromPosition(position);
            assert.is(result.line() >= 0);
            assert.is(result.character() >= 0);
            return {
                line: result.line(),
                character: result.character()
            };
        };
        TypeScriptLS.prototype.checkEdits = function (sourceFileName, baselineFileName, edits) {
            var script = readFile(sourceFileName);
            var formattedScript = this.applyEdits(script, edits);
            var baseline = readFile(baselineFileName);
            assert.noDiff(formattedScript, baseline);
            assert.equal(formattedScript, baseline);
        };
        TypeScriptLS.prototype.applyEdits = function (content, edits) {
            var result = content;
            edits = this.normalizeEdits(edits);
            for(var i = edits.length - 1; i >= 0; i--) {
                var edit = edits[i];
                var prefix = result.substring(0, edit.minChar);
                var middle = edit.text;
                var suffix = result.substring(edit.limChar);
                result = prefix + middle + suffix;
            }
            return result;
        };
        TypeScriptLS.prototype.normalizeEdits = function (edits) {
            var result = [];
            function mapEdits(edits) {
                var result = [];
                for(var i = 0; i < edits.length; i++) {
                    result.push({
                        edit: edits[i],
                        index: i
                    });
                }
                return result;
            }
            var temp = mapEdits(edits).sort(function (a, b) {
                var result = a.edit.minChar - b.edit.minChar;
                if (result === 0) {
                    result = a.index - b.index;
                }
                return result;
            });
            var current = 0;
            var next = 1;
            while(current < temp.length) {
                var currentEdit = temp[current].edit;
                if (next >= temp.length) {
                    result.push(currentEdit);
                    current++;
                    continue;
                }
                var nextEdit = temp[next].edit;
                var gap = nextEdit.minChar - currentEdit.limChar;
                if (gap >= 0) {
                    result.push(currentEdit);
                    current = next;
                    next++;
                    continue;
                }
                if (currentEdit.limChar >= nextEdit.limChar) {
                    next++;
                    continue;
                } else {
                    throw new Error("Trying to apply overlapping edits");
                }
            }
            return result;
        };
        return TypeScriptLS;
    })();
    // Paste till the end:
	exports.TypeScriptLS = TypeScriptLS;
});