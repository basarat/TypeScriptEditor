define(["require", "exports", 'ace/keyboard/hash_handler', "ace/lib/event_emitter", 'AutoCompleteView'], function (require, exports, hash_handler_1, event_emitter_1, AutoCompleteView_1) {
    var oop = require("ace/lib/oop");
    var AutoComplete = (function () {
        function AutoComplete(editor, script, compilationService) {
            var _this = this;
            this.editor = editor;
            this.script = script;
            this.compilationService = compilationService;
            this.isActive = function () {
                return _this._active;
            };
            this.setScriptName = function (name) {
                _this.scriptName = name;
            };
            this.show = function () {
                _this.listElement = _this.view.listElement;
                _this.editor.container.appendChild(_this.view.wrap);
                _this.listElement.innerHTML = '';
            };
            this.hide = function () {
                _this.view.hide();
            };
            this.compilation = function (cursor) {
                var compilationInfo = _this.compilationService.getCursorCompilation(_this.scriptName, cursor);
                var text = _this.compilationService.matchText;
                var coords = _this.editor.renderer.textToScreenCoordinates(cursor.row, cursor.column - text.length);
                _this.view.setPosition(coords);
                _this.inputText = text;
                var compilations = compilationInfo.entries;
                if (_this.inputText.length > 0) {
                    compilations = compilationInfo.entries.filter(function (elm) {
                        return elm.name.toLowerCase().indexOf(_this.inputText.toLowerCase()) == 0;
                    });
                }
                var matchFunc = function (elm) {
                    return elm.name.indexOf(_this.inputText) == 0 ? 1 : 0;
                };
                var matchCompare = function (a, b) {
                    return matchFunc(b) - matchFunc(a);
                };
                var textCompare = function (a, b) {
                    if (a.name == b.name) {
                        return 0;
                    }
                    else {
                        return (a.name > b.name) ? 1 : -1;
                    }
                };
                var compare = function (a, b) {
                    var ret = matchCompare(a, b);
                    return (ret != 0) ? ret : textCompare(a, b);
                };
                compilations = compilations.sort(compare);
                _this.showCompilation(compilations);
                return compilations.length;
            };
            this.refreshCompilation = function (e) {
                var cursor = _this.editor.getCursorPosition();
                if (e.data.action == "insertText") {
                    cursor.column += 1;
                }
                else if (e.data.action == "removeText") {
                    if (e.data.text == '\n') {
                        _this.deactivate();
                        return;
                    }
                }
                _this.compilation(cursor);
            };
            this.showCompilation = function (infos) {
                if (infos.length > 0) {
                    _this.view.show();
                    var html = '';
                    for (var n in infos) {
                        var info = infos[n];
                        var name = '<span class="label-name">' + info.name + '</span>';
                        var type = '<span class="label-type">' + info.type + '</span>';
                        var kind = '<span class="label-kind label-kind-' + info.kind + '">' + info.kind.charAt(0) + '</span>';
                        html += '<li data-name="' + info.name + '">' + kind + name + type + '</li>';
                    }
                    _this.listElement.innerHTML = html;
                    _this.view.ensureFocus();
                }
                else {
                    _this.view.hide();
                }
            };
            this.active = function () {
                _this.show();
                var count = _this.compilation(_this.editor.getCursorPosition());
                if (!(count > 0)) {
                    _this.hide();
                    return;
                }
                _this.editor.keyBinding.addKeyboardHandler(_this.handler);
            };
            this.deactivate = function () {
                _this.editor.keyBinding.removeKeyboardHandler(_this.handler);
            };
            oop.implement(this, event_emitter_1.EventEmitter);
            this.handler = new hash_handler_1.HashHandler();
            this.view = new AutoCompleteView_1.AutoCompleteView(editor, this);
            this.scriptName = script;
            this._active = false;
            this.inputText = '';
            this.handler.attach = function () {
                editor.addEventListener("change", _this.refreshCompilation);
                _this._emit("attach", { sender: _this });
                _this._active = true;
            };
            this.handler.detach = function () {
                editor.removeEventListener("change", _this.refreshCompilation);
                _this.view.hide();
                _this._emit("detach", { sender: _this });
                _this._active = false;
            };
            var self = this;
            this.handler.handleKeyboard = function (data, hashId, key, keyCode) {
                if (hashId == -1) {
                    if (" -=,[]_/()!';:<>".indexOf(key) != -1) {
                        self.deactivate();
                    }
                    return null;
                }
                var command = self.handler.findKeyCommand(hashId, key);
                if (!command) {
                    var defaultCommand = editor.commands.findKeyCommand(hashId, key);
                    if (defaultCommand) {
                        if (defaultCommand.name == "backspace") {
                            return null;
                        }
                        self.deactivate();
                    }
                    return null;
                }
                if (typeof command != "string") {
                    var args = command.args;
                    command = command.command;
                }
                if (typeof command == "string") {
                    command = this.commands[command];
                }
                return { command: command, args: args };
            };
            var Keybinding = {
                "Up|Ctrl-p": "focusprev",
                "Down|Ctrl-n": "focusnext",
                "esc|Ctrl-g": "cancel",
                "Return|Tab": "insertComplete"
            };
            this.handler.bindKeys(Keybinding);
            this.handler.addCommands({
                focusnext: function (editor) {
                    self.view.focusNext();
                },
                focusprev: function (editor) {
                    self.view.focusPrev();
                },
                cancel: function (editor) {
                    self.deactivate();
                },
                insertComplete: function (editor) {
                    editor.removeEventListener("change", self.refreshCompilation);
                    var curr = self.view.current();
                    for (var i = 0; i < self.inputText.length; i++) {
                        editor.remove("left");
                    }
                    if (curr) {
                        editor.insert($(curr).data("name"));
                    }
                    self.deactivate();
                }
            });
        }
        return AutoComplete;
    })();
    exports.AutoComplete = AutoComplete;
    ;
});
