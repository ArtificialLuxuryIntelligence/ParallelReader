

// --------------------------------------------------
//  On install handling
// --------------------------------------------------
//  Set  defaults

const defaults = {
  options: {
    // from options(settings) page
    //user options
    base_language: 'en',
  },
  background: {
    // background default values to avoid possible errors
    page_language: 'en',
  },
  preferences: {
    syncScroll: true,
  },
};

chrome.runtime.onInstalled.addListener((i) => {
  chrome.storage.local.set({ base_language: defaults.options.base_language }); // why isnt this saved as just options object? - may be a reason
  chrome.storage.local.set({
    page_language: defaults.background.page_language,
  });

  //Keep track of window for definition popups
  chrome.storage.local.set({
    definition_window_id: 0,
  });
  //Keep track of tab for definition popups
  chrome.storage.local.set({
    mywords_tab_id: 0,
  });

  chrome.storage.local.set({ preferences: defaults.preferences });
  chrome.contextMenus.create({
    id: 'openpll',
    title: 'Open Parallel Reader here',
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    id: 'openmywordstab',
    title: 'My Words',
    contexts: ['all'],
  });

  if (i.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html'),
    });
  }
});

// --------------------------------------------------
// Message handling
// --------------------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action && message.action === 'open_url_tab') {
    chrome.tabs.create({ url: message.url }, function (tab) {
    });
  }
  if (message.action && message.action === 'open_url_window') {
    const { url, width = 400, left = 500, top = 0, height = 600 } = message; // some defaults - probably not needed but safer

    const createInfo = {
      url,
      width,
      left,
      height,
      top,
      state: 'normal',
      focused: true,
    };

    chrome.storage.local.get(
      'definition_window_id',
      ({ definition_window_id }) => {
        let definitionWindowId = definition_window_id;

        if (definitionWindowId) {
          chrome.windows.get(definitionWindowId, function (window) {
            if (!chrome.runtime.lastError && window) {
              chrome.windows.update(definitionWindowId, { focused: true });
              chrome.tabs.create({ url: url, windowId: definitionWindowId });
            } else {
              //Window has been closed
              chrome.windows.create(createInfo, (window) => {
                chrome.storage.local.set({
                  definition_window_id: window.id,
                });

              });
            }
          });
        } else {
          chrome.windows.create(createInfo, (window) => {
            chrome.storage.local.set({
              definition_window_id: window.id,
            });
          });
        }
      }
    );
  }

  if (message === 'open_mywords') {
    sendResponse('ok');
    chrome.storage.local.get('mywords_tab_id', ({ mywords_tab_id }) => {
      let myWordsTabId = mywords_tab_id;

      if (myWordsTabId) {
        chrome.tabs.get(myWordsTabId, function (tab) {
          if (!chrome.runtime.lastError && tab) {
            chrome.tabs.highlight({ tabs: myWordsTabId });
            chrome.tabs.update(myWordsTabId, {
              active: true,
              highlighted: true,
            });
          } else {
            //Tab has been closed
            chrome.tabs.create(
              { url: chrome.runtime.getURL('mywords.html') },
              function (tab) {
                chrome.storage.local.set({
                  mywords_tab_id: tab.id,
                });
              }
            );
          }
        });
      } else {
        chrome.tabs.create(
          { url: chrome.runtime.getURL('mywords.html') },
          function (tab) {
            chrome.storage.local.set({
              mywords_tab_id: tab.id,
            });
          }
        );
      }
    });
  }
  if (message === 'open_options') {
    sendResponse('ok');
    chrome.tabs.create(
      { url: chrome.runtime.getURL('options.html') },
      function (tab) {
      }
    );
  }

  // Pass message on to content script on the requesting tab
  if (message === 'toggle_app') {
    sendResponse('ok');
    sendToggleApp(sender.tab);
  }

  if (message === 'close_this_tab') {
    let tabId = sender.tab.id;
    chrome.tabs.remove(tabId);
  }

  // not curently used, the documentElemnt method is more effective (I think because this may be too slow to catch a page language before auto translate has changed the lang)
  // if (message === 'detect_lang') {
  //   var detecting = chrome.tabs.detectLanguage();
  //   detecting.then(onSuccess, onFailure);
  //   return true;

  //   function onSuccess(lang) {
  //     sendResponse({ lang: lang });
  //   }
  //   function onFailure() {
  //     sendResponse({ error: "can't detect lang" });
  //   }
  // }
});

// --------------------------------------------------
// Extension icon click handler
// --------------------------------------------------

chrome.action.onClicked.addListener(async (tab) => {
  let loaded = await isExtensionsLoaded(tab);
  if (!loaded) {
    startParallelReader(tab);
    return;
  }
  sendToggleApp(tab);
});

// --------------------------------------------------
// chrome.contextMenus.removeAll();

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'openmywordstab') {
    chrome.tabs.create({ url: chrome.runtime.getURL('mywords.html') });
  }
  if (info.menuItemId === 'openpll') {
    startParallelReader(tab);
  }
});

// Injects the scripts for the extension and toggles it active
async function startParallelReader(tab) {
  const tabId = tab ? tab.id : null; //should always get a tab no?

  chrome.scripting.insertCSS(
    {
      files: ['content.styles.css'], // only accepts one file  will probably be changed when chrome updates api
      target: { tabId },
    },
    (results) => {
      // if (chrome.runtime.lastError || !results || !results.length) {
      //   return; // Permission error, tab closed, etc.
      // }

      chrome.scripting.executeScript(
        {
          files: ['contentScript.bundle.js'], // only accepts one file- will probably be changed when chrome updates api
          target: { tabId },
        },
        (results) => {
          sendToggleApp(tab);
        }
      );
    }
  );

}

//toggles the app on the page
function sendToggleApp(tab) {
  chrome.tabs.sendMessage(tab.id, { action: 'toggle_app', url: tab.url });
}

async function isExtensionsLoaded(tab) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'is_extension_loaded',
      },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve(false);
        }
        if (response) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
}
