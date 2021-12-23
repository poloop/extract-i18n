import * as path from 'path';
import * as fs from 'fs';
import glob from 'glob';
import isValidGlob from 'is-valid-glob';
import json5 from 'json5';
import Dot from 'dot-object';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const defaultParserOptions = {
  languageFiles: './locale/**/*.?(json|json5)'
};
class LanguageFilesParser {
  constructor(options = defaultParserOptions) {
    this.options = void 0;
    this.options = _extends({}, defaultParserOptions, options);
  }

  read(src) {
    if (!isValidGlob(src)) {
      throw new Error("languageFiles isn't a valid glob pattern.");
    } // eslint-disable-next-line no-console


    console.log(`Read data from "${src}"...`);
    const targetFiles = glob.sync(src);

    if (targetFiles.length === 0) {
      throw new Error('languageFiles glob has no files.');
    }

    return targetFiles.map(f => {
      const fullPath = path.resolve(process.cwd(), f);
      const extension = path.extname(fullPath).toLowerCase();
      let content = {};

      switch (extension) {
        case '.json':
          content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          break;

        case '.json5':
          content = json5.parse(fs.readFileSync(fullPath, 'utf8'));
          break;
      }

      return {
        fileName: f.replace(process.cwd(), '.'),
        path: f,
        content
      };
    });
  }

  extract(languageFiles) {
    var _this$options$languag;

    const localeDir = (_this$options$languag = this.options.languageFiles) == null ? void 0 : _this$options$languag.split('**')[0];

    if (!localeDir) {
      throw new Error("languageFiles should be in a separate directory.");
    }

    return languageFiles.reduce((acc, file) => {
      var _acc$lang;

      const i18nFileName = path.basename(file.fileName);
      const regExp = new RegExp(`(?<=${localeDir})(.*?)(?=/)`);
      const result = file.fileName.match(regExp);
      const lang = result ? result[0] : null;
      console.error(localeDir, result);

      if (!lang) {
        throw new Error(`languageFiles should be in a language directory named with the language code.(${i18nFileName})`);
      }

      const i18nFileContent = file.content;
      acc[lang] = _extends({}, (_acc$lang = acc[lang]) != null ? _acc$lang : {}, {
        [i18nFileName]: Dot.dot(i18nFileContent)
      });
      return acc;
    }, {});
  }

  getMissingKeys(data) {
    const missingKeys = [];
    Object.keys(data).forEach(lang => {
      Object.keys(data[lang]).forEach(file => {
        Object.keys(data[lang][file]).forEach(key => {
          Object.keys(data).filter(lg => lg !== lang).forEach(otherLang => {
            var _data$otherLang, _data$otherLang$file;

            if (!((_data$otherLang = data[otherLang]) != null && (_data$otherLang$file = _data$otherLang[file]) != null && _data$otherLang$file[key])) {
              missingKeys.push({
                lang: otherLang,
                fileName: file,
                key
              });
            }
          });
        });
      });
    });
    return missingKeys;
  }

  getDuplicateKeys(data) {
    const duplicateContents = [];
    Object.keys(data).forEach(lang => {
      Object.keys(data[lang]).forEach(file => {
        Object.keys(data[lang][file]).forEach(key => {
          duplicateContents.push({
            content: data[lang][file][key],
            lang,
            key,
            file
          });
        });
      });
    });
    const duplicateKeys = duplicateContents.reduce((acc, {
      content,
      lang,
      file,
      key
    }) => {
      if (duplicateContents.filter(({
        content: contentToCheck
      }) => content === contentToCheck).length > 1) {
        var _acc$content$fileName, _acc$content, _acc$content$keys, _acc$content2;

        acc[content] = {
          content,
          lang,
          fileNames: [...((_acc$content$fileName = (_acc$content = acc[content]) == null ? void 0 : _acc$content.fileNames) != null ? _acc$content$fileName : []), file],
          keys: [...((_acc$content$keys = (_acc$content2 = acc[content]) == null ? void 0 : _acc$content2.keys) != null ? _acc$content$keys : []), key]
        };
      }

      return acc;
    }, {});
    return Object.values(duplicateKeys);
  }

}

var ReportActions;

(function (ReportActions) {
  ReportActions["MISSINGS"] = "missings";
  ReportActions["DUPLICATES"] = "duplicates";
})(ReportActions || (ReportActions = {}));

function createI18nReport(actions, languageFiles = defaultParserOptions.languageFiles) {
  const parser = new LanguageFilesParser({
    languageFiles
  });
  const data = parser.extract(parser.read(parser.options.languageFiles));
  return {
    missingKeys: !actions || actions === ReportActions.MISSINGS ? parser.getMissingKeys(data) : [],
    duplicateKeys: !actions || actions === ReportActions.DUPLICATES ? parser.getDuplicateKeys(data) : []
  };
}
process.on('uncaughtException', err => {
  // eslint-disable-next-line no-console
  console.error('[extract-i18n]', err);
  process.exit(1);
});
process.on('unhandledRejection', err => {
  // eslint-disable-next-line no-console
  console.error('[extract-i18n]', err);
  process.exit(1);
});

export { ReportActions, createI18nReport };
//# sourceMappingURL=extract-i18n.modern.js.map
