import React, { useEffect, useState } from 'react';
import SimpleDropdown from '../Content/Components/SimpleDropdown';
import StaticContainer from '../Containers/StaticContainer/StaticContainer';

import createStorageInteraction from '../../utils/storage';
import {
  deDuplicateLangCode,
  wordReferenceLangMapping,
  WR2b,
} from './../../modules/languageMappings';

import './../SCSS/PllReader/SimpleDropdown.scss';
import './Options.scss';

export default function Options() {
  const [base_language, setBase_language] = useState('');
  const [preferences, setPreferences] = useState('');

  // To be used if we need to check/request chrome.permissions
  // const [permissions, setPermissions] = useState({});

  // // Permissions
  // function getPermissions() {
  //   chrome.permissions.getAll((p) => {
  //     setPermissions(p);
  //   });
  // }
  // useEffect(() => {
  //   getPermissions();
  // }, []);

  //Weirdness to account for bool in storage, only string accepted here..
  const syncPref =
    preferences?.syncScroll && preferences.syncScroll === true
      ? 'true'
      : 'false';

  //Give 'native lang' options for all languages that WR supports
  const options = Object.entries(wordReferenceLangMapping).map(
    ([key, value]) => {
      let code = WR2b(key); //get the browser code
      code = deDuplicateLangCode(code);
      return { value: code, label: value };
    }
  );
  function onLangSelect(value) {
    setBase_language(deDuplicateLangCode(value));
  }

  function onSyncSelect(value) {
    setPreferences((prev) => {
      return { ...prev, syncScroll: value === 'true' ? true : false };
    });
  }

  useEffect(() => {
    chrome.storage.local.get('base_language', ({ base_language }) => {
      setBase_language(base_language);
    });
    chrome.storage.local.get('preferences', ({ preferences }) => {
      setPreferences(preferences);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ preferences: preferences });
    chrome.storage.local.set({ base_language: base_language });
  }, [base_language, preferences]);

  return (
    <StaticContainer title={'options'}>
      <div id="options">
        <ul>
          <li>
            <div className="nativelang">
              <span>
                <h3>Definition language </h3>
                <p className={'descr'}>
                  {' '}
                  Your native language. The language used in translations when
                  looking up words.
                </p>
              </span>
              <SimpleDropdown
                options={[...options]}
                onChange={onLangSelect}
                value={base_language}
                placeholder="Select language"
              />
            </div>
            {/* <hr /> */}
          </li>
          <li>
            <div className="scrollsync">
              <span>
                {' '}
                <h3>Scroll-sync </h3>
                <p className={'descr'}>
                  {' '}
                  Recommended. Keep both texts aligned when scrolling down the
                  page with longer texts.
                </p>
              </span>
              <SimpleDropdown
                options={[
                  { value: 'true', label: 'ON' }, //only seems to accepts strings..?
                  { value: 'false', label: 'OFF' },
                ]}
                onChange={onSyncSelect}
                value={syncPref}
                placeholder="Select pref"
              />
            </div>
          </li>
        </ul>

        <div className="permissions">
          <h3>Permissions</h3>

          <p>No extra permissions needed.</p>
          <p>
            Note: No browsing information is sent anywhere. It all stays in your
            browser.
          </p>
        </div>
        <p>
          Forgotten how to use the extension? Check the
          <a target="blank" href={`welcome.html`}>
            {' '}
            welcome page
          </a>
        </p>
        <p>
          Hint: If you have Parallel Reader open in another tab, you will need
          to refresh the page for these changes to take effect.
        </p>
      </div>
    </StaticContainer>
  );
}
