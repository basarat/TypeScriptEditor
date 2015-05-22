import {EditorPosition} from './EditorPosition';
import {getTSProject} from "./lib/ace/mode/typescript/tsProject";
var tsProject = getTSProject();

export class CompletionService{

    public editorPos: EditorPosition;
    public matchText: string;

    constructor(public editor){
        this.editorPos = new EditorPosition(editor);
    }

    getCompilation (script, charpos, isMemberCompletion) {
        var compInfo = tsProject.languageService.getCompletionsAtPosition(script, charpos);
        return compInfo;
    };

    getCursorCompilation(script, cursor) {
        var isMemberCompletion, matches, pos, text:string;
        pos = this.editorPos.getPositionChars(cursor);
        text = this.editor.session.getLine(cursor.row).slice(0, cursor.column);
        isMemberCompletion = false;
        matches = text.match(/\.([a-zA-Z_0-9\$]*$)/);

        if (matches && matches.length > 0) {
             this.matchText = matches[1];
            isMemberCompletion = true;
            pos -= this.matchText.length;
        } else {
            matches = text.match(/[a-zA-Z_0-9\$]*$/);
            this.matchText = matches[0];
        }
        return this.getCompilation(script, pos, isMemberCompletion);
    };

    getCurrentPositionCompilation (script) {
        return this.getCursorCompilation(script, this.editor.getCursorPosition());
    };
}