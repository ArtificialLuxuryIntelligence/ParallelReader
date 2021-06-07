import React from 'react';
import StaticContainer from '../Containers/StaticContainer/StaticContainer';

import { ReactComponent as PllLogo } from './../../assets/img/logo.svg';

import './../SCSS/PllReader/SimpleDropdown.scss';
import './Welcome.scss';
import Icon from '@mdi/react';
import { mdiAccountVoice, mdiContentSaveOutline, mdiSearchWeb } from '@mdi/js';

export default function Welcome() {
  return (
    <StaticContainer title={'welcome'}>
      <div id="welcome">
        <h2>Hello language learner!</h2>
        <h3>What does Parallel Reader do?</h3>

        <p>
          Parallel texts are a great way to learn languages and Parallel Reader
          makes it easy to do this with texts on the web.
        </p>
        <p>
          Parallel Reader takes online text resources (articles, stories, etc.)
          and displays them in a distraction-free reader where the original and
          translated texts are presented side by side. With extra features such
          as text to speech, you'll be improving in no time.
        </p>

        <h3>Usage</h3>
        <p>
          Launch the extension when you are on the page you want to read and
          enable your browser translation.
        </p>
        <p>
          The reader can be launched by either clicking the Parallel Reader icon
          in the extensions menu or by right-clicking a website and selecting
          the Parallel Reader option.
        </p>
        <h3>Menus</h3>
        <ol>
          <li>
            <p>
              In the reader, you can highlight a word or a selection
              (double-clicking is easiest for words).
            </p>
            <p>This opens a popup that lets you to:</p>

            <ul>
              <li>
                <Icon path={mdiContentSaveOutline} />
                Save the word
              </li>
              <li>
                <Icon path={mdiSearchWeb} />
                Look the word up in an external dictionary
              </li>
              <li>
                <Icon path={mdiAccountVoice} />
                Hear the word{' '}
              </li>
            </ul>
          </li>
          <li>
            <p>
              The
              <span className="icon">
                <PllLogo />
              </span>
              logo on the right is the main menu that gives the options for the
              page{' '}
            </p>
          </li>
        </ol>
        <div className={'hints'}>
          <p>
            Hint: You can find this page again by looking at the bottom of the
            <a target="blank" href={`options.html`}>
              {' '}
              options{' '}
            </a>{' '}
            page
          </p>
        </div>
      </div>
    </StaticContainer>
  );
}
