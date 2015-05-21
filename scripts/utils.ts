export function javascriptRun(js) {
    var external = window.open();
    var script = external.window.document.createElement("script");
    script.textContent = js;
    external.window.document.body.appendChild(script);
}

export function readFile(path, cb) {
    $.ajax({
        type: "GET",
        url: path,
        success: cb,
        error: ((jqXHR, textStatus) => console.log(textStatus))
    });
}