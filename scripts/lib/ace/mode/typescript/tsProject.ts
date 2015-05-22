
// We are running in the worker?
// Load up ts ourselves
if (typeof importScripts !== 'undefined') {
    // Path needs to be relative to `ace/worker`
    importScripts('../mode/typescript/typescriptServices.js')
}

import {createLanguageServiceHost, LanguageServiceHost} from "./languageServiceHost";

/**
 * Wraps up `langaugeService` `languageServiceHost` in a single package
 */
class TsProject {
    public languageServiceHost: LanguageServiceHost;
    public languageService: ts.LanguageService;

    constructor() {
        this.languageServiceHost = createLanguageServiceHost('', "typescripts/lib.d.ts");
        this.languageService = ts.createLanguageService(this.languageServiceHost, ts.createDocumentRegistry());
    }
}

var tsProject: TsProject = null;
export function getTSProject() {
    return tsProject ? tsProject : tsProject = new TsProject();
}