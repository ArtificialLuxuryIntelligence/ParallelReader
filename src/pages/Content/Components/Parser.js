//Parser
// - receive url
// 1) mercury parse and split sentences -once for all content

// Reader
//Layout with:

//Reader content:
// 3) parse add handlers [reader content] - twice (once for original, once for translated)
// 4) Render

import React, { useEffect, useState } from 'react';
import Reader from './Reader';

import Mercury from '@postlight/mercury-parser';
import { parseAndSplit } from '../../../modules/DOMmanipulation';
import { deDuplicateLangCode } from '../../../modules/languageMappings';
// import { Buffer } from 'buffer';

export default function Parser({ url, setDocumentParsed }) {
  const [htmlString, sethtmlString] = useState(null);
  const [lang, setLang] = useState(null);

  // Extract content from page
  async function fetchData(url) {
    let dataFetch = await fetch(url);
    let text = await dataFetch.text();
    let lang = getLang(text);
    
    //
    // bug [getting some encoding issues (not all chars rendering properly) on some pages when prefetching ]
    // let data = await Mercury.parse(url, { html: text }); //use the prefetched html

    // cant get this solution working https://github.com/postlight/mercury-parser/issues/425
    // let data = await Mercury.parse(url, {
    //   html: Buffer.from(text, 'utf-8'),
    // }); //use the prefetched html

    //fetch page again.
    let data = await Mercury.parse(url);

    return { data, lang };

    function getLang(HTMLtext) {
      let parser = new DOMParser();
      let doc = parser.parseFromString(HTMLtext, 'text/html');
      let lang = doc.documentElement.lang || 'en'; //handle undefined
      lang = deDuplicateLangCode(lang);
      return lang;
    }
  }

  // Parse the data [split sentences, add classes, remove classes etc]
  // returns html string
  function parseData(data) {
    const { content, title } = data;
    let content_parsed = parseAndSplit(content);
    let title_parsed = parseAndSplit(title);
    let htmlstring = `<h1 class="pll-title">${title_parsed}</h1><div>${content_parsed}</div>`;
    return htmlstring;
  }

  // --------------------------------------------------------
  // Effects
  // --------------------------------------------------------

  useEffect(() => {
    (async function () {
      let { data, lang } = await fetchData(url);
      let htmlString = parseData(data);
      sethtmlString(htmlString);
      setLang(lang);
      setDocumentParsed(true);

      // hack
      document.querySelector('#pll-reader-host').classList.add(`1`); //mutates the dom to trigger translate
    })();
  }, [url]);

  return (
    <>{htmlString && lang && <Reader htmlString={htmlString} lang={lang} />}</>
  );
}
