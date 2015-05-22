export namespace DocumentPositionUtil {

    export var getLinesChars = function(lines) {
        var count;
        count = 0;
        lines.forEach(function(line) {
            return count += line.length + 1;
        });
        return count;
    };

    export var getChars = function(doc, pos) {
        return getLinesChars(doc.getLines(0, pos.row - 1)) + pos.column;
    };

    export var getPosition = function(doc, chars) {
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
    };
}
