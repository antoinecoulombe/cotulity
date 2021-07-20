import React, { useEffect } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Translate from '../utils/translate';
import {
  strictJsonNotification,
  useNotifications,
} from '../../contexts/NotificationsContext';

interface NotificationProps {
  json: strictJsonNotification;
  current: boolean;
}

export default function Notification(props: NotificationProps) {
  const icons = {
    error: 'times-circle',
    warning: 'exclamation-circle',
    info: 'info-circle',
    success: 'check-circle',
  };
  const { clearNotification } = useNotifications();

  useEffect(() => {
    $('.notification').animate({ opacity: 1 }, 200);
    // setTimeout(() => {
    //   handleClose();
    // }, props.json.type.showTime * 1000);
  }, []);

  async function handleClose() {
    if (props.current && props.json.id) clearNotification();
  }

  return (
    <div className={`notification ${props.json.type.name}`}>
      <div className="line-container">
        <div className="vertical-line"></div>
      </div>
      <FontAwesomeIcon
        icon={icons[props.json.type.name]}
        className={`icon ${props.json.type.name}`}
      />
      <div className="text">
        <h1>
          <Translate
            name={props.json.title ?? 'request.error'}
            prefix="notif.title."
          />
        </h1>
        <p>
          <Translate
            name={props.json.title ? props.json.msg : 'request.error'}
            prefix="notif.msg."
          />
        </p>
      </div>
      <FontAwesomeIcon icon="times" className="close" onClick={handleClose} />
    </div>
  );
}
