export interface I18nObject {
    [index: string]: string;
}
export interface I18nStructuredData {
    [index: string]: string | I18nObject;
}
export declare type ParserOptions = {
    languageFiles?: string;
    encoding?: string;
};
declare type SimpleFile = {
    fileName: string;
    path: string;
    content: I18nStructuredData;
};
export declare const defaultParserOptions: ParserOptions;
export default class LanguageFilesParser {
    options: ParserOptions;
    constructor(options?: ParserOptions);
    read(src: string | undefined): SimpleFile[];
    extract(languageFiles: (SimpleFile)[]): I18nStructuredData;
    getMissingKeys(data: I18nStructuredData): {
        lang: string;
        fileName: string;
        key: string;
    }[];
    getDuplicateKeys(data: I18nStructuredData): {
        content: string;
        lang: string;
        fileNames: string[];
        keys: string[];
    }[];
}
export {};
