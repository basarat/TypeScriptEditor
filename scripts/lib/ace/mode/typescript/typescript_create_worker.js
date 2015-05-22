define(function(require, exports, module) {
"use strict";

var WorkerClient = require("ace/worker/worker_client").WorkerClient;

exports.createWorker = function(session) {
    
    var worker = new WorkerClient(
        // WorkerClient will load `ace`. 
        ["ace"], 
        // The worker client is itself located in this file
        "ace/mode/typescript_worker",
        // And within the file it wants this member as the worker class
        "TypeScriptWorker"
    );
    
    worker.attachToDocument(session.getDocument());

    worker.on("terminate", function() {
        session.clearAnnotations();
    });

    worker.on("compileErrors", function(results) {
        session.setAnnotations(results.data);
        session._emit("compileErrors", {data: results.data});

    });

    worker.on("compiled", function(result) {
        session._emit("compiled", {data: result.data});
    });

    return worker;
};

});