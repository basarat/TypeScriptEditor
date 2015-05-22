define(["require", "exports", "./lib/ace/mode/typescript/languageServiceHost"], function (require, exports, languageServiceHost_1) {
    var TsProject = (function () {
        function TsProject() {
            this.languageServiceHost = languageServiceHost_1.createLanguageServiceHost('', "lib.d.ts");
            this.languageService = ts.createLanguageService(this.languageServiceHost, ts.createDocumentRegistry());
        }
        return TsProject;
    })();
    var tsProject = null;
    function getTSProject() {
        return tsProject ? tsProject : tsProject = new TsProject();
    }
    exports.getTSProject = getTSProject;
});
