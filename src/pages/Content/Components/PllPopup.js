import { mdiAccountVoice, mdiContentSaveOutline, mdiSearchWeb } from '@mdi/js';
import Icon from '@mdi/react';
import React, { forwardRef, useState } from 'react';
import {
  openDefinitionWindow,
  openAlternativeDefinitionWindow,
} from '../../../utils/runtime';
import createStorageInteraction from '../../../utils/storage';
import {
  b2WR,
  browserLangMappingUnique,
  deDuplicateLangCode,
} from '../../../modules/languageMappings';

import { textToSpeech } from '../../../modules/textToSpeech';

const storage = createStorageInteraction();

const PllPopup = React.forwardRef(
  ({ style, selectionData, setIsPopup, baseLang, TTSVoice, TTSRate }, ref) => {
    const [lookupButton, setlookupButton] = useState(b2WR(selectionData.lang)); //undefined (falsy) if no WR code exists ==> no lookupbutton
    const [saveButton, setsaveButton] = useState(true);
    const [TTSButton, setTTSButton] = useState(TTSVoice);
    //Duplicate of lookupButton for now HOWEVER we may wish to disable the button even if lookup is avail
    const [lookupAvailable, setlookupAvailable] = useState(
      b2WR(selectionData.lang)
    ); // word ref language code exists

    const [notification, setNotification] = useState({
      visible: false,
      message: '',
    });

    const language = browserLangMappingUnique[selectionData.lang]; //word

    function saveWordData() {
      storage.setTextObject(selectionData);
      setNotification({ visible: true, message: 'Saved to My Words' });
      setTimeout(() => {
        setNotification({ visible: false, message: '' });
        setIsPopup(false);
      }, 1000);
    }

    // warning: it's a mess down there 👍
    return (
      <div style={style} className={'pll-popup'} ref={ref}>
        <div className="pll-content">
          <div className="pll-buttons">
            {/* Save word button */}
            {saveButton && (
              <button
                className={`btn btn-save ${!language && 'disabled'}`}
                onClick={saveWordData}
              >
                <Icon path={mdiContentSaveOutline} />

                {!language ||
                  (deDuplicateLangCode(selectionData.lang) === baseLang && (
                    <span className="tooltip">
                      {`Please set the languge of this text at the top of the page ⬆
It shouldn't be you native language.`}
                    </span>
                  ))}
              </button>
            )}

            {/* Definition lookup button */}
            {lookupButton && lookupAvailable ? (
              <button
                className={`btn btn-define`}
                onClick={() =>
                  openDefinitionWindow(
                    selectionData.text,
                    baseLang,
                    selectionData.lang
                  )
                }
              >
                <Icon path={mdiSearchWeb} />

                {deDuplicateLangCode(selectionData.lang) === baseLang && (
                  <span className="tooltip">
                    {`Please set the languge of this text at the top of the page ⬆
It shouldn't be you native language.`}
                  </span>
                )}
              </button>
            ) : (
              <button className={'btn btn-define disabled'}>
                <Icon path={mdiSearchWeb} />{' '}
                {language && (
                  <span
                    className="tooltip"
                    onClick={() =>
                      openAlternativeDefinitionWindow(
                        selectionData.text,
                        baseLang,
                        selectionData.lang
                      )
                    }
                  >
                    {`Dictionary not yet available for ${language}. Click here to
            search the web`}
                  </span>
                )}
                {!language && (
                  <span className="tooltip">
                    {`Please set the languge of this text at the top of the page ⬆
It shouldn't be you native language.`}
                  </span>
                )}
              </button>
            )}

            {/* TTS button */}
            {TTSButton && (
              <button
                className={`btn btn-save ${!language && 'disabled'}`}
                onClick={() => {
                  //todo: instead of this, we can store the msg (new SpeechSynthesisUtterance()) in reader state and add listeners to it [onerror,onend]
                  // then we can display an icon to show it's state [error/playing] (and also click on it to pause/resume) and add speed/pitch controls
                  textToSpeech(selectionData.text, TTSVoice, TTSRate);
                }}
              >
                <Icon path={mdiAccountVoice} />
              </button>
            )}
          </div>

          {notification.visible && (
            <div className="pll-notification">{notification.message}</div>
          )}
        </div>
      </div>
    );
  }
);

export default PllPopup;
