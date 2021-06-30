import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Translate from './translate';
import {
  strictJsonNotification,
  useNotifications,
} from '../../contexts/NotificationsContext';

interface NotificationProps {
  json: strictJsonNotification;
  onClose: () => void;
}

export default function Notification(props: NotificationProps) {
  const icons = {
    error: 'times-circle',
    warning: 'exclamation-circle',
    info: 'info-circle',
    success: 'check-circle',
  };
  const { clearNotification } = useNotifications();

  async function handleClose() {
    clearNotification(props.json.id);
  }

  return (
    <div className={`notification ${props.json.type.name}`}>
      <div className="vertical-line"></div>
      <FontAwesomeIcon
        icon={icons[props.json.type.name]}
        className={`icon ${props.json.type.name}`}
      />
      <div className="text">
        <h1>
          <Translate name={props.json.title} prefix="notif.title." />
        </h1>
        <p>
          <Translate name={props.json.msg} prefix="notif.msg." />
        </p>
      </div>
      <FontAwesomeIcon icon="times" className="close" onClick={handleClose} />
    </div>
  );
}
