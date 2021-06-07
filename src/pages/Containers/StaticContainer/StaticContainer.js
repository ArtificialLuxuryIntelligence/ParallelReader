// Container to hold static pages :[options, mywords, (help)]

import React from 'react';
import { closeThisTab, openOptions, openMyWords } from '../../../utils/runtime';

import Widget from '../../Content/Components/Widget';
import Footer from './Footer';
import Header from './Header';
import './../../SCSS/base_static.scss';
import './../../SCSS/StaticContainer.scss';


import LayoutContainer from '../LayoutContainer/LayoutContainer';

export default function StaticContainer({
  title,
  message = false,
  nav,
  children,
}) {
  function clickHandler(e) {
    switch (e.currentTarget.dataset.action) {
      case 'options':
        openOptions();
        break;
      case 'mywords':
        openMyWords();
        break;
      case 'close':
        closeThisTab();
        break;
      case 'help':
        break;
      default:
        return;
    }
  }

  const settings = { type: title, message: message, disabled: [] };
  return (
    <LayoutContainer>
      <div id="static-container">
        <div id="static-content">
          <Header title={title} nav={nav} />
          <Widget settings={settings} clickHandler={clickHandler} />
          <div id={'page-content'}> {children}</div>
          <Footer />
        </div>
      </div>
    </LayoutContainer>
  );
}
