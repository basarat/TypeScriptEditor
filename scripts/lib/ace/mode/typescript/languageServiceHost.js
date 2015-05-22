'use strict';
define(["require", "exports"], function (require, exports) {
    function clone(target) {
        return assign(Array.isArray(target) ? [] : {}, target);
    }
    function assign(target) {
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        return items.reduce(function (target, source) {
            return Object.keys(source).reduce(function (target, key) {
                target[key] = source[key];
                return target;
            }, target);
        }, target);
    }
    function createLanguageServiceHost(currentDir, defaultLibFileName) {
        var compilationSettings;
        var fileNameToScript = Object.create(null);
        function addScript(fileName, content) {
            var script = createScriptInfo(content);
            fileNameToScript[fileName] = script;
        }
        function removeScript(fileName) {
            delete fileNameToScript[fileName];
        }
        function removeAll() {
            fileNameToScript = Object.create(null);
        }
        function hasScript(fileName) {
            return !!fileNameToScript[fileName];
        }
        function updateScript(fileName, content) {
            var script = fileNameToScript[fileName];
            if (script) {
                script.updateContent(content);
                return;
            }
            throw new Error('No script with name \'' + fileName + '\'');
        }
        function editScript(fileName, minChar, limChar, newText) {
            var script = fileNameToScript[fileName];
            if (script) {
                script.editContent(minChar, limChar, newText);
                return;
            }
            throw new Error('No script with name \'' + fileName + '\'');
        }
        function setScriptIsOpen(fileName, isOpen) {
            var script = fileNameToScript[fileName];
            if (script) {
                script.setIsOpen(isOpen);
                return;
            }
            throw new Error('No script with name \'' + fileName + '\'');
        }
        function setCompilationSettings(settings) {
            compilationSettings = Object.freeze(clone(settings));
        }
        function getScriptContent(fileName) {
            var script = fileNameToScript[fileName];
            if (script) {
                return script.getContent();
            }
            return null;
        }
        function getScriptVersion(fileName) {
            var script = fileNameToScript[fileName];
            if (script) {
                return '' + script.getVersion();
            }
            return '0';
        }
        function getScriptIsOpen(fileName) {
            var script = fileNameToScript[fileName];
            if (script) {
                return script.getIsOpen();
            }
            return false;
        }
        function getScriptSnapshot(fileName) {
            var script = fileNameToScript[fileName];
            if (script) {
                return script.getScriptSnapshot();
            }
            return null;
        }
        return {
            log: function () { return null; },
            error: function () { return null; },
            trace: function () { return null; },
            addScript: addScript,
            removeScript: removeScript,
            removeAll: removeAll,
            updateScript: updateScript,
            hasScript: hasScript,
            editScript: editScript,
            getScriptContent: getScriptContent,
            setCompilationSettings: setCompilationSettings,
            setScriptIsOpen: setScriptIsOpen,
            getCompilationSettings: function () { return compilationSettings; },
            getScriptFileNames: function () { return Object.keys(fileNameToScript); },
            getCurrentDirectory: function () { return currentDir; },
            getDefaultLibFileName: function () { return defaultLibFileName; },
            getScriptVersion: getScriptVersion,
            getScriptIsOpen: getScriptIsOpen,
            getScriptSnapshot: getScriptSnapshot,
        };
    }
    exports.createLanguageServiceHost = createLanguageServiceHost;
    function createScriptInfo(content) {
        var scriptVersion = 1;
        var editRanges = [];
        var isOpen = false;
        var _lineStarts;
        var _lineStartIsDirty = true;
        function getLineStarts() {
            if (_lineStartIsDirty) {
                _lineStarts = ts.computeLineStarts(content);
                _lineStartIsDirty = false;
            }
            return _lineStarts;
        }
        function updateContent(newContent) {
            if (newContent !== content) {
                content = newContent;
                _lineStartIsDirty = true;
                editRanges = [];
                scriptVersion++;
            }
        }
        function editContent(minChar, limChar, newText) {
            var prefix = content.substring(0, minChar);
            var middle = newText;
            var suffix = content.substring(limChar);
            content = prefix + middle + suffix;
            _lineStartIsDirty = true;
            editRanges.push({
                span: { start: minChar, length: limChar - minChar },
                newLength: newText.length
            });
            scriptVersion++;
        }
        function getScriptSnapshot() {
            var lineStarts = getLineStarts();
            var textSnapshot = content;
            var version = scriptVersion;
            var snapshotRanges = editRanges.slice();
            function getChangeRange(oldSnapshot) {
                var unchanged = { span: { start: 0, length: 0 }, newLength: 0 };
                function collapseChangesAcrossMultipleVersions(changes) {
                    if (changes.length === 0) {
                        return unchanged;
                    }
                    if (changes.length === 1) {
                        return changes[0];
                    }
                    var change0 = changes[0];
                    var oldStartN = change0.span.start;
                    var oldEndN = change0.span.start + change0.span.length;
                    var newEndN = oldStartN + change0.newLength;
                    for (var i = 1; i < changes.length; i++) {
                        var nextChange = changes[i];
                        var oldStart1 = oldStartN;
                        var oldEnd1 = oldEndN;
                        var newEnd1 = newEndN;
                        var oldStart2 = nextChange.span.start;
                        var oldEnd2 = nextChange.span.start + nextChange.span.length;
                        var newEnd2 = oldStart2 + nextChange.newLength;
                        oldStartN = Math.min(oldStart1, oldStart2);
                        oldEndN = Math.max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1));
                        newEndN = Math.max(newEnd2, newEnd2 + (newEnd1 - oldEnd2));
                    }
                    return { span: { start: oldStartN, length: oldEndN - oldStartN }, newLength: newEndN - oldStartN };
                }
                ;
                var scriptVersion = oldSnapshot.version || 0;
                if (scriptVersion === version) {
                    return unchanged;
                }
                var initialEditRangeIndex = editRanges.length - (version - scriptVersion);
                if (initialEditRangeIndex < 0) {
                    return null;
                }
                var entries = editRanges.slice(initialEditRangeIndex);
                return collapseChangesAcrossMultipleVersions(entries);
            }
            return {
                getText: function (start, end) { return textSnapshot.substring(start, end); },
                getLength: function () { return textSnapshot.length; },
                getChangeRange: getChangeRange,
                getLineStartPositions: function () { return lineStarts; },
                version: version
            };
        }
        return {
            getContent: function () { return content; },
            getVersion: function () { return scriptVersion; },
            getIsOpen: function () { return isOpen; },
            setIsOpen: function (val) { return isOpen = val; },
            getEditRanges: function () { return editRanges; },
            getLineStarts: getLineStarts,
            getScriptSnapshot: getScriptSnapshot,
            updateContent: updateContent,
            editContent: editContent
        };
    }
});
