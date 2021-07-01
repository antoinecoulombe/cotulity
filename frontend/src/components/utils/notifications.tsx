import React, { useEffect } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Notification from './notification';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function Notifications() {
  const { notifications, current, nextNotification, prevNotification } =
    useNotifications();

  useEffect(() => {
    $('.notif-container').animate({ opacity: 1 }, 500);
  });

  return (
    <div className="notif-container">
      {/* PREVIOUS NOTIFICATIONS */}
      {current > 0 && (
        <div className="notif-list prev">
          {notifications.slice(current).map((notification) => (
            <Notification json={notification} key={notification.id} />
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="notif-current">
          {current > 0 && (
            <FontAwesomeIcon
              icon="angle-left"
              className="nav prev"
              onClick={prevNotification}
            ></FontAwesomeIcon>
          )}

          {/* CURRENT NOTIFICATION */}
          <Notification
            json={notifications[current]}
            key={notifications[current].id}
          />

          {current < notifications.length - 1 && (
            <FontAwesomeIcon
              icon="angle-right"
              className="nav next"
              onClick={nextNotification}
            ></FontAwesomeIcon>
          )}
        </div>
      )}

      {/* NEXT NOTIFICATIONS */}
      {current < notifications.length - 1 && (
        <div className="notif-list next">
          {notifications.slice(current + 1).map((notification) => (
            <Notification json={notification} key={notification.id} />
          ))}
        </div>
      )}
    </div>
  );
}
