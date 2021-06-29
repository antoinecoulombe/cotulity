import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import '../assets/css/theme.css';
import { useTranslation } from 'react-i18next';

import LoginPage from './login';
import AppsPage from './apps';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
library.add(faArrowAltCircleRight);

export default function App() {
  const [theme, setTheme] = useState('light');

  function ToggleLanguage() {
    const [t, i18n] = useTranslation('common');
    return (
      <div className="toggleToTrash">
        <button onClick={() => i18n.changeLanguage('fr')}>Francais</button>
        <button onClick={() => i18n.changeLanguage('en')}>English</button>
      </div>
    );
  }

  return (
    <div className={`App ${theme}`}>
      <Switch>
        <Route exact path="/" component={LoginPage} />
        <Route exact path="/apps" component={AppsPage} />
      </Switch>
      <div className="logo small"></div>
      <button
        className="btnToTrash"
        onClick={() => setTheme(theme == 'light' ? 'dark' : 'light')}
      >
        {theme == 'light' ? 'Lights out' : 'Brighten the mood'}
      </button>
      <ToggleLanguage />
    </div>
  );
}
