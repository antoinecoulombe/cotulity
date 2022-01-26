import { useEffect, useState } from 'react';
import { Link, Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from '../components/utils/routes';
import { useNotifications } from '../contexts/NotificationsContext';
import { getNotifications, isAuthenticated } from '../utils/global';

// CSS
import '../assets/css/globals/theme.css';
import '../assets/css/globals/global.css';

// Components
import Notifications from '../components/global/notifications';

// Pages
import LoginPage from './login';
import AppsPage from './apps/index';
import NotFoundPage from './404';

// Apps
import AppNewHome from './apps/newHome';
import AppTasks from './apps/tasks';
import AppGroceries from './apps/groceries';
import AppSettings from './apps/settings';
import AppHomes from './apps/homes';
import AppFinances from './apps/finances';
import AppConsole from './apps/console';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowAltCircleRight,
  faArrowAltCircleLeft,
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
  faPlusCircle,
  faChevronDown,
  faChevronUp,
  faSignOutAlt,
  faPen,
  faUserPlus,
  faTrash,
  faUserCircle,
  faUserMinus,
  faCrown,
  faUpload,
  faDoorClosed,
  faDoorOpen,
  faCalendar,
  faHashtag,
  faCheck,
  faPlusSquare,
  faLock,
  faHistory,
  faPlus,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

library.add(
  faArrowAltCircleRight,
  faArrowAltCircleLeft,
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
  faPlusCircle,
  faChevronDown,
  faChevronUp,
  faSignOutAlt,
  faPen,
  faUserPlus,
  faTrash,
  faUserCircle,
  faUserMinus,
  faCrown,
  faUpload,
  faDoorClosed,
  faDoorOpen,
  faCalendar,
  faHashtag,
  faCheck,
  faPlusSquare,
  faLock,
  faStar,
  faHistory,
  faPlus,
  faTerminal
);

export default function App() {
  const history = useHistory();
  const { clearAllNotifications } = useNotifications();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { i18n } = useTranslation('common');

  useEffect(() => {
    i18n.changeLanguage(localStorage.getItem('lang') || 'en');

    const notifInterval = setInterval(() => {
      getNotifications();
    }, 10 * 60 * 1000); // Every 10 minutes

    if (!localStorage.getItem('safeDelete'))
      localStorage.setItem('safeDelete', 'true');

    if (!localStorage.getItem('autoTheme'))
      localStorage.setItem('autoTheme', 'true');

    if (localStorage.getItem('autoTheme') === 'true') {
      const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(darkThemeMq.matches ? 'dark' : 'light');
    }

    return () => clearInterval(notifInterval);
  }, []);

  function logout() {
    localStorage.clear();
    clearAllNotifications();
    history.push('/');
  }

  return (
    <div className={`App ${theme}`}>
      <Notifications />
      <Switch>
        <PrivateRoute exact path="/apps/homes/new" component={AppNewHome} />
        <PrivateRoute exact path="/apps/homes" component={AppHomes} />
        {/* <PrivateRoute exact path="/apps/finances" component={AppFinances} /> */}
        <PrivateRoute exact path="/apps/tasks" component={AppTasks} />
        <PrivateRoute exact path="/apps/groceries" component={AppGroceries} />
        <PrivateRoute exact path="/apps/console" component={AppConsole} />
        <Route
          exact
          path="/apps/settings"
          render={(props) =>
            isAuthenticated() === true ? (
              <AppSettings {...props} setTheme={setTheme} theme={theme} />
            ) : (
              <Redirect
                to={{ pathname: '/', state: { from: props.location } }}
              />
            )
          }
        />
        <PrivateRoute exact path="/apps/:token?" component={AppsPage} />
        <PublicRoute exact path="/" component={LoginPage} />
        <Route
          exact
          path="/login/:token?"
          render={(props) =>
            !isAuthenticated() === true ? (
              <LoginPage />
            ) : (
              <Redirect
                to={{
                  pathname: `/apps/${props.match.params.token ?? ''}`,
                  state: { from: props.location },
                }}
              />
            )
          }
        />
        <Route exact path="/404" component={NotFoundPage} />
        <Redirect to="/404" />
      </Switch>
      <Link
        className="logo small"
        style={
          localStorage.getItem('userId') == undefined
            ? { display: 'none' }
            : { display: 'block' }
        }
        to="/"
      ></Link>

      <div className="trashDiv"></div>
      {isAuthenticated() && (
        <div className="logout" onClick={logout}>
          <FontAwesomeIcon icon="door-closed" className="icon close" />
          <FontAwesomeIcon icon="door-open" className="icon open" />
        </div>
      )}
    </div>
  );
}
