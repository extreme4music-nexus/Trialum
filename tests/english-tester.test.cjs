'use strict';
// English tester smoke gate. Keep product names, player names, diary history unchanged.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const en = JSON.parse(read('locales/en.json'));
assert.equal(en.language, 'en');
assert(Object.keys(en.strings).length >= 570, 'English coverage unexpectedly decreased');
const samples = new Map([
  ['Создај профил', 'Create profile'],
  ['Заедничка игротека', 'Shared playground'],
  ['Серверот не е достапен или 1.5.6-D не е овозможена.', 'The server is unavailable or shared playground 1.5.6-D is not enabled.'],
  ['Испрати покана за посета', 'Send visit invitation'],
  ['Пријателски пораки', 'Friend messages'],
  ['Слободниот текст е исклучен додека не заврши безбедносната ревизија. Готовите фрази се достапни.', 'Free text is disabled until safety review is complete. Preset phrases are available.'],
  ['Кој симбол следува?', 'Which symbol comes next?'],
  ['Ајде да играме!', "Let's play!"],
  ['Покана за заедничка игротека', 'Shared playground invitation']
]);
for(const [mk,expected] of samples) assert.equal(en.strings[mk],expected, 'Missing English translation for '+mk);
for(const [mk,translated] of Object.entries(en.strings)) {
  assert(!/[\u0400-\u04ff]/.test(translated), 'English text contains Cyrillic: '+mk);
}
const context = { navigator: {languages: ['en-US','en']},
  document: {documentElement: {lang:'mk',dir:'ltr'}},
  fetch: async () => ({ok:true,json:async()=>en}),
  addEventListener() {}, console
};
vm.createContext(context);
vm.runInContext(read('js/i18n.js'), context);
(async () => {
  assert.equal(await context.TrialumI18n.change('auto'), 'en');
  for(const [mk,expected] of samples) assert.equal(context.TrialumI18n.t(mk),expected);
  // Species labels can use their established English romanization; player-entered names stay unchanged by the DOM translator.
  assert.equal(context.TrialumI18n.t('Лумира'), 'Lumira');
  const dir = 'android-template/app/src/main/java/com/trialum/ziivaiskra/';
  for(const file of ['MainActivity.kt','TrialumNearby.kt','TrialumPush.kt','CareWorker.kt']) {
    assert(!/[\u0400-\u04ff]/.test(read(dir + file)), file+' has untranslated Android UI');
  }
  console.log('English tester localization smoke gate passed.');
})().catch(error=>{console.error(error);process.exitCode=1});
