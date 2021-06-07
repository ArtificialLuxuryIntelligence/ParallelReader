import React, { useState, useEffect } from 'react';

// Detect page translation

function isPageTranslateEnabled(targetNode) {
  return targetNode.classList.contains('translated-ltr');
}

export default function useIsTranslateEnabled() {
  const [isTranslateEnabled, setIsTranslateEnabled] = useState(false);

  useEffect(() => {
    const targetNode = document.querySelector('html');

    //Check if is translated on start
    let translateEnabled = isPageTranslateEnabled(targetNode);
    if (translateEnabled) {
      setIsTranslateEnabled(true);
    }

    // Check if is translated on html attr changes
    const config = { attributes: true, childList: false, subtree: false };
    const callback = function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes') {
          let translateEnabled = isPageTranslateEnabled(targetNode);
          //todo right to left translations
          if (translateEnabled) {
            setIsTranslateEnabled(true);
          } else {
            setIsTranslateEnabled(false);
          }
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    return () => {
      observer.disconnect();
    };
  }, []);
  return isTranslateEnabled;
}
