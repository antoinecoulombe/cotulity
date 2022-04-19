import { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from '../components/utils/routes';
import { useNotifications } from '../contexts/NotificationsContext';
import { getNotifications, isAuthenticated } from '../utils/global';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// CSS
import '../assets/css/globals/theme.css';
import '../assets/css/globals/global.css';

// Components
import Notifications from '../components/global/notifications';

// Pages
import LoginPage from './login';
import AppsPage from './apps/index';
import PasswordEditPage from './passwordEdit';
import NotFoundPage from './404';

// Apps
import AppNewHome from './apps/newHome';
import AppTasks from './apps/tasks';
import AppGroceries from './apps/groceries';
import AppSettings from './apps/settings';
import AppHomes from './apps/homes';
import AppAccounts from './apps/accounts';
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
  faTrashArrowUp,
  faStar,
  faReceipt,
  faExchangeAlt,
  faPeopleArrows,
  faBan,
  faCircle,
  faCalendarDays,
  faLocationDot,
  faRepeat,
  faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';
import AppCalendar from './apps/calendar';

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
  faTerminal,
  faTrashArrowUp,
  faReceipt,
  faExchangeAlt,
  faPeopleArrows,
  faBan,
  faCircle,
  faCalendarDays,
  faLocationDot,
  faRepeat,
  faCalendarDay
);

const App = (): JSX.Element => {
  const history = useHistory();
  const { setNotificationArray, setInfoNotification, clearAllNotifications } =
    useNotifications();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { i18n } = useTranslation('common');

  useEffect(() => {
    i18n.changeLanguage(localStorage.getItem('lang') || 'en');

    const notifInterval = setInterval(async () => {
      setNotificationArray(await getNotifications());
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

  const logout = (): void => {
    clearAllNotifications();
    localStorage.clear();
    history.push('/');
  };

  return (
    <div className={`App ${theme}`}>
      <Notifications />
      <Switch>
        <PrivateRoute exact path="/apps/homes/new" component={AppNewHome} />
        <PrivateRoute exact path="/apps/homes" component={AppHomes} />
        <PrivateRoute exact path="/apps/accounts" component={AppAccounts} />
        <PrivateRoute exact path="/apps/tasks" component={AppTasks} />
        <PrivateRoute exact path="/apps/groceries" component={AppGroceries} />
        <PrivateRoute exact path="/apps/calendar" component={AppCalendar} />
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
        <PrivateRoute exact path="/apps" component={AppsPage} />
        <PrivateRoute
          exact
          path="/apps/invitations/:token"
          component={AppsPage}
        />
        <PublicRoute exact path="/" component={LoginPage} />
        <Route
          exact
          path="/login/verify/:verifyToken"
          render={(props) => {
            if (isAuthenticated() === true) {
              setInfoNotification({
                title: 'account.loggedOut',
                msg: 'account.verificationEmail.loggedOut',
              });
              logout();
            }
            return <LoginPage />;
          }}
        />
        <Route
          exact
          path="/login/:token?"
          render={(props) =>
            !isAuthenticated() === true ? (
              <LoginPage />
            ) : (
              <Redirect
                to={{
                  pathname: `/apps/invitations/${
                    props.match.params.token ?? ''
                  }`,
                  state: { from: props.location },
                }}
              />
            )
          }
        />
        <PublicRoute
          exact
          path="/account/newpassword/:token"
          component={PasswordEditPage}
        />
        <Route exact path="/404" component={NotFoundPage} />
        <Redirect to="/404" />
      </Switch>

      <div className="trashDiv"></div>
      {isAuthenticated() && (
        <div className="logout" onClick={logout}>
          <FontAwesomeIcon icon="door-closed" className="icon close" />
          <FontAwesomeIcon icon="door-open" className="icon open" />
        </div>
      )}
    </div>
  );
};

export default App;
