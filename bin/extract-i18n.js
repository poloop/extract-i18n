#!/usr/bin/env node
/* eslint-disable */
 
const { program } = require('commander')
const termkit = require('terminal-kit')
const term = termkit.terminal
const { createI18nReport, ReportActions } = require('../dist/extract-i18n.umd')

const tableOptions = (color) => ({
    hasBorder: true,
    contentHasMarkup: true,
    borderAttr: { color: 'green' },
    textAttr: { bgColor: 'default' },
    firstRowTextAttr: { bgColor: color },
    fit: true,
})
 
const missingKeys = (languageFiles) => {
  console.log('🌐 Extract i18n: Get missing keys in your locales')

  const report = createI18nReport(ReportActions.MISSINGS, languageFiles)

  const header = ['LANG', 'FILENAME', 'KEY']

  term.createInlineElement(termkit.TextTable, {
    cellContents: [
      header,
      ...report.missingKeys.map(({lang, fileName, key}) => ([lang, fileName, key]))
    ],
    ...tableOptions('red'),
  })
}

const duplicateKeys = (languageFiles) => {
  console.log('🌐 Extract i18n: Get duplicate keys in your locales')

  const report = createI18nReport(ReportActions.DUPLICATES, languageFiles)

  const header = ['CONTENT', 'LANG', 'FILENAMES', 'KEYS']

  term.createInlineElement(termkit.TextTable, {
    cellContents: [
      header,
      ...report.duplicateKeys.map(({content, lang, fileNames, keys}) => ([content, lang, fileNames.join('\n'), keys.join('\n')]))
    ],
    ...tableOptions('blue'),
  })
}


const defaultAction = (languageFiles) => {
  missingKeys(languageFiles)
  duplicateKeys(languageFiles)
}

program
  .version('0.0.1')
  .argument('<languageFiles>')
  .action(defaultAction)
program.command('missing-keys <languageFiles>')
  .action(missingKeys)
program.command('duplicate-keys <languageFiles>')
  .action(duplicateKeys)

program.parse(process.argv)
