import { InView } from 'react-intersection-observer';
import React from 'react';
import useWindowDimensions from '../Hooks/useWindowDimensions';

// Wrap a component in this wrapper to add intersection observer at center of screen

export default function InViewElementWrapper({
  children,
  inViewHandler,
  root,
  sync,
}) {
  let { height } = useWindowDimensions();
  return (
    <InView
      onChange={(inView, entry) => inViewHandler(inView, entry)}
      threshold={0}
      root={root}
      // rootMargin={`-50% 0%`}
      rootMargin={` 0px 0px -${height / 2}px 0px`}
    >
      {({ inView, ref, entry }) => (
        <div className={'sync-scroll-wrapper'} ref={ref}>
          {children}
        </div>
      )}
    </InView>
  );
}
