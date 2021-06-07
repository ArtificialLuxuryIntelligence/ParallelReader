import React from 'react';
import { render } from 'react-dom';

import MyWords from './MyWords';

render(<MyWords />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
