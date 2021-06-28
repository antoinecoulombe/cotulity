import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import '../assets/css/theme.css';

import LoginPage from './login';
import AppsPage from './apps';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
library.add(faArrowAltCircleRight);

export default function App() {
  const [theme, setTheme] = useState('light');

  return (
    <div className={`App ${theme}`}>
      <Switch>
        <Route exact path="/" component={LoginPage} />
        <Route path="/apps" component={AppsPage} />
      </Switch>
      <div className="logo small"></div>
      <button
        className="btnToTrash"
        onClick={() => setTheme(theme == 'light' ? 'dark' : 'light')}
      >
        {theme == 'light' ? 'Lights out' : 'Brighten the mood'}
      </button>
    </div>
  );
}
