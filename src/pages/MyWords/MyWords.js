import React, { useEffect, useState } from 'react';

import SimpleDropdown from './../Content/Components/SimpleDropdown';

import Entry from './Entry';
import StaticContainer from '../Containers/StaticContainer/StaticContainer';

import createStorageInteraction from '../../utils/storage';

import './../SCSS/MyWords.scss';
import './../SCSS/PllReader/SimpleDropdown.scss';
import useIsTranslateEnabled from './../Content/Hooks/useIsTranslateEnabled';
import useGetPageLangOptions from '../Content/Hooks/useGetPageLangOptions';

const storage = createStorageInteraction();

export default function MyWords() {
  const [data, setData] = useState([]);
  const [ddLang, setddLang] = useState('');
  const [baseLang, setBaseLang] = useState('');
  const [sortBy, setsortBy] = useState('added');
  const translateEnabled = useIsTranslateEnabled();

  let langs = Object.keys(data);

  let pageLangOptions = useGetPageLangOptions([data, ddLang]);
  let langOptions = pageLangOptions?.langOptions;

  function hydrateState() {
    // todo (tidy) import these as functions from storage.js (like in populate list below..)

    // Get user native language
    chrome.storage.local.get('base_language', ({ base_language }) => {
      setBaseLang(base_language);
    });
    // Get previous page language (to display words from that language for UX)

    chrome.storage.local.get('page_language', ({ page_language }) => {
      setddLang(page_language || '');
    });
  }
  async function populateList() {
    let data = await storage.getUserWords();
    setData(data);
  }

  function sortFactory(sortBy, locale) {
    switch (sortBy) {
      case 'added':
        return (a, b) => b['added'] - a['added'];

      case 'text':
        return (a, b) => {
          return a['text'].localeCompare(b['text'], locale, {
            sensitivity: 'base',
          });
        };

      default:
        return () => {
          return 1;
        };
    }
  }
  function handleHighlighted(e) {
    populateList();
  }

  function onSelect(value) {
    setddLang(value);
    const htmltag = document.querySelector('html');
    htmltag.lang = value;
  }

  function onSelectSort(value) {
    setsortBy(value);
  }

  function handleDelete(entry) {
    storage.removeTextObject(entry, populateList);
  }

  function handleEdit(entry, editedEntry, cb) {
    storage.editTextObject(entry, editedEntry, () => {
      populateList();
      cb();
    });
  }

  function renderUserWordList() {
    // Show all
    if (!langs.includes(ddLang) || ddLang === '') {
      return Object.keys(data).map((key, i) => {
        return (
          <div className="mywords" key={i}>
            {/* <h1>{label}</h1> */}
            <ul>
              {Object.values(data[key])
                .sort(sortFactory(sortBy, ddLang))

                .map((obj) => {
                  return (
                    <Entry
                      translateEnabled={translateEnabled}
                      key={obj.text}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      entry={obj}
                      baseLang={baseLang}
                      pageLangOptions={pageLangOptions}
                    />
                  );
                })}
            </ul>
          </div>
        );
      });
    } else {
      // Show words in one language

      return (
        <div className="mywords">
          {/* <h1>{label}</h1> */}
          <ul>
            {Object.values(data[ddLang])
              .sort(sortFactory(sortBy, ddLang))
              .map((obj) => {
                return (
                  <Entry
                    translateEnabled={translateEnabled}
                    key={obj.text}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    entry={obj}
                    baseLang={baseLang}
                    pageLangOptions={pageLangOptions}
                  />
                );
              })}
          </ul>
        </div>
      );
    }
  }

  function renderDropdowns(langOptions) {
    return (
      <div className={'dropdown-container'}>
        {/* <p>{ddOptions.length}</p> */}

        {langOptions?.length > 1 && (
          <SimpleDropdown
            options={langOptions}
            onChange={onSelect}
            value={
              langOptions.filter((option) => option.value === ddLang)[0]
                ?.value || null
            } //default value
            placeholder="Select language"
          />
        )}
        {langOptions?.length > 0 && (
          <SimpleDropdown
            options={[
              { label: 'Sort A-Z', value: 'text' },
              { label: 'Sort by date added', value: 'added' },
            ]}
            onChange={onSelectSort}
            value={sortBy}
            placeholder="Sort words"
          />
        )}
      </div>
    );
  }

  //init
  useEffect(() => {
    // need to get langauge of page that opened this one to show the default list? nah///

    hydrateState();
    populateList();
  }, []);

  //Event listeners (message handling)
  useEffect(() => {
    //Note: doesn't fire if in separate window

    chrome.tabs.onHighlighted.addListener(handleHighlighted);

    return () => {
      chrome.tabs.onHighlighted.removeListener(handleHighlighted);
    };
  }, []);

  return (
    <StaticContainer
      title={'my words'}
      // message={
      //   translateEnabled
      //     ? false
      //     : {
      //         text: (() => {
      //           return (
      //             <>
      //               <p>Please enable translation </p>
      //               <p style={{ fontSize: '0.7em' }}> (right-click page) </p>
      //             </>
      //           );
      //         })(), // slighlty hacky way of passing jsx ?
      //         className: 'error',
      //       }
      // }
    >
      {renderDropdowns(langOptions)}
      <div>{renderUserWordList()}</div>
    </StaticContainer>
  );
}
