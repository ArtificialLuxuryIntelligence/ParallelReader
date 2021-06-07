import React, { useEffect, useState } from 'react';
import { TTSDropdownOptions } from '../../../modules/dropdownOptions';

export default function useGetTTSOptions(lang) {
  const [ddOptions, setddOptions] = useState(null);
  const [TTSvoices, setTTSVoices] = useState(null);

  function getOptions(lang, voices) {
    if (!lang || !voices) {
      return;
    }
    let options = TTSDropdownOptions(lang, voices);
    setddOptions(options);
  }

  function getVoices() {
    const voices = speechSynthesis.getVoices();
    setTTSVoices(voices);
  }

  useEffect(() => {
    getVoices(); //get once on init
    speechSynthesis.addEventListener('voiceschanged', getVoices);
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', getVoices);
    };
  }, [lang]);

  useEffect(() => {
    getOptions(lang, TTSvoices);
  }, [lang, TTSvoices]);

  return ddOptions;
}
