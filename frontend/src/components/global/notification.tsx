import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  strictJsonNotification,
  useNotifications,
} from '../../contexts/NotificationsContext';
import $ from 'jquery';
import Translate from '../utils/translate';

interface NotificationProps {
  json: strictJsonNotification;
  current: boolean;
}

const Notification = (props: NotificationProps): JSX.Element => {
  const icons = {
    error: 'times-circle',
    warning: 'exclamation-circle',
    info: 'info-circle',
    success: 'check-circle',
  };
  const { clearNotification } = useNotifications();

  useEffect(() => {
    $('.notification').animate({ opacity: 1 }, 200);
  }, []);

  const handleClose = async (): Promise<void> => {
    if (props.current && props.json.id) clearNotification();
  };

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
};

export default Notification;
