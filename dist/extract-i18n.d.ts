export declare enum ReportActions {
    MISSINGS = "missings",
    DUPLICATES = "duplicates"
}
export declare function createI18nReport(actions: ReportActions, languageFiles?: string | undefined): {
    missingKeys: {
        lang: string;
        fileName: string;
        key: string;
    }[];
    duplicateKeys: {
        content: string;
        lang: string;
        fileNames: string[];
        keys: string[];
    }[];
};
