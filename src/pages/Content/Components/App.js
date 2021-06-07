// The root of the webcomponent <pll-reader>

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { openMyWords, openOptions, toggleApp } from '../../../utils/runtime';
import LayoutContainer from '../../Containers/LayoutContainer/LayoutContainer';
import useIsTranslateEnabled from '../Hooks/useIsTranslateEnabled';
import Parser from './Parser';
import Widget from './Widget';


export default function App({ url, toggle }) {
  const [pagestate, setpagestate] = useState('loadererror');
  const [documentParsed, setDocumentParsed] = useState(false);
  const translateEnabled = useIsTranslateEnabled(); //only detects if enabled not if completely translated (is triggered on scroll)

  function renderErrorWidget() {
    return (
      <Widget
        settings={{
          type: 'loadererror',
          message: {
            text: (() => {
              return (
                <>
                  <p>Please enable translation </p>
                  <a
                    href={
                      'https://support.google.com/chrome/answer/173424?co=GENIE.Platform%3DDesktop&hl=en'
                    }
                    rel="noreferrer"
                    target="_blank"
                    style={{ fontSize: '0.7em' }}
                  >
                    {' '}
                    Help 🌐
                  </a>
                </>
              );
            })(), // slighlty hacky way of passing jsx ?
            className: 'error',
          },
          disabled: [],
        }}
        clickHandler={clickHandler}
      ></Widget>
    );
  }
  function renderLoaderWidget() {
    return (
      <Widget
        settings={{
          type: 'loader',
          message: { text: 'Loading...', className: 'loading' },
          disabled: [],
        }}
        clickHandler={clickHandler}
      ></Widget>
    );
  }

  function clickHandler(e) {
    switch (e.currentTarget.dataset.action) {
      case 'options':
        openOptions();
        break;
      case 'mywords':
        openMyWords();
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

  useEffect(() => {
    if (!translateEnabled) {
      setpagestate('loadererror');
    } else {
      setpagestate('loader'); //might cause issues
    }
  }, [translateEnabled]);

  useEffect(() => {
    if (documentParsed && translateEnabled) {
      const html = document.querySelector('html');

      html.classList.add('pll-initial');
    }
  }, [documentParsed, translateEnabled]);

  return (
    <>
      {/* DEV */}
      <style>{`@import url(${chrome.runtime.getURL('webcomp.css')})`}</style>

      {/* PROD -need to copy manually */}
      {/* <style>{styles}</style> */}

      <div
        id="pll-reader"
        className={translateEnabled && documentParsed ? 'active' : 'waiting'}
      >
        {/* NOTE  tO avoid any FOUC, we can just inline the styles here - (see the compiled output of the webcomp.css and copy in here [or into a separte file..])*/}
        {!translateEnabled && (
          <LayoutContainer>{renderErrorWidget()}</LayoutContainer>
        )}
        {translateEnabled && !documentParsed && (
          <LayoutContainer>{renderLoaderWidget()}</LayoutContainer>
        )}

        <div
          className={'pll-reader-content'}
          style={
            translateEnabled && documentParsed
              ? { display: 'block', opacity: 1 }
              : { display: 'none', opacity: 0 }
          }
        >
          <Parser
            url={url}
            setDocumentParsed={setDocumentParsed}
          ></Parser>
        </div>
        {/* </LayoutContainer> */}
      </div>
    </>
  );
}

Widget.propTypes = {
  langCode: PropTypes.string,
  url: PropTypes.string,
  toggle: PropTypes.func,
};
