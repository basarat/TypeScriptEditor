export class EditorPosition{

    public getPositionChars:Function;
    public getAcePositionFromChars:Function;
    public getCurrentCharPosition :Function;
    public getCurrentLeftChar:Function;
    public getPositionChar:Function;
    public getPositionLeftChar:Function;

    constructor(public editor)    {

        this.getPositionChars=(pos)=> {
            var doc;
            doc = editor.getSession().getDocument();
            return this.getChars(doc, pos);
        };

        this.getAcePositionFromChars= (chars)=> {
            var doc;
            doc = editor.getSession().getDocument();
            return this.getPosition(doc, chars);
        };

        this.getCurrentCharPosition = () => {
            return this.getPositionChars(editor.getCursorPosition());
        };

        this.getCurrentLeftChar = () => {
            return this.getPositionLeftChar(editor.getCursorPosition());
        };

        this.getPositionChar = (cursor) => {
            var range;
            range = {
                start: {
                    row: cursor.row,
                    column: cursor.column
                },
                end: {
                    row: cursor.row,
                    column: cursor.column + 1
                }
            };
            return editor.getSession().getDocument().getTextRange(range);
        };

        this.getPositionLeftChar = (cursor) => {
            var range;
            range = {
                start: {
                    row: cursor.row,
                    column: cursor.column
                },
                end: {
                    row: cursor.row,
                    column: cursor.column - 1
                }
            };
            return editor.getSession().getDocument().getTextRange(range);
        };

    }

    getLinesChars(lines){
        var count            
        count = 0;
        lines.forEach((line) => {
            return count += line.length + 1;
        });
        return count;
    }

    getChars(doc,pos){
        return this.getLinesChars(doc.getLines(0, pos.row - 1)) + pos.column;
    }

    getPosition(doc,chars){
        var count, i, line, lines, row;
        lines = doc.getAllLines();
        count = 0;
        row = 0;
        for (i in lines) {
            line = lines[i];
            if (chars < (count + (line.length + 1))) {
                return {
                    row: row,
                    column: chars - count
                };
            }
            count += line.length + 1;
            row += 1;
        }
        return {
            row: row,
            column: chars - count
        };
    }
}