// Not using the AMD export built into typescript since we are using the partial
// implementation of requirejs as present in ACE editor

// Gets a file from the server
class FileService{

    constructor(public ajaxHost){}

    readFile(path,cb){
        this.ajaxHost.ajax({
            type: "GET",
            url: path,
            success: cb,
            error :((jqXHR, textStatus) =>
                console.log(textStatus)
                )}
            );
        }
}

define('FileService',  ['require', 'exports', 'module' ], (require, exports, module) =>{  exports.FileService = FileService  });