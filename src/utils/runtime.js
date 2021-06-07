import {
  b2WR,
  browserLangMapping,
  browserLangMappingUnique,
} from '../modules/languageMappings';

// Communicate with with rest of app

//note:  sendMessage:
//strings are sent to background
// objects {action:"action"} are sent to content script

function toggleApp() {
  chrome.runtime.sendMessage('toggle_app', (response) => {
  });
}

function openOptions() {
  chrome.runtime.sendMessage('open_options', (response) => {
  });
}
function openMyWords() {
  chrome.runtime.sendMessage('open_mywords', (response) => {
  });
}
function openHelp() {
  chrome.runtime.sendMessage('open_help', (response) => {
  });
}

function closeThisTab() {
  chrome.runtime.sendMessage('close_this_tab', (response) => {
    return true;
  });
}

// Not used?
// --> document.documentElement.lang used in content script index.js
async function detectLang() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage('detect_lang', (response) => {
      if (response.lang) {
        resolve(response.lang);
      } else {
        reject(new Error('oh dear'));
      }
    });
  });
}

// async function detectLang() {
//   return chrome.runtime.sendMessage('detect_lang', (response) => {
//     return response;
//   });
// }

//not used
function openDefinitionTab(word, baseLang, targetLang) {
  let encoded = encodeURI(word);
  let WRtargetLang = b2WR(targetLang);
  let WRbaseLang = b2WR(baseLang);
  const url = `https://www.wordreference.com/redirect/translation.aspx?w=${encoded}&dict=${WRtargetLang}${WRbaseLang}`;

  chrome.runtime.sendMessage({ action: 'open_url_tab', url }, (response) => {
  });
}

// todo - set max popup size (this could be massive on larger screen no?)

function openDefinitionWindow(word, baseLang, targetLang) {
  //word
  let encoded = encodeURI(word);
  let WRtargetLang = b2WR(targetLang);
  let WRbaseLang = b2WR(baseLang);
  const url = `https://www.wordreference.com/redirect/translation.aspx?w=${encoded}&dict=${WRtargetLang}${WRbaseLang}`;
  //screen
  let screenWidth = window.screen.availWidth;
  let screenHeight = window.screen.availHeight;

  let width = Math.floor(screenWidth / 3);
  let height = Math.floor(screenHeight);
  let left = Math.floor((screenWidth * 2) / 2);

  chrome.runtime.sendMessage({
    action: 'open_url_window',
    url,
    width,
    height,
    left,
    top: 0,
  });
}

function openAlternativeDefinitionWindow(word, baseLang, targetLang) {
  //word
  let encoded = encodeURIComponent(word);
  let langWord = browserLangMappingUnique[targetLang];
  const url = `https://www.google.com/search?q=define%3A${encoded}+${langWord}`;
  //screen
  let screenWidth = window.screen.availWidth;
  let screenHeight = window.screen.availHeight;

  let width = Math.floor(screenWidth / 3);
  let height = Math.floor(screenHeight);
  let left = Math.floor((screenWidth * 2) / 2);

  chrome.runtime.sendMessage({
    action: 'open_url_window',
    url,
    width,
    height,
    left,
    top: 0,
  });
}

//
export {
  openOptions,
  openMyWords,
  openHelp,
  toggleApp,
  closeThisTab,
  openDefinitionTab,
  openDefinitionWindow,
  openAlternativeDefinitionWindow,
  detectLang,
};
