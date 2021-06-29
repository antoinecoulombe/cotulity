import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Notification from './notification';

interface NotificationsProps {}

class Notifications extends React.Component<NotificationsProps> {
  constructor(props: NotificationsProps) {
    super(props);
  }

  render() {
    return (
      <div className="notifications">
        <FontAwesomeIcon
          icon="angle-left"
          className="nav prev"
        ></FontAwesomeIcon>

        {/* TODO: For each notifications received from backend, add notification */}
        <Notification
          title="An error occured"
          msg="Unhandled exception."
          type="error"
        />

        <FontAwesomeIcon
          icon="angle-right"
          className="nav next"
        ></FontAwesomeIcon>
      </div>
    );
  }
}

export default Notifications;
