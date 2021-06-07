import React, { useState } from 'react';

export default function SimpleSlider({
  handleSlide,
  value,
  min,
  max,
  step = 0,
}) {
 
  return (
    <div className={'simple-slider'}>
      <label>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSlide}
          step={step}
        />
        {value}
      </label>
    </div>
  );
}
