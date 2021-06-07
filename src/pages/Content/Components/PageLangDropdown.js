import React, { useEffect, useState } from 'react';
import SimpleDropdown from './SimpleDropdown';

import { deDuplicateLangCode } from '../../../modules/languageMappings';



export default function PageLangDropdown({
  lang,
  savePageLang,
  pageLangDropdownOptions,
}) {
  const [baseLang, setBaseLang] = useState('');

  useEffect(() => {
    getBaseLang();
  }, []);


  function handleSelect(value) {
    savePageLang(value);
  }

  function getBaseLang() {
    chrome.storage.local.get('base_language', ({ base_language }) => {
      setBaseLang(base_language);
    });
  }


  return (
    <div className={'notranslate control-group'} translate="no">
      {pageLangDropdownOptions && (
        <>
          <span> This page is in</span>
          <SimpleDropdown
            options={pageLangDropdownOptions}
            onChange={handleSelect}
            value={lang} //default value
            placeholder="Select text language"
          />
        </>
      )}

      {(!lang || deDuplicateLangCode(lang) === baseLang) && (
        <h4> ⬅ Please pick the language of the text</h4>
      )}
    </div>
  );
}
