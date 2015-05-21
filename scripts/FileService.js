// Not using the AMD export built into typescript since we are using the partial
// implementation of requirejs as present in ACE editor
define(["require", "exports"], function (require, exports) {
    var FileService = (function () {
        function FileService(ajaxHost) {
            this.ajaxHost = ajaxHost;
        }
        FileService.prototype.readFile = function (path, cb) {
            this.ajaxHost.ajax({
                type: "GET",
                url: path,
                success: cb,
                error: (function (jqXHR, textStatus) {
                    return console.log(textStatus);
                }) });
        };
        return FileService;
    })();
    exports.FileService = FileService;
});
