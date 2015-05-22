import {HashHandler} from 'ace/keyboard/hash_handler';
import {EventEmitter}  from "ace/lib/event_emitter";
import {AutoCompleteView} from 'AutoCompleteView';
import {Range as AceRange} from "ace/range";

var oop = require("ace/lib/oop");
import {CompilationService} from "./CompilationService";

export class AutoComplete {
    listElement: any;
    inputText: string;
    _active: boolean;

    public handler: any; // HashHandler
    public view: any; // AutoCompleteView
    public scriptName: any;
    
    // From EventEmitter base class: 
    _emit: any;

    constructor(public editor, public script,  public compilationService: CompilationService){
        oop.implement(this, EventEmitter);
        
        this.handler = new HashHandler();
        this.view = new AutoCompleteView(editor, this);
        this.scriptName = script;
        this._active = false;
        this.inputText =''; //TODO imporve name
        
        
        this.handler.attach = () => {
            editor.addEventListener("change", this.refreshCompilation);
            this._emit("attach", {sender: this});
            this._active = true;
        };
    
        this.handler.detach = () => {
            editor.removeEventListener("change", this.refreshCompilation);
            this.view.hide();
            this._emit("detach", {sender: this});
            this._active = false;
        };
        
        var self = this;
        this.handler.handleKeyboard = function (data, hashId, key, keyCode) {
            if (hashId == -1) {
    
                if(" -=,[]_/()!';:<>".indexOf(key) != -1){ //TODO
                    self.deactivate();
                }
                return null;
            }
    
            var command = self.handler.findKeyCommand(hashId, key);
    
            if (!command){
    
                var defaultCommand = editor.commands.findKeyCommand(hashId, key);
                if(defaultCommand){
                    if(defaultCommand.name == "backspace"){
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
                // TODO: No idea what `this` is over here
                command = this.commands[command];
            }
    
            return {command: command, args: args};
        };
    
    
        var Keybinding = {
            "Up|Ctrl-p"      : "focusprev",
            "Down|Ctrl-n"    : "focusnext",
            "esc|Ctrl-g" : "cancel",
            "Return|Tab": "insertComplete"
        };
    
        this.handler.bindKeys(Keybinding);
    
        this.handler.addCommands({
            focusnext:(editor)=>{
                self.view.focusNext();
            },
            focusprev:(editor)=>{
                self.view.focusPrev();
            },
            cancel:(editor)=>{
                self.deactivate();
            },
            insertComplete:(editor) => {
                editor.removeEventListener("change", self.refreshCompilation);
                var curr = self.view.current();
    
                for(var i = 0; i<  self.inputText.length; i++){
                    editor.remove("left");
                }
    
                if(curr){
                    editor.insert($(curr).data("name"));
                }
                self.deactivate();
    
            }
        });
    }
    
    
    isActive = () => {
        return this._active;
    };

    setScriptName = (name) => {
        this.scriptName = name;
    };

    show = () => {
        this.listElement = this.view.listElement;
        this.editor.container.appendChild(this.view.wrap);
        this.listElement.innerHTML = '';
    };

    hide = () => {
        this.view.hide();
    }

    compilation = (cursor) => {
        var compilationInfo = this.compilationService.getCursorCompilation(this.scriptName, cursor);
        var text  = this.compilationService.matchText;
        var coords = this.editor.renderer.textToScreenCoordinates(cursor.row, cursor.column - text.length);

        this.view.setPosition(coords);
        this.inputText = text;

        var compilations = compilationInfo.entries;

        if (this.inputText.length > 0){
            compilations = compilationInfo.entries.filter((elm)=>{
                return elm.name.toLowerCase().indexOf(this.inputText.toLowerCase()) == 0 ;
            });
        }

        var matchFunc = (elm) => {
            return elm.name.indexOf(this.inputText) == 0 ? 1 : 0;
        };

        var matchCompare = (a, b) => {
            return matchFunc(b) - matchFunc(a);
        };

        var textCompare = (a, b) => {
             if (a.name == b.name){
                return 0;
             }else{
                 return (a.name > b.name) ? 1 : -1;
             }
        };
        var compare = (a, b) => {
            var ret = matchCompare(a, b);
            return (ret != 0) ? ret : textCompare(a, b);
        };

        compilations = compilations.sort(compare);

        this.showCompilation(compilations);

        return compilations.length;
    };

    refreshCompilation = (e:AceAjax.EditorChangeEvent) => {
        var cursor = this.editor.getCursorPosition();
        var data = e;
        var newText = this.editor.getSession().getTextRange(new AceRange(data.start.row, data.start.column, data.end.row, data.end.column));
        if(e.action  == "insert"){
            cursor.column += 1;
        } else if (e.action  == "remove"){
            if(newText == '\n'){
                this.deactivate();
                return;
            }
        }

        this.compilation(cursor);
    };

    showCompilation = (infos: ts.CompletionEntry[]) => {
        if (infos.length > 0){
            this.view.show();
            var html = '';
            // TODO use template
            for(var n in infos) {
                var info = infos[n];
                var name =  '<span class="label-name">' + info.name + '</span>';
                var type =  '<span class="label-type">' + info.kind + '</span>';
                var kind =  '<span class="label-kind label-kind-'+ info.kind + '">' + info.kind.charAt(0) + '</span>';

                html += '<li data-name="' + info.name + '">' + kind + name + type + '</li>';
            }
            this.listElement.innerHTML = html;
            this.view.ensureFocus();
        }else{
            this.view.hide();
        }
    };

    active = () => {
        this.show();
        var count = this.compilation(this.editor.getCursorPosition());
        if(!(count > 0)){
            this.hide();
            return;
        }
        this.editor.keyBinding.addKeyboardHandler(this.handler);
    };

    deactivate = () => {
        this.editor.keyBinding.removeKeyboardHandler(this.handler);
    };

};