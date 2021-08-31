import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../contexts/NotificationsContext';
import Notification from './notification';
import $ from 'jquery';

export default function Notifications() {
  const {
    notifications,
    currentNotification,
    nextNotification,
    prevNotification,
  } = useNotifications();

  useEffect(() => {
    $('.notif-container').animate({ opacity: 1 }, 500);
  }, []);

  return (
    <div className="notif-container">
      {/* PREVIOUS NOTIFICATIONS */}
      {currentNotification > 0 && (
        <div className="notif-list prev">
          {notifications.slice(0, currentNotification).map((notification) => (
            <Notification
              json={notification}
              current={false}
              key={notification.id}
            />
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="notif-current">
          {currentNotification > 0 && (
            <FontAwesomeIcon
              icon="angle-left"
              className="nav prev"
              onClick={prevNotification}
            />
          )}

          {/* CURRENT NOTIFICATION */}
          <Notification
            json={notifications[currentNotification]}
            current={true}
            key={notifications[currentNotification].id}
          />

          {currentNotification < notifications.length - 1 && (
            <FontAwesomeIcon
              icon="angle-right"
              className="nav next"
              onClick={nextNotification}
            />
          )}
        </div>
      )}

      {/* NEXT NOTIFICATIONS */}
      {currentNotification < notifications.length - 1 && (
        <div className="notif-list next">
          {notifications.slice(currentNotification + 1).map((notification) => (
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
}
