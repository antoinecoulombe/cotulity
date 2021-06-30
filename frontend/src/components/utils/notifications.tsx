import React, { useEffect } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Notification from './notification';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function Notifications() {
  const { notifications } = useNotifications();

  useEffect(() => {
    $('.notif-container').animate({ opacity: 1 }, 500);
  });

  function handlePrevClose() {}
  function handleClose() {}
  function handleNextClose() {}

  return (
    <div className="notif-container">
      {/* 
          TODO: WHEN NEXT NOTIF IS SELECTED WITHOUT CLOSING 'notif-current', 
            -> MOVE 'notif-current' HERE 
            -> RESET NOTIF TIMER
        */}
      {/* <div className="notif-list prev">
        <Notification json={notifications[0]} onClose={handlePrevClose}/>
        <Notification title="errorHappened" msg="tryAgain" type="success" />
      </div> */}
      {notifications.length > 0 && (
        <div className="notif-current">
          <FontAwesomeIcon
            icon="angle-left"
            className="nav prev"
          ></FontAwesomeIcon>

          {/* TODO: SHOW FIRST NOTIF HERE */}
          <Notification json={notifications[0]} onClose={handleClose} />

          <FontAwesomeIcon
            icon="angle-right"
            className="nav next"
          ></FontAwesomeIcon>
        </div>
      )}

      {/* NEXT NOTIFICATIONS */}
      {notifications.length > 1 && (
        <div className="notif-list next">
          {notifications.slice(1).map((notification) => (
            <Notification json={notification} onClose={handleNextClose} />
          ))}
        </div>
      )}
    </div>
  );
}
