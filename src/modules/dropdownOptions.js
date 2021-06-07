import createStorageInteraction from '../utils/storage';
import {
  browserLangMapping,
  browserLangMappingUnique,
  deDuplicateLangCode,
} from './languageMappings';

let storage = createStorageInteraction()

//userData is object from local storage
async function languageDropdownOptions() {


  let data = await storage.getUserWords();

  

  function languageLabel(key) {
    return browserLangMappingUnique[key];
  }

  let langs = Object.keys(data);
  //  //options for dropdown of saved words languages
  let langOptions = langs.map((l) => {
    return { value: l, label: languageLabel(l) };
  });
  //options for dropdown of all languages
  let allLangOptions = Object.entries(browserLangMappingUnique)
    .map(([key, value]) => {
      return { value: key, label: value };
    })
    .sort((a, b) => (a.label < b.label ? -1 : 1));


  //  Puts currently used languages at top of dropdown list for convenience
  let friendlyLangOptions = [
    { type: 'group', name: 'Your languages', items: langOptions },
    { type: 'group', name: 'All languages', items: allLangOptions },
  ];

  return { friendlyLangOptions, allLangOptions, langOptions };
}

function TTSDropdownOptions(langCode, voices) {
  //get all available synth voices
  // let voices = getTTSVoices();
  // let voices = window.speechSynthesis.getVoices();
  //list of all lang codes
  const langCodeList = Object.entries(browserLangMappingUnique).map(
    (e) => e[0]
  );
  //group all available voices by language
  let grouped = {};
  langCodeList.forEach((code) => {
    code = deDuplicateLangCode(code); //most are already 2 letters but need to trim down pt-PT and chinese to get  a match below

    let langVoices = voices.filter((voice) => voice.lang.includes(code)); //todo will break with fil and fi because of limit to 2 chars..but wcyd
    if (langVoices.length) {
      grouped[code] = langVoices;
    }
  });
  //The langCode requested doesn't have available voice
  if (!grouped[langCode]) {
    return false;
  }
  let options = grouped[langCode].map((voice) => {
    return { label: voice.name, value: voice };
  });
  return options;
}

//helpers;

export { languageDropdownOptions, TTSDropdownOptions };
