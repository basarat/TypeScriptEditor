define(["require", "exports"], function(require, exports) {
    var EditorPosition = (function () {
        function EditorPosition(editor) {
            this.editor = editor;
            var _this = this;
            this.getPositionChars = function (pos) {
                var doc;
                doc = editor.getSession().getDocument();
                return _this.getChars(doc, pos);
            };
            this.getAcePositionFromChars = function (chars) {
                var doc;
                doc = editor.getSession().getDocument();
                return _this.getPosition(doc, chars);
            };
            this.getCurrentCharPosition = function () {
                return _this.getPositionChars(editor.getCursorPosition());
            };
            this.getCurrentLeftChar = function () {
                return _this.getPositionLeftChar(editor.getCursorPosition());
            };
            this.getPositionChar = function (cursor) {
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
            this.getPositionLeftChar = function (cursor) {
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
        EditorPosition.prototype.getLinesChars = function (lines) {
            var count, _this = this;
            count = 0;
            lines.forEach(function (line) {
                return count += line.length + 1;
            });
            return count;
        };
        EditorPosition.prototype.getChars = function (doc, pos) {
            return this.getLinesChars(doc.getLines(0, pos.row - 1)) + pos.column;
        };
        EditorPosition.prototype.getPosition = function (doc, chars) {
            var count, i, line, lines, row;
            lines = doc.getAllLines();
            count = 0;
            row = 0;
            for(i in lines) {
                line = lines[i];
                if(chars < (count + (line.length + 1))) {
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
        };
        return EditorPosition;
    })();
    exports.EditorPosition = EditorPosition;    
})
