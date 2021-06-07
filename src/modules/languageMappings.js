//Page language code as given by browser documentElement.lang [todo include more..]

/// Including the deduplicated codes [e.g. so that browserLangMapping["pt"] will return "Portuguese"] when searching using the unique version of this object
const browserLangMapping = {
  undefined: 'Unknown',
  am: 'Amharic',
  ar: 'Arabic',
  eu: 'Basque',
  bn: 'Bengali',
  'en-GB': 'English',
  'pt-BR': 'Portuguese',
  bg: 'Bulgarian',
  ca: 'Catalan',
  chr: 'Cherokee',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  en: 'English',
  et: 'Estonian',
  fil: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  de: 'German',
  el: 'Greek',
  gu: 'Gujarati',
  iw: 'Hebrew',
  hi: 'Hindi',
  hu: 'Hungarian',
  is: 'Icelandic',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  kn: 'Kannada',
  ko: 'Korean',
  lb: 'Luxembourgish',
  lv: 'Latvian',
  lt: 'Lithuanian',
  ms: 'Malay',
  ml: 'Malayalam',
  mr: 'Marathi',
  no: 'Norwegian',
  pl: 'Polish',
  'pt-PT': 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sr: 'Serbian',
  'zh-CN': 'Chinese',
  sk: 'Slovak',
  sl: 'Slovenian',
  es: 'Spanish',
  sw: 'Swahili',
  sv: 'Swedish',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  'zh-TW': 'Chinese',
  tr: 'Turkish',
  ur: 'Urdu',
  uk: 'Ukrainian',
  vi: 'Vietnamese',
  cy: 'Welsh',

  // dupes

  // pt: 'Portuguese',
  // zh: 'Chinese',
};

// const duplicateMapping = {
//   'en-GB': 'en',
//   'pt-BR': 'pt-PT',
//   'zh-TW': 'zh-CN',
// };

//dedupe fn below actually already just returns the first two letters [e.g. de-DE --> de]
// keep this in case something doesn't fit that pattern
const duplicateMapping = {
  'en-GB': 'en',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
};

//This should be of form: {"English": {}}
const TTSLangMapping = [
  {
    lang: 'de-DE',
    label: 'German',
  },
  {
    lang: 'en-US',
    label: 'English-US',
  },
  {
    lang: 'en-US',
    label: 'English-US2',
  },
  {
    lang: 'en-GB',
    label: 'English-UK1',
  },
  {
    lang: 'en-GB',
    label: 'English-UK2',
  },
  {
    lang: 'en-GB',
    label: 'English-UK3',
  },

  {
    lang: 'es-ES',
    label: 'Spanish',
  },
  {
    lang: 'es-US',
    label: 'Spanish-US',
  },
  {
    lang: 'fr-FR',
    label: 'French',
  },
  {
    lang: 'fr-FR',
    label: 'French2',
  },
  {
    lang: 'hi-IN',
    label: 'Hindi',
  },
  {
    lang: 'id-ID',
    label: 'Indonesian',
  },
  {
    lang: 'it-IT',
    label: 'Indian',
  },
  {
    lang: 'ja-JP',
    label: 'Japanese',
  },
  {
    lang: 'ko-KR',
    label: 'Korean',
  },
  {
    lang: 'nl-NL',
    label: 'Dutch',
  },
  {
    lang: 'pl-PL',
    label: 'Polish',
  },
  {
    lang: 'pt-BR',
    label: 'Portugese',
  },
  {
    lang: 'ru-RU',
    label: 'Russian',
  },
  {
    lang: 'zh-CN',
    label: 'Chinese',
  },
  {
    lang: 'zh-HK',
    label: 'Chinese-HK',
  },
  {
    lang: 'zh-TW',
    label: 'Chinese-TW',
  },
];

const wordReferenceLangMapping = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  pt: 'Portuguese',
  de: 'German',
  sv: 'Swedish',
  nl: 'Dutch',
  pl: 'Polish',
  ro: 'Romanian',
  cz: 'Czech',
  gr: 'Greek',
  tr: 'Turkish',
  // fi: 'Finnish',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
};

//Flipped key<->val (and when duplicate language, picking the deduplicated [see below] code)
// e.g. {...,"English": "en",...} not en-GB or whatever
const browserLangMappingReverse = Object.fromEntries(
  Object.entries(objectFlip(browserLangMapping)).map(([key, val]) => [
    key,
    deDuplicateLangCode(val),
  ])
);

// The first objectFlip removes duplicate values
const browserLangMappingUnique = objectFlip(browserLangMappingReverse);

//Used for creating a single category in which to store words for each language
//  note - the lang we get from document.documentElement.lang in content script doesn't give us the proper lang code but the "LCID string" - I think
// https://www.science.co.il/language/Locale-codes.php

// Text to speech language code for chrome TTS
// to get list in browser: (for future updates)
// voices = window.speechSynthesis.getVoices();
// voices.map(v=>{return {lang: v.lang, label:v.name}})

// This currently only gives one syth per lang (sometimes tehre are multiple..)
//unused?
const getTTSLangCode = (browserCode) => {
  let code = deDuplicateLangCode(browserCode);
  let langLabel = browserLangMapping[code];
  let langCode = TTSLangMapping.filter((o) => o.label === langLabel)[0]?.lang;
  return langCode || false;
};

function deDuplicateLangCode(browserCode) {
  if (duplicateMapping[browserCode]) {
    return duplicateMapping[browserCode];
  }
  return browserCode.slice(0, 2); // simplifed to two chars
}

// Convert browser lang code to Word reference code
// Uses unique browser code! [deduplicated] i.e. "pt" not "pt-PT"
function b2WR(browserCode) {
  let result;
  let lang = browserLangMappingUnique[browserCode];
  let entries = Object.entries(wordReferenceLangMapping);
  entries.forEach(([key, val]) => {
    if (val === lang) {
      result = key;
    }
  });
  return result;
}

function WR2b(WRCode) {
  let langWord = wordReferenceLangMapping[WRCode];
  let langCode = browserLangMappingReverse[langWord];
  return deDuplicateLangCode(langCode);
}

// Helper

//Note: if two or more entries have the same value in the original obj then only one (the later) will be fliped and the others ignored
function objectFlip(obj) {
  return Object.keys(obj).reduce((ret, key) => {
    ret[obj[key]] = key;
    return ret;
  }, {});
}

export {
  browserLangMapping,
  browserLangMappingUnique,
  wordReferenceLangMapping,
  deDuplicateLangCode,
  getTTSLangCode,
  b2WR,
  WR2b,
};
