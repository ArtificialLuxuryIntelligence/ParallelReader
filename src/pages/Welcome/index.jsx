import React from 'react';
import { render } from 'react-dom';

import Welcome from './Welcome';
// import './index.css';

render(
  <Welcome title={'welcome'} />,
  window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();
