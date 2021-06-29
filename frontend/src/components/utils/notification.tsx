import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Translate from './translate';

interface NotificationProps {
  title: string;
  msg: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

class Notification extends React.Component<NotificationProps> {
  icons = {
    error: 'times-circle',
    warning: 'exclamation-circle',
    info: 'info-circle',
    success: 'check-circle',
  };

  constructor(props: NotificationProps) {
    super(props);
  }

  render() {
    return (
      <div className={`notification ${this.props.type}`}>
        <div className="vertical-line"></div>
        <FontAwesomeIcon
          icon={
            this.props.type === 'error'
              ? 'times-circle'
              : this.props.type === 'warning'
              ? 'exclamation-circle'
              : this.props.type === 'info'
              ? 'info-circle'
              : 'check-circle'
          }
          className={`icon ${this.props.type}`}
        />
        <div className="text">
          <h1>
            <Translate name={`notif.title.${this.props.title}`} />
          </h1>
          <p>
            <Translate name={`notif.msg.${this.props.msg}`} />
          </p>
        </div>
        <FontAwesomeIcon icon="times" className="close" />
      </div>
    );
  }
}

export default Notification;
