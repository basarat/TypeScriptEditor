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
            })
        });
    };
    return FileService;
})();
define('FileService', [
    'require', 
    'exports', 
    'module'
], function (require, exports, module) {
    exports.FileService = FileService;
});
//@ sourceMappingURL=FileService.js.map
