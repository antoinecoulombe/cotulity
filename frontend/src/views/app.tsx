import React, { useState } from 'react';
import { Link, Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PrivateRoute, PublicRoute } from '../components/utils/routes';
import { useNotifications } from '../contexts/NotificationsContext';
import { getNotifications } from '../utils/global';

// CSS
import '../assets/css/theme.css';

// Pages
import LoginPage from './login';
import AppsPage from './apps';
import Notifications from '../components/utils/notifications';
import NotFoundPage from './404';
import newHomePage from './apps/newHome';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowAltCircleRight,
  faAngleRight,
  faAngleLeft,
  faExclamationCircle,
  faTimesCircle,
  faInfoCircle,
  faCheckCircle,
  faTimes,
  faFileInvoiceDollar,
  faTasks,
  faCogs,
  faUtensils,
  faHome,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faArrowAltCircleRight,
  faAngleRight,
  faAngleLeft,
  faExclamationCircle,
  faTimesCircle,
  faInfoCircle,
  faCheckCircle,
  faTimes,
  faFileInvoiceDollar,
  faTasks,
  faCogs,
  faUtensils,
  faHome,
  faQuestionCircle
);

export default function App() {
  const history = useHistory();
  const { clearAllNotifications, setNotificationArray } = useNotifications();
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

  function logout() {
    localStorage.clear();
    clearAllNotifications();
    history.push('/');
  }

  async function handleNotifications() {
    const notifications = await getNotifications();
    setNotificationArray(notifications);
  }

  return (
    <div className={`App ${theme}`}>
      <Notifications />
      <Switch>
        <PublicRoute exact path="/" component={LoginPage} />
        <PrivateRoute exact path="/apps" component={AppsPage} />
        <PrivateRoute exact path="/apps/homes/new" component={newHomePage} />

        <Route exact path="/404" component={NotFoundPage} />
        <Redirect to="/404" />
      </Switch>
      <Link
        className="logo small"
        style={
          window.location.pathname == '/'
            ? { display: 'none' }
            : { display: 'block' }
        }
        to="/"
      ></Link>

      <div className="trashDiv">
        <button onClick={() => setTheme(theme == 'light' ? 'dark' : 'light')}>
          {theme == 'light' ? 'Lights out' : 'Brighten the mood'}
        </button>
        <button onClick={logout}>Logout</button>
        <button onClick={handleNotifications}>Get Notifications</button>
        <Link to="/apps" className="trashLink">
          Apps
        </Link>
        <Link to="/" className="trashLink">
          Home
        </Link>
        <Link to="/oops" className="trashLink">
          Lost
        </Link>
        <ToggleLanguage />
      </div>
    </div>
  );
}
