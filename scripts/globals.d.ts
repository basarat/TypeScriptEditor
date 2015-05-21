declare var require: any;
declare var $: any;

declare module "ace/ace" {
    var ace: any;
    export = ace;
}

declare module "ace/range" {
    var ace: {
        Range: any;
    };
    export = ace;
}

declare module "ace/lib/lang" {
    var ace: { deferredCall };
    export = ace;
}

declare module "EditorPosition" {
    var ace: { EditorPosition: any };
    export = ace;
}

declare module "AutoComplete" {
    var ace: { AutoComplete: any };
    export = ace;
}

declare module "ace/mode/typescript/typescriptServices" {
    var foo: { Services: any; TypeScript: any };
    export = foo;
}

declare module "ace/mode/typescript/lightHarness" {
    var foo: { TypeScriptLS: any };
    export = foo;
}