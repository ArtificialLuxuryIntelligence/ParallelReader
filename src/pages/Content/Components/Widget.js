import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@mdi/react';
import {
  mdiSync,
  mdiSyncOff,
  mdiBookshelf,
  mdiCogOutline,
  mdiClose,
  mdiBookOpenPageVariantOutline,
  mdiArrowLeftRightBoldOutline,
} from '@mdi/js';

import { ReactComponent as PllLogo } from './../../../assets/img/logo.svg';

import './../../SCSS/WidgetStyles.scss'; //used in static pages (when not in a web comp)
import getNavOptions from '../../../modules/navOptions.js';


export default function Widget({ settings, displayMode, clickHandler }) {
  const [isOpen, setisOpen] = useState(
    settings.type === 'loadererror' ? true : false
  );
  function toggleMenu() {
    setisOpen((prev) => !prev);
  }
  function buildHTML(settings, displayMode) {
    const { type, message, disabled } = settings;

    const navOptions = getNavOptions(type);

    function renderOption(options) {
      let { option, text, icon, dataAction } = options;
      let optionDisabled = disabled.includes(option);
      let toggleable = typeof text !== 'string';

      // ------------Handle specific options
      // Currently the only toggleable options are in displayMode
      if (toggleable) {
        let bool = displayMode[option.toLowerCase()];
        text = bool ? text[0] : text[1];
        icon = bool ? icon[0] : icon[1];

      }
      // ------------Handle disabling
      if (option === 'PLLSYNC' && !displayMode?.pllview) {
        optionDisabled = true;
      }

      return (
        <li
          className={optionDisabled ? 'disabled' : 'enabled'}
          key={option}
          onClick={function (e) {
            clickHandler(e);
            // toggleMenu();
          }}
          data-action={dataAction}
        >
          <span className={'label'}> {text}</span>
          <span className={'icon'}>
            <span className={'icon-cont'}>{icon}</span>
          </span>
        </li>
      );
    }

    return (
      <div id={'pll-widget'} className={isOpen ? 'open' : 'closed'}>
        <div
          className={`pll-widget-content notranslate`}
          onMouseLeave={() => setisOpen(false)}
        >
          <div
            onClick={toggleMenu}
            onMouseEnter={() => setisOpen(true)}
            className={'logo'}
          >
            <span>
              <PllLogo />
            </span>
          </div>
          <ul>
            {navOptions.MYWORDS &&
              renderOption({
                option: 'MYWORDS',
                text: 'my words',
                icon: <Icon className={'menu-icon'} path={mdiBookshelf} />,
                clickHandler: clickHandler,
                dataAction: 'mywords',
              })}
            {navOptions.PLLVIEW &&
              renderOption({
                option: 'PLLVIEW',
                text: ['parallel', 'single'],
                icon: [
                  <Icon
                    className={'menu-icon'}
                    path={mdiArrowLeftRightBoldOutline}
                  />,
                  <Icon
                    className={'menu-icon'}
                    path={mdiArrowLeftRightBoldOutline}
                    rotate={90}
                  />,
                ],
                clickHandler: clickHandler,
                dataAction: 'pllview',
              })}
            {navOptions.PLLSYNC &&
              renderOption({
                option: 'PLLSYNC',
                text: ['scroll-sync:on', 'scroll-sync:off'],
                icon: [
                  <Icon className={'menu-icon'} path={mdiSync} />,
                  <Icon className={'menu-icon'} path={mdiSyncOff} />,
                ],
                clickHandler: clickHandler,
                dataAction: 'pllsync',
              })}

            {/* {navOptions.HELP &&
              renderOption({
                option: 'HELP',
                text: 'help',
                icon: '❔',
                clickHandler: clickHandler,
                dataAction: 'help',
              })} */}
            {navOptions.OPTIONS &&
              renderOption({
                option: 'OPTIONS',
                text: 'options',
                icon: <Icon className={'menu-icon'} path={mdiCogOutline} />,

                clickHandler: clickHandler,
                dataAction: 'options',
              })}
            {navOptions.CLOSE &&
              renderOption({
                option: 'CLOSE',
                text: 'close',
                icon: <Icon className={'menu-icon'} path={mdiClose} />,

                clickHandler: clickHandler,
                dataAction: 'close',
              })}
          </ul>

          {message && message.text && (
            <div className={`message ${message.className}`}>{message.text}</div>
          )}
        </div>
      </div>
    );
  }

  return <>{buildHTML(settings, displayMode)}</>;
}

Widget.propTypes = {
  settings: PropTypes.object,
  displayMode: PropTypes.object,
  clickHandler: PropTypes.func,
};
