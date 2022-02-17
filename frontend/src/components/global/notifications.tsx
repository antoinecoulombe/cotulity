import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../contexts/NotificationsContext';
import Notification from './notification';
import $ from 'jquery';

const Notifications = (): JSX.Element => {
  const { notifications, nextNotification, prevNotification } =
    useNotifications();

  useEffect(() => {
    $('.notif-container').animate({ opacity: 1 }, 500);
  }, []);

  const getCurrent = (): number => {
    return notifications.findIndex((n) => n.current);
  };

  return (
    <div className="notif-container">
      {/* PREVIOUS NOTIFICATIONS */}
      {getCurrent() > 0 && (
        <div className="notif-list prev">
          {notifications.slice(0, getCurrent()).map((notification) => (
            <Notification
              json={notification}
              current={false}
              key={notification.id}
            />
          ))}
        </div>
      )}

      {/* CURRENT NOTIFICATION */}
      {notifications.length > 0 && (
        <div className="notif-current">
          {getCurrent() > 0 && (
            <FontAwesomeIcon
              icon="angle-left"
              className="nav prev"
              onClick={prevNotification}
            />
          )}

          <Notification
            json={notifications[getCurrent()]}
            current={true}
            key={notifications[getCurrent()].id}
          />

          {getCurrent() < notifications.length - 1 && (
            <FontAwesomeIcon
              icon="angle-right"
              className="nav next"
              onClick={nextNotification}
            />
          )}
        </div>
      )}

      {/* NEXT NOTIFICATIONS */}
      {getCurrent() < notifications.length - 1 && (
        <div className="notif-list next">
          {notifications.slice(getCurrent() + 1).map((notification) => (
            <Notification
              json={notification}
              current={false}
              key={notification.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
