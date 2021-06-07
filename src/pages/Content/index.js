// Content script (injected on extension activation [chrome.action.])

import Mercury from '@postlight/mercury-parser';
import React from 'react';
import ReactDOM from 'react-dom';

import '@webcomponents/custom-elements';
import { deDuplicateLangCode } from './../../modules/languageMappings';
import App from './Components/App';

let preparsed;

// to do, inject this on all pages..
const lang = deDuplicateLangCode(document.documentElement.lang);

// -------------------------------------------------
const preparse = false;
//This can be a user preference?
// This determines whether or not the site contents are parsed on every page at every visit (probably bad);
// (This is needed to get the info before it is potentially translated by the browser extension before the extension is triggered)
//preparse: false:
//  Pro: no wasteful processes on pages that don't need to be parsed
//  Down side: we don't get the title (really?) and all the content needs to be loaded again (presumably)

// Parse page and get lang before any autotranslation can change the original text language
async function preparsePage() {
  preparsed = await Mercury.parse();
}
if (preparse) {
  preparsePage();
}

// -------------------------------------------------

// --------------------------------------------------

//

// --------------------------------------------------
// Message handling
// --------------------------------------------------

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Toggle app - used to init app as well
  if (request.action === 'toggle_app') {
    sendResponse('ok');
    const { url } = request;
    toggle(url);
  }

  if (request.action === 'is_extension_loaded') {
    sendResponse('yes');
  }
});

// --------------------------------------------------

function toggle(url) {
  let host = document.querySelector('#pll-reader-host');
  const body = document.querySelector('body');
  const html = document.querySelector('html');

  // inject app if it doesn't exist
  if (!host) {
    injectApp(url);
    // html.classList.add('pll-initial'); //<-- class added when content has been parsed and translation on (stops original page layout from shifting when user can still see it) [App.js]
    body.classList.add('no-scroll');
    host = document.querySelector('#pll-reader-host');
    host.style.display = 'flex';

    return;
  }

  // if host does exist, remove it from DOM
  else if (host) {
    body.classList.remove('no-scroll');
    html.classList.remove('pll-initial');
    host.remove();
    return;
  }
}

async function injectApp(url) {
  // Inject styles into head //shadowDOM fix
  // https://stackoverflow.com/questions/55382081/using-google-fonts-with-shadow-dom

  let linkNode = document.createElement('link');
  linkNode.type = 'text/css';
  linkNode.rel = 'stylesheet';
  linkNode.href =
    '//fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Open+Sans:wght@400;600&display=swap';
  document.head.appendChild(linkNode);

  // Inject App into DOM

  //shadow root host
  let hostEl = document.createElement('div');
  hostEl.id = 'pll-reader-host';
  document.body.appendChild(hostEl);
  let host = document.querySelector('#pll-reader-host');
  let shadowroot = host.attachShadow({ mode: 'open' });

  //react app root
  let app;
  app = document.createElement('div');
  app.id = 'pll-reader-root';
  app.style = `
    box-sizing: border-box;
    min-width: 700px;
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    position: fixed;
    overflow-y: hidden;
    top: 0px;
    right: 0px;
    z-index: 2147483647;
    justify-content: center;
    align-items: center;
  
  
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  `;
  shadowroot.appendChild(app);

  ReactDOM.render(<App url={url} toggle={toggle} />, app);
}
