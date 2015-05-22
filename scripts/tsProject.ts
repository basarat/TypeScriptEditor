import {createLanguageServiceHost, LanguageServiceHost} from "./lib/ace/mode/typescript/languageServiceHost";

/**
 * Wraps up `langaugeService` `languageServiceHost` in a single package
 */
class TsProject {
    public languageServiceHost: LanguageServiceHost;
    public languageService: ts.LanguageService;

    constructor() {
        this.languageServiceHost = createLanguageServiceHost('', "lib.d.ts");
        this.languageService = ts.createLanguageService(this.languageServiceHost, ts.createDocumentRegistry());
    }
}

var tsProject:TsProject = null;
export function getTSProject(){
    return tsProject ? tsProject : tsProject = new TsProject();    
}