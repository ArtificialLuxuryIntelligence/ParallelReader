import React, { useCallback, useEffect, useRef, useState } from 'react';
import SimpleDropdown from './../Content/Components/SimpleDropdown';

import Icon from '@mdi/react';
import {
  mdiPlusThick,
  mdiMinusThick,
  mdiTrashCanOutline,
  mdiSquareEditOutline,
  mdiSearchWeb,
  mdiContentSaveOutline,
  mdiAccountVoice,
  mdiAlertOutline,
} from '@mdi/js';

import {
  openAlternativeDefinitionWindow,
  openDefinitionWindow,
} from '../../utils/runtime';
import { b2WR } from '../../modules/languageMappings';

import './../SCSS/Entry.scss';
import useGetTTSOptions from '../Content/Hooks/useGetTTSOptions';
import { textToSpeech } from '../../modules/textToSpeech';
export default function Entry({
  translateEnabled,
  entry,
  handleDelete,
  handleEdit,
  baseLang,
  pageLangOptions,
}) {
  const { text, context, lang, added, notes } = entry;

  const [editedEntry, seteditedEntry] = useState(Object.assign({}, entry));
  const [editorOpen, seteditorOpen] = useState(false);
  const [entryOpen, setentryOpen] = useState(false);
  const [originalEdited, setOriginalEdited] = useState(false);
  const isMounted = useRef(true);
  const [isEdited, setIsEdited] = useState(false);

  //--TTS
  const TTSdropdownOptions = useGetTTSOptions(lang); //no dropdown like in reader - just take first one for easy UX
  const [TTSVoice, setTTSVoice] = useState(null);
  const [TTSRate, setTTSRate] = useState(1.0);

  useEffect(() => {
    TTSdropdownOptions && setTTSVoice(TTSdropdownOptions[0].value);
  }, [TTSdropdownOptions]);

  //--

  const targetLang = b2WR(lang); // get wordReference code if exists

  function handleEditChange(e) {
    const value = e.target.value;
    const name = e.target.name;

    if (name === 'original' || name === 'translation') {
      //old code - (name wont be translation, original yes) can't edit translation now (google API restrictions relating to saving translations)
      seteditedEntry((prev) => {
        return {
          ...prev,
          context: {
            ...prev.context,
            [name]: value,
          },
        };
      });
      setOriginalEdited(true);
    } else {
      seteditedEntry((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  }
  function handleLanguageEdit(value) {
    seteditedEntry((prev) => {
      return {
        ...prev,
        lang: value,
      };
    });
  }

  function handleSumbitEdit(e) {
    e.preventDefault();
    // setIsEdited(true);
    handleEdit(entry, editedEntry, () => {
      if (isMounted.current) {
        //may have been moved -handles react error (unmounted component)
        seteditorOpen(() => false);
      }
    });
    // setTimeout(() => {
    //   if (isMounted.current) {
    //     //handles react error (unmounted component)
    //     seteditorOpen(() => false); //fixes the translation not rerendering .
    //   }
    // }, 100);

    if (isMounted.current) {
      //handles react error (unmounted component)
      seteditorOpen(() => false); //fixes the translation not rerendering .
    }
  }

  function toggleEditorOpen() {
    setentryOpen(true);
    seteditorOpen((prev) => !prev);
  }

  function toggleEntryOpen() {
    if (entryOpen) {
      seteditorOpen(() => false);
    }
    setentryOpen((prev) => !prev);
  }

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return (
    <li className={`entry ${entryOpen ? 'open' : 'closed'}`}>
      <>
        <div
          style={editorOpen ? { display: 'none' } : { display: 'block' }}
          className={'entry-display'}
        >
          <div className="inline entry-head">
            <span onClick={() => toggleEntryOpen()}>
              <button className={`collapse-toggle icon `}>
                {entryOpen ? (
                  <Icon size={1.1} path={mdiMinusThick} />
                ) : (
                  <Icon size={1.1} path={mdiPlusThick} />
                )}
              </button>
              <h2 className={`notranslate`} translate="no">
                {text}
              </h2>
            </span>

            <div className="button-container">
              {targetLang ? (
                <button
                  className={'icon'}
                  onClick={() => openDefinitionWindow(text, baseLang, lang)} //don't use WordRef code here (it's converted in def function)
                >
                  <Icon size={1.1} path={mdiSearchWeb} />{' '}
                  <span className="tooltip">{`Define`}</span>
                </button>
              ) : (
                <button
                  className={'icon'}
                  onClick={() =>
                    openAlternativeDefinitionWindow(text, baseLang, lang)
                  }
                >
                  <Icon size={1.1} path={mdiSearchWeb} />{' '}
                  <span className="tooltip">{`Define`}</span>
                </button>
              )}
              {TTSVoice && (
                <button
                  className={`icon`}
                  onClick={() => {
                    textToSpeech(text, TTSVoice, TTSRate);
                  }}
                >
                  <Icon size={1.1} path={mdiAccountVoice} />
                  <span className="tooltip">{`Hear`}</span>
                </button>
              )}
              <button className={'icon'} onClick={() => toggleEditorOpen()}>
                <Icon size={1.1} path={mdiSquareEditOutline} />{' '}
                <span className="tooltip">{`Edit`}</span>
              </button>

              <button
                className={'icon error'}
                onClick={() => handleDelete(entry)}
              >
                <Icon size={1.1} path={mdiTrashCanOutline} />
                <span className="tooltip">
                  <Icon path={mdiAlertOutline} />
                  {`Delete`}
                </span>
              </button>
            </div>
          </div>
          <div className={`entry-content `}>
            <h3>{text}</h3>

            <div className="parallel-container">
              <div className="entry-original">
                <h4>Original</h4>

                <p className={'notranslate context-quote'} translate="no">
                  {context.original}
                </p>
                <a href={context.url} rel="noreferrer" target="_blank">
                  Source
                </a>
              </div>
              <div className="entry-translation">
                <h4>Translation</h4>

                <div>
                  {!translateEnabled && (
                    <p className={'error'}>
                      Please enable translation (right-click page)
                    </p>
                  )}
                </div>
                <div>
                  {translateEnabled && (
                    <p className={'context-quote'}>
                      <span>{context.original}</span>
                    </p>
                  )}
                </div>

                {/* {translateEnabled && !originalEdited && (
                  <p className={'context-quote'}>{context.original}</p>
                )} */}
                {/* 
                {translateEnabled && originalEdited && (
                  <p className={'error'}>
                    Please refresh page to see translation
                  </p>
                )} */}
              </div>
            </div>
            {notes && (
              <div className="entry-notes notranslate" translate="no">
                <h4>Notes</h4>
                <p>{notes}</p>
              </div>
            )}
          </div>
        </div>

        <div
          style={editorOpen ? { display: 'block' } : { display: 'none' }}
          className={'entry-editor'}
        >
          <div className="inline entry-head">
            <span onClick={() => toggleEntryOpen()}>
              <button className="collapse-toggle icon">
                {entryOpen ? (
                  <Icon size={1.1} path={mdiMinusThick} />
                ) : (
                  <Icon size={1.1} path={mdiPlusThick} />
                )}{' '}
              </button>{' '}
              <h2 className="notranslate" translate="no">
                {editedEntry.text}
              </h2>
            </span>
            <div className="button-container">
              <button className={'icon'} onClick={() => toggleEditorOpen()}>
                <Icon size={1.1} path={mdiSquareEditOutline} />{' '}
                <span className="tooltip">{`Edit`}</span>
              </button>
              <button
                className={'icon error'}
                onClick={() => handleDelete(entry)}
              >
                <Icon size={1.1} path={mdiTrashCanOutline} />
                <span className="tooltip">
                  <Icon path={mdiAlertOutline} />
                  {`Delete`}
                </span>{' '}
              </button>
            </div>
          </div>
          <div className={'entry-content'}>
            <form className="edit-entry" onSubmit={handleSumbitEdit}>
              <div className="inline">
                <label>
                  <input
                    type="text"
                    name="text"
                    value={editedEntry.text}
                    onChange={handleEditChange}
                  />
                </label>{' '}
                <button type="submit">
                  <Icon size={1.1} path={mdiContentSaveOutline} />
                  <span className="tooltip">{`Save`}</span>
                </button>
              </div>
              <label>
                Notes
                <textarea
                  type="text"
                  name="notes"
                  value={editedEntry.notes}
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Original
                <textarea
                  type="text"
                  name="original"
                  value={editedEntry.context.original}
                  onChange={handleEditChange}
                />
              </label>
              {/* <label>
                Translation
                <textarea
                  type="text"
                  name="translation"
                  value={editedEntry.context.translation}
                  onChange={handleEditChange}
                />
              </label> */}

              <div className="inline">
                <label>
                  <span>Language</span>

                  <SimpleDropdown
                    options={pageLangOptions?.friendlyLangOptions}
                    onChange={handleLanguageEdit}
                    value={editedEntry.lang} //default value
                    placeholder="Select language"
                  />
                </label>
                <button type="submit">
                  <Icon size={1.1} path={mdiContentSaveOutline} />
                  <span className="tooltip">{`Save`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    </li>
  );
}
