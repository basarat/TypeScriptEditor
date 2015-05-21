define(["require", "exports"], function (require, exports) {
    function javascriptRun(js) {
        var external = window.open();
        var script = external.window.document.createElement("script");
        script.textContent = js;
        external.window.document.body.appendChild(script);
    }
    exports.javascriptRun = javascriptRun;
});
