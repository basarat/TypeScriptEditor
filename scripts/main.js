define(["require", "exports", "./utils", 'ace/ace', 'ace/range', './AutoComplete', 'EditorPosition', './CompletionService', "ace/lib/lang", "./lib/ace/mode/typescript/tsProject"], function (require, exports, utils_1, ace, range_1, AutoComplete_1, EditorPosition_1, CompletionService_1, lang_1, tsProject_1) {
    function defaultFormatCodeOptions() {
        return {
            IndentSize: 4,
            TabSize: 4,
            NewLineCharacter: "\n",
            ConvertTabsToSpaces: true,
            InsertSpaceAfterCommaDelimiter: true,
            InsertSpaceAfterSemicolonInForStatements: true,
            InsertSpaceBeforeAndAfterBinaryOperators: true,
            InsertSpaceAfterKeywordsInControlFlowStatements: true,
            InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
            InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
            PlaceOpenBraceOnNewLineForFunctions: false,
            PlaceOpenBraceOnNewLineForControlBlocks: false,
        };
    }
    exports.defaultFormatCodeOptions = defaultFormatCodeOptions;
    var aceEditorPosition = null;
    var editor = null;
    var outputEditor = null;
    var docUpdateCount = 0;
    var selectFileName = "";
    var syncStop = false;
    var autoComplete = null;
    var refMarkers = [];
    var errorMarkers = [];
    var tsProject = tsProject_1.getTSProject();
    function loadLibFiles() {
        var libFiles = ["typescripts/lib.d.ts"];
        libFiles.forEach(function (libname) {
            utils_1.readFile(libname, function (content) {
                tsProject.languageServiceHost.addScript(libname, content);
            });
        });
        workerOnCreate(function () {
            libFiles.forEach(function (libname) {
                utils_1.readFile(libname, function (content) {
                    var params = {
                        data: {
                            name: libname,
                            content: content
                        }
                    };
                    editor.getSession().$worker.emit("addLibrary", params);
                });
            });
        }, 100);
    }
    function loadFile(filename) {
        utils_1.readFile(filename, function (content) {
            selectFileName = filename;
            syncStop = true;
            var data = content.replace(/\r\n?/g, "\n");
            editor.setValue(data);
            editor.moveCursorTo(0, 0);
            tsProject.languageServiceHost.addScript(filename, editor.getSession().getDocument().getValue());
            syncStop = false;
        });
    }
    function startAutoComplete(editor) {
        if (autoComplete.isActive() == false) {
            autoComplete.setScriptName(selectFileName);
            autoComplete.active();
        }
    }
    function onUpdateDocument(e) {
        if (selectFileName) {
            if (!syncStop) {
                syncTypeScriptServiceContent(selectFileName, e);
                updateMarker(e);
            }
        }
    }
    function updateMarker(data) {
        var action = data.action;
        var action = data.action;
        var start = aceEditorPosition.getPositionChars(data.start);
        var end = aceEditorPosition.getPositionChars(data.end);
        var newText = editor.getSession().getTextRange(new range_1.Range(data.start.row, data.start.column, data.end.row, data.end.column));
        var markers = editor.getSession().getMarkers(true);
        var line_count = 0;
        var isNewLine = editor.getSession().getDocument().isNewLine;
        if (action == "insert") {
            if (isNewLine(newText)) {
                line_count = 1;
            }
        }
        else if (action == "remove") {
            if (isNewLine(newText)) {
                line_count = -1;
            }
        }
        if (line_count != 0) {
            var markerUpdate = function (id) {
                var marker = markers[id];
                var row = data.start.row;
                if (line_count > 0) {
                    row = +1;
                }
                if (marker && marker.range.start.row > row) {
                    marker.range.start.row += line_count;
                    marker.range.end.row += line_count;
                }
            };
            errorMarkers.forEach(markerUpdate);
            refMarkers.forEach(markerUpdate);
            editor.onChangeFrontMarker();
        }
    }
    function syncTypeScriptServiceContent(script, data) {
        var action = data.action;
        var start = aceEditorPosition.getPositionChars(data.start);
        var end = aceEditorPosition.getPositionChars(data.end);
        var newText = editor.getSession().getTextRange(new range_1.Range(data.start.row, data.start.column, data.end.row, data.end.column));
        if (action == "insert") {
            editLanguageService(script, start, start, newText);
        }
        else if (action == "remove") {
            editLanguageService(script, start, end, "");
        }
        else {
            console.error('unknown action:', action);
        }
    }
    ;
    function editLanguageService(name, minChar, limChar, newText) {
        tsProject.languageServiceHost.editScript(name, minChar, limChar, newText);
    }
    function onChangeCursor(e) {
        if (!syncStop) {
            try {
                deferredShowOccurrences.schedule(200);
            }
            catch (ex) {
            }
        }
    }
    ;
    function languageServiceIndent() {
        var cursor = editor.getCursorPosition();
        var lineNumber = cursor.row;
        var text = editor.session.getLine(lineNumber);
        var matches = text.match(/^[\t ]*/);
        var preIndent = 0;
        var wordLen = 0;
        if (matches) {
            wordLen = matches[0].length;
            for (var i = 0; i < matches[0].length; i++) {
                var elm = matches[0].charAt(i);
                var spaceLen = (elm == " ") ? 1 : editor.session.getTabSize();
                preIndent += spaceLen;
            }
            ;
        }
        var smartIndent = tsProject.languageService.getIndentationAtPosition(selectFileName, lineNumber, defaultFormatCodeOptions());
        if (preIndent > smartIndent) {
            editor.indent();
        }
        else {
            var indent = smartIndent - preIndent;
            if (indent > 0) {
                editor.getSelection().moveCursorLineStart();
                editor.commands.exec("inserttext", editor, { text: " ", times: indent });
            }
            if (cursor.column > wordLen) {
                cursor.column += indent;
            }
            else {
                cursor.column = indent + wordLen;
            }
            editor.getSelection().moveCursorToPosition(cursor);
        }
    }
    function refactor() {
        var references = tsProject.languageService.getOccurrencesAtPosition(selectFileName, aceEditorPosition.getCurrentCharPosition());
        references.forEach(function (ref) {
            var getpos = aceEditorPosition.getAcePositionFromChars;
            var start = getpos(ref.textSpan.start);
            var end = getpos(ref.textSpan.start + ref.textSpan.length);
            var range = new range_1.Range(start.row, start.column, end.row, end.column);
            editor.selection.addRange(range);
        });
    }
    function showOccurrences() {
        var session = editor.getSession();
        refMarkers.forEach(function (id) {
            session.removeMarker(id);
        });
        var references = tsProject.languageService.getOccurrencesAtPosition(selectFileName, aceEditorPosition.getCurrentCharPosition());
        if (!references) {
            return;
        }
        references.forEach(function (ref) {
            var getpos = aceEditorPosition.getAcePositionFromChars;
            var start = getpos(ref.textSpan.start);
            var end = getpos(ref.textSpan.start + ref.textSpan.length);
            var range = new range_1.Range(start.row, start.column, end.row, end.column);
            refMarkers.push(session.addMarker(range, "typescript-ref", "text", true));
        });
    }
    var deferredShowOccurrences = lang_1.deferredCall(showOccurrences);
    function workerOnCreate(func, timeout) {
        if (editor.getSession().$worker) {
            func(editor.getSession().$worker);
        }
        else {
            setTimeout(function () {
                workerOnCreate(func, timeout);
            });
        }
    }
    $(function () {
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode('ace/mode/typescript');
        outputEditor = ace.edit("output");
        outputEditor.setTheme("ace/theme/monokai");
        outputEditor.getSession().setMode('ace/mode/javascript');
        document.getElementById('editor').style.fontSize = '14px';
        document.getElementById('output').style.fontSize = '14px';
        loadLibFiles();
        loadFile("samples/greeter.ts");
        editor.addEventListener("change", onUpdateDocument);
        editor.addEventListener("changeSelection", onChangeCursor);
        editor.commands.addCommands([{
                name: "autoComplete",
                bindKey: "Ctrl-Space",
                exec: function (editor) {
                    startAutoComplete(editor);
                }
            }]);
        editor.commands.addCommands([{
                name: "refactor",
                bindKey: "F2",
                exec: function (editor) {
                    refactor();
                }
            }]);
        editor.commands.addCommands([{
                name: "indent",
                bindKey: "Tab",
                exec: function (editor) {
                    languageServiceIndent();
                },
                multiSelectAction: "forEach"
            }]);
        aceEditorPosition = new EditorPosition_1.EditorPosition(editor);
        autoComplete = new AutoComplete_1.AutoComplete(editor, selectFileName, new CompletionService_1.CompletionService(editor));
        var originalTextInput = editor.onTextInput;
        editor.onTextInput = function (text) {
            originalTextInput.call(editor, text);
            if (text == ".") {
                editor.execCommand("autoComplete");
            }
            else if (editor.getSession().getDocument().isNewLine(text)) {
                var lineNumber = editor.getCursorPosition().row;
                var indent = tsProject.languageService.getIndentationAtPosition(selectFileName, lineNumber, defaultFormatCodeOptions());
                if (indent > 0) {
                    editor.commands.exec("inserttext", editor, { text: " ", times: indent });
                }
            }
        };
        editor.addEventListener("mousedown", function (e) {
            if (autoComplete.isActive()) {
                autoComplete.deactivate();
            }
        });
        editor.getSession().on("compiled", function (e) {
            outputEditor.getSession().doc.setValue(e.data);
        });
        editor.getSession().on("compileErrors", function (e) {
            var session = editor.getSession();
            errorMarkers.forEach(function (id) {
                session.removeMarker(id);
            });
            e.data.forEach(function (error) {
                var getpos = aceEditorPosition.getAcePositionFromChars;
                var start = getpos(error.minChar);
                var end = getpos(error.limChar);
                var range = new range_1.Range(start.row, start.column, end.row, end.column);
                errorMarkers.push(session.addMarker(range, "typescript-error", "text", true));
            });
        });
        $("#javascript-run").click(function (e) {
            utils_1.javascriptRun(outputEditor.getSession().doc.getValue());
        });
        $("#select-sample").change(function (e) {
            var path = "samples/" + $(this).val();
            loadFile(path);
        });
    });
});
