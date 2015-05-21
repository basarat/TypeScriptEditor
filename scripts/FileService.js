define(["require", "exports"], function (require, exports) {
    var FileService = (function () {
        function FileService(ajaxHost) {
            this.ajaxHost = ajaxHost;
        }
        return FileService;
    })();
    exports.FileService = FileService;
});
