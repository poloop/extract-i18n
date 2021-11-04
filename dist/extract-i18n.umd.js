(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('path'), require('fs'), require('glob'), require('is-valid-glob'), require('json5'), require('dot-object')) :
  typeof define === 'function' && define.amd ? define(['exports', 'path', 'fs', 'glob', 'is-valid-glob', 'json5', 'dot-object'], factory) :
  (global = global || self, factory(global.extractI18N = {}, global.path, global.fs, global.glob, global.isValidGlob, global.json5, global.dotObject));
})(this, (function (exports, path, fs, glob, isValidGlob, json5, Dot) {
  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return n;
  }

  var path__namespace = /*#__PURE__*/_interopNamespace(path);
  var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
  var glob__default = /*#__PURE__*/_interopDefaultLegacy(glob);
  var isValidGlob__default = /*#__PURE__*/_interopDefaultLegacy(isValidGlob);
  var json5__default = /*#__PURE__*/_interopDefaultLegacy(json5);
  var Dot__default = /*#__PURE__*/_interopDefaultLegacy(Dot);

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
      if (!isValidGlob__default["default"](src)) {
        throw new Error("languageFiles isn't a valid glob pattern.");
      } // eslint-disable-next-line no-console


      console.log(`Read data from "${src}"...`);
      const targetFiles = glob__default["default"].sync(src);

      if (targetFiles.length === 0) {
        throw new Error('languageFiles glob has no files.');
      }

      return targetFiles.map(f => {
        const fullPath = path__namespace.resolve(process.cwd(), f);
        const extension = path__namespace.extname(fullPath).toLowerCase();
        let content = {};

        switch (extension) {
          case '.json':
            content = JSON.parse(fs__namespace.readFileSync(fullPath, 'utf8'));
            break;

          case '.json5':
            content = json5__default["default"].parse(fs__namespace.readFileSync(fullPath, 'utf8'));
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

        const i18nFileName = path__namespace.basename(file.fileName);
        const regExp = new RegExp(`(?<=${localeDir})(.*?)(?=/)`);
        const result = file.fileName.match(regExp);
        const lang = result ? result[0] : null;

        if (!lang) {
          throw new Error("languageFiles should be in a language directory named with the language code.");
        }

        const i18nFileContent = file.content;
        acc[lang] = _extends({}, (_acc$lang = acc[lang]) != null ? _acc$lang : {}, {
          [i18nFileName]: Dot__default["default"].dot(i18nFileContent)
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

  exports.ReportActions = void 0;

  (function (ReportActions) {
    ReportActions["MISSINGS"] = "missings";
    ReportActions["DUPLICATES"] = "duplicates";
  })(exports.ReportActions || (exports.ReportActions = {}));

  function createI18nReport(actions, languageFiles = defaultParserOptions.languageFiles) {
    const parser = new LanguageFilesParser({
      languageFiles
    });
    const data = parser.extract(parser.read(parser.options.languageFiles));
    return {
      missingKeys: !actions || actions === exports.ReportActions.MISSINGS ? parser.getMissingKeys(data) : [],
      duplicateKeys: !actions || actions === exports.ReportActions.DUPLICATES ? parser.getDuplicateKeys(data) : []
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

  exports.createI18nReport = createI18nReport;

}));
//# sourceMappingURL=extract-i18n.umd.js.map
