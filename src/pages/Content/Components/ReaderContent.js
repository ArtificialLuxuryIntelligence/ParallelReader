import React from 'react';
import parse, { domToReact } from 'html-react-parser';
import InViewElementWrapper from './InViewElementWrapper';

// Memoized Component

function ReaderContent({
  content,
  section,
  mouseOuthandler,
  mouseInhandler,
  inViewHandler,
  extensionRef,
}) {
  // if the handlers are grouped in an object then THAT probably needs to get memoized in parent or something
  //  keep it simple for now and wait for me to get smart

  const handlers = {
    mouseOuthandler,
    mouseInhandler,
    inViewHandler,
  };

  // Extra info the handler need to work
  const handlerDeps = {
    extensionRef,
  };

  function parseAddHandlers(htmlString, section, handlers, handlerDeps) {
    const { mouseOuthandler, mouseInhandler } = handlers;
    const {
      extensionRef,
    } = handlerDeps;

    function replace({ attribs, children }) {

  

      if (attribs?.href) {
        let href = attribs.href;
        href = href.replace(/^\/\//, 'https://'); // make relative links in websites work in iframe/extension

        return (
          <a href={href} rel="noreferrer" target="_blank">
            {domToReact(children)}
          </a>
        );
      }

      if (attribs?.class && attribs.class.includes('pll-sentence')) {
        const c = attribs.class;
        const d = attribs['data-pll'];

        const enterHandler = mouseInhandler(section);
        const leaveHandler = mouseOuthandler(section);

        return (
          <>
            <span
              onMouseEnter={enterHandler}
              onMouseLeave={leaveHandler}
              className={c}
              data-pll={d}
            >
              {domToReact(children)}
            </span>
          </>
        );
      }
      if (attribs?.class && attribs.class.includes('pll-scroll-anchor')) {
        const c = attribs.class;
        const d = attribs['data-pll'];

        if (section === 'translation') {
          return (
            <>
              <p className={c} data-pll={d}>
                {domToReact(children, { replace: replace })}
              </p>
            </>
          );
        } else if (section === 'original') {
          return (
            <InViewElementWrapper
              root={extensionRef.current}
              inViewHandler={inViewHandler}
            >
              <>
                <p className={c} data-pll={d}>
                  {domToReact(children, { replace: replace })}
                </p>
              </>
            </InViewElementWrapper>
          );
        }
      }
   
    }

    let p = parse(htmlString, { replace });
    return p;
  }

  return (
    <div dir="auto" className={section === 'original' ? `notranslate` : ''}>
      {parseAddHandlers(content, section, handlers, handlerDeps)}
    </div>
  );
}

export default React.memo(ReaderContent);
