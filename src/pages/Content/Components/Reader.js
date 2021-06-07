import React, { useState, useRef, useEffect, useCallback } from 'react';

import { openOptions, openMyWords, toggleApp } from '../../../utils/runtime';
import { findParallelText } from '../../../modules/DOMmanipulation';

import Widget from './Widget';
import PllPopup from './PllPopup';
import Footer from './../../Containers/StaticContainer/Footer';
import useWindowDimensions from '../Hooks/useWindowDimensions';

import PageLangDropdown from './PageLangDropdown';
import ReaderContent from './ReaderContent';
import LayoutContainer from '../../Containers/LayoutContainer/LayoutContainer';
import TTSVoiceDropdown from './TTSVoiceDropdown';
import useGetTTSOptions from '../Hooks/useGetTTSOptions';
import useGetPageLangOptions from '../Hooks/useGetPageLangOptions';

const defaultEntry = {
  text: '',
  lang: '',
  context: { orginal: '', translation: '', url: '' },
  notes: '',
  added: '',
};

export default function Reader({ htmlString, lang }) {
  const { height } = useWindowDimensions();

  // ------------------------------------------
  // State
  //-------------------------------------------

  // User Options/Preferences
  const [baseLang, setBaseLang] = useState(''); //native lang
  const [preferences, setPreferences] = useState({});

  const [pageLang, setpageLang] = useState(lang);

  // ------Dropdowns
  // Page language
  const pageLangDropdownOptions = useGetPageLangOptions()?.friendlyLangOptions;

  // TTS

  const TTSdropdownOptions = useGetTTSOptions(pageLang);
  const [TTSVoice, setTTSVoice] = useState(null);
  const [TTSRate, setTTSRate] = useState(1.0);

  // ------------UI
  const [displayMode, setDisplayMode] = useState({
    pllview: true,
    pllsync: true,
  });
  const [prevSyncState, setprevSyncState] = useState(null); // tracks the value for when it is turned off for single view

  const [isPopup, setIsPopup] = useState(false);
  const [popupStyles, setPopupStyles] = useState({ top: 0, left: 0 });

  // User selection data

  const [selectionData, setSelectionData] = useState(defaultEntry);
  const prevText = useRef(); // keep track of previous highlighted text for closing popup

  // Sync scroll margin top state

  const [translationTop, settranslationTop] = useState(0);

  // Widget
  const [widgetSettings, setwidgetSettings] = useState({
    type: 'reader',
    message: false,
    disabled: [],
  });

  // ------------------------------------------
  // Refs
  //-------------------------------------------

  const originalRef = useRef(null);
  const translationRef = useRef(null);
  const extensionRef = useRef(null);
  const popupRef = useRef(null);

  // ------------------------------------------
  // Effects
  //-------------------------------------------

  // Get/set options/prefs from backend

  useEffect(() => {
    function getBaseLang() {
      chrome.storage.local.get('base_language', ({ base_language }) => {
        setBaseLang(base_language);
      });
    }

    function getPreferences() {
      chrome.storage.local.get('preferences', ({ preferences }) => {
        setPreferences(preferences);
      });
    }

    getBaseLang();
    getPreferences();
  }, []);

  useEffect(() => {
    setDisplayMode((prev) => {
      return { ...prev, pllsync: preferences.syncScroll };
    });
    setprevSyncState(preferences.syncScroll);

    chrome.storage.local.set({ preferences: preferences });
  }, [preferences]);

  // Add resize listenrs
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    if (TTSdropdownOptions) {
      setTTSVoice(TTSdropdownOptions[0].value);
    } else {
      setTTSVoice(null);
    }
  }, [TTSdropdownOptions]);
  //-------------------------------------------
  //-------------------------------------------

  async function savePageLang(lang) {
    // let lang = await detectLang();
    // already passed down
    chrome.storage.local.set({ page_language: lang });
    setpageLang(lang);
  }

  function handleWindowResize() {
    setIsPopup(false);
  }

  //Factory
  const mouseInhandler = useCallback(function (section) {
    return function (e) {
      let pllElem;

      if (section === 'translation') {
        pllElem = findParallelText(e.currentTarget, originalRef.current);
      } else {
        pllElem = findParallelText(e.currentTarget, translationRef.current);
      }

      e.currentTarget.classList.add('pll-sentence-active');
      pllElem.classList.add('pll-sentence-parallel');
    };
  }, []);

  const mouseOuthandler = useCallback(function (section) {
    return function (e) {
      document
        .querySelector('#pll-reader-host')
        .shadowRoot.querySelectorAll('.pll-sentence-active')
        .forEach((s) => s.classList.remove('pll-sentence-active'));
      document
        .querySelector('#pll-reader-host')
        .shadowRoot.querySelectorAll('.pll-sentence-parallel')
        .forEach((s) => s.classList.remove('pll-sentence-parallel'));
    };
  }, []);

  const textSelectionHandler = useCallback(
    function (e) {
      try {
        // getSelectionRange
        if (!window.getSelection) {
          prevText.current = '';
          setIsPopup(false);
          return;
        }

        let selection = document
          .querySelector('#pll-reader-host')
          .shadowRoot.getSelection();

        let text = selection.toString();
        let scrollY = extensionRef.current.scrollTop;

        let rects = [...selection.getRangeAt(0).getClientRects()];
        let lastRect = rects[rects.length - 1];
        if (!lastRect) {
          prevText.current = '';

          setIsPopup(false);
          return;
        }
        const { top, left, width } = lastRect;

        setPopupStyles({
          top: top + scrollY + 12, //account for space at top of page and desired gap
          left: left + width / 2,
        });

        if (text === '') {
          prevText.current = '';

          setIsPopup(false);
          return;
        } else {
          if (text === prevText.current) {
            //handle click away (because this funct is bound to mouseUP, the selection remains valid even when we are clicking away )
            prevText.current = '';
            setIsPopup(false);
            return;
          }

          let anchorElem = selection.anchorNode.parentNode;
          let focusElem = selection.focusNode.parentNode;

          let cont = anchorElem.closest('.pll-section');
          let originalSelected = cont.classList.contains('original')
            ? true
            : false;

          // Extract context
          let original, translation;

          if (selection.anchorNode === selection.focusNode) {
            // selection is in one node
            let pllElem;
            if (originalSelected) {
              pllElem = findParallelText(anchorElem, translationRef.current);
              if (!pllElem || !anchorElem) {
                prevText.current = '';

                setIsPopup(false);
                return;
              }

              original = anchorElem.innerText;
              translation = pllElem.innerText;
            } else {
              pllElem = findParallelText(anchorElem, originalRef.current);
              if (!pllElem) {
                prevText.current = '';

                setIsPopup(false);
                return;
              }

              original = pllElem.innerText;
              translation = anchorElem.innerText;
            }
          } else {
            // get text content from both start and end of selection (doesn't work if > 2 nodes in selection )
            let pllAnchorElem;
            let pllFocusElem;

            if (originalSelected) {
              pllAnchorElem = findParallelText(
                anchorElem,
                translationRef.current
              );
              pllFocusElem = findParallelText(
                focusElem,
                translationRef.current
              );

              original = anchorElem.innerText + '...' + focusElem.innerText;
              translation =
                pllAnchorElem.innerText + '...' + pllFocusElem.innerText;
            } else {
              // not used any more (text selection not possible on tranlated text because... why would you save that)
              pllAnchorElem = findParallelText(anchorElem, originalRef.current);
              pllFocusElem = findParallelText(focusElem, originalRef.current);

              original =
                pllAnchorElem.innerText + '...' + pllFocusElem.innerText;
              translation = anchorElem.innerText + '...' + focusElem.innerText;
            }
          }

          setIsPopup(true);
          setSelectionData(
            Object.assign({}, defaultEntry, {
              text,
              lang: pageLang,
              added: Date.now(),

              // context: { original, translation }, //!! not allowed to store google translations [api legal] - I assume this is covered by the API legal stuff!!
              context: { original, url: window.location.href }, //add url context
            })
          );
          prevText.current = text;
        }
      } catch (error) {
        prevText.current = '';

        setIsPopup(false);
      }

      // e.stopImmediatePropogation();
    },
    [pageLang]
  );

  function toggleParallelView() {
    settranslationTop(0);

    if (displayMode.pllview === true) {
      setDisplayMode((prev) => {
        return { pllview: false, pllsync: false };
      });

      if (prevSyncState !== null) {
        setprevSyncState(displayMode.pllsync);
      }

      return;
    }
    if (displayMode.pllview === false) {
      setDisplayMode((prev) => {
        return { pllview: true, pllsync: prevSyncState };
      });
      //bugfix: when toggling back to single view, the interesection observers are triggered during the transition
      //and so the translationtop is messed up - here it is reset after the transition is complete (which lasts 0.5s)
      setTimeout(() => {
        settranslationTop(0);
      }, 510);
      return;
    }
  }

  function toggleSyncView() {
    settranslationTop(0);
    setDisplayMode((prev) => {
      return { pllview: prev.pllview, pllsync: !prev.pllsync };
    });
    // ?? eh->
    // Setting preferences triggers the backend to save the current state
    // setPreferences((prev) => {
    //   return { ...prev, syncScroll: !prev.syncScroll };
    // });
  }

  // ------------------------------------------
  // Intersection observer handler
  //-------------------------------------------

  const inViewHandler = useCallback(
    function (inView, entry) {
      if (!displayMode.pllsync) {
        return;
      }
      if (!inView) {
        return;
      }
      if (!displayMode.pllsync) {
        return;
      }
      let currentElement = entry.target.firstElementChild;
      let parallelElement = findParallelText(
        currentElement,
        translationRef.current
      );
      let topCurrent = currentElement.offsetTop;
      let topParallel = parallelElement.offsetTop;

      // Too near the top of page
      if (topCurrent < height && topParallel < height) {
        settranslationTop(0);
        return;
      }

      let scrollCurrent =
        currentElement.getBoundingClientRect().top -
        originalRef.current.getBoundingClientRect().top;
      let scrollParallel =
        parallelElement.getBoundingClientRect().top -
        translationRef.current.getBoundingClientRect().top;

      let diff = scrollCurrent - scrollParallel;

      settranslationTop(diff);
    },
    [translationRef, displayMode.pllsync, height]
  );

  //WidgetHandler

  function clickHandler(e) {
    switch (e.currentTarget.dataset.action) {
      case 'options':
        openOptions();
        break;
      case 'mywords':
        openMyWords();
        break;
      case 'pllview':
        toggleParallelView();
        break;
      case 'pllsync':
        toggleSyncView();
        break;
      case 'close':
        toggleApp();
        break;
      case 'help':
        break;
      default:
        return;
    }
  }

  return (
    <>
      <div
        className={`pll-main fancyscrollbar`}
        ref={extensionRef}
        onMouseUp={(e) => {
          // handle click outside of textselection popup area (originalRef)
          if (
            e.target === originalRef.current ||
            originalRef.current.contains(e.target) ||
            e.target === popupRef.current ||
            popupRef.current?.contains(e.target)
          ) {
            return;
          }
          prevText.current = '';

          setIsPopup(false);
        }}
      >
        <LayoutContainer>
          <Widget
            settings={widgetSettings}
            clickHandler={clickHandler}
            displayMode={displayMode}
          />
          {isPopup && (
            <PllPopup
              style={popupStyles}
              selectionData={selectionData}
              setIsPopup={setIsPopup}
              baseLang={baseLang}
              TTSVoice={TTSVoice}
              TTSRate={TTSRate}
              ref={popupRef}
            />
          )}

          <div className={'controls-cont'}>
            <PageLangDropdown
              pageLangDropdownOptions={pageLangDropdownOptions}
              lang={pageLang}
              savePageLang={savePageLang}
            />

            <TTSVoiceDropdown
              TTSdropdownOptions={TTSdropdownOptions}
              TTSVoice={TTSVoice}
              setTTSVoice={setTTSVoice}
              TTSRate={TTSRate}
              setTTSRate={setTTSRate}
            />
          </div>

          <div>
            <div
              className={
                displayMode.pllview
                  ? 'flex-container parallel'
                  : 'flex-container single'
              }
            >
              <section
                className="pll-section original notranslate"
                translate="no"
                ref={originalRef}
                onMouseUp={(e) => {
                  textSelectionHandler(e);
                }}
              >
                <ReaderContent
                  content={htmlString}
                  section="original"
                  mouseOuthandler={mouseOuthandler}
                  mouseInhandler={mouseInhandler}
                  inViewHandler={inViewHandler}
                  extensionRef={extensionRef}
                />
              </section>
              <section
                className="pll-section translated"
                ref={translationRef}
                style={{ marginTop: `${translationTop}px` }}
              >
                <ReaderContent
                  content={htmlString}
                  section="translation"
                  mouseOuthandler={mouseOuthandler}
                  mouseInhandler={mouseInhandler}
                  inViewHandler={inViewHandler}
                  extensionRef={extensionRef}
                />
              </section>
            </div>
            <Footer />
          </div>
        </LayoutContainer>
      </div>
    </>
  );
}
