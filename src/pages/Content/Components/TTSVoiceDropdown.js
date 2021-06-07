import React, { useEffect, useState } from 'react';

import SimpleDropdown from './SimpleDropdown';
import SimpleSlider from './SimpleSlider';

export default function TTSVoiceDropdown({
  TTSdropdownOptions,
  TTSVoice,
  setTTSVoice,
  TTSRate,
  setTTSRate,
}) {

  function handleSelect(value) {
    setTTSVoice(value);
  }
  function handleSlide(e) {
    setTTSRate(e.target.value);
  }

  return (
    <div className={'notranslate ttsvoice-group'} translate="no">
      {TTSdropdownOptions && (
        <>
          <div className={'control-group'}>
            <span> Voice: </span>
            <SimpleDropdown
              options={TTSdropdownOptions}
              onChange={handleSelect}
              value={TTSVoice} //default value
              placeholder="Select Voice"
            />
          </div>
          <div className={'control-group'}>
            <span> Speed: </span>
            <SimpleSlider
              min={0.5}
              max={1.5}
              value={TTSRate}
              handleSlide={handleSlide}
              step={0.05}
            />
          </div>
        </>
      )}
    </div>
  );
}
