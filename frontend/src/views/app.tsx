import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// CSS
import '../assets/css/theme.css';

// Pages
import LoginPage from './login';
import AppsPage from './apps';
import Notifications from '../components/utils/notifications';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
library.add(faArrowAltCircleRight);
library.add(faAngleRight);
library.add(faAngleLeft);
library.add(faExclamationCircle);
library.add(faTimesCircle);
library.add(faInfoCircle);
library.add(faCheckCircle);
library.add(faTimes);

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
      <Notifications />
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
