import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNotifications } from '../../repository';
import Notification from './notification';

interface NotificationsProps {}

class Notifications extends React.Component<NotificationsProps> {
  constructor(props: NotificationsProps) {
    super(props);
  }

  render() {
    return (
      <div className="notif-container">
        {/* 
          TODO: WHEN NEXT NOTIF IS SELECTED WITHOUT CLOSING 'notif-current', 
            -> MOVE 'notif-current' HERE 
            -> RESET NOTIF TIMER
        */}
        <div className="notif-list prev">
          <Notification title="errorHappened" msg="tryAgain" type="success" />
          <Notification title="errorHappened" msg="tryAgain" type="success" />
        </div>

        <div className="notif-current">
          <FontAwesomeIcon
            icon="angle-left"
            className="nav prev"
          ></FontAwesomeIcon>

          {/* TODO: SHOW FIRST NOTIF HERE */}
          <Notification title="errorHappened" msg="tryAgain" type="error" />

          <FontAwesomeIcon
            icon="angle-right"
            className="nav next"
          ></FontAwesomeIcon>
        </div>

        {/* TODO: SHOW ALL REMAINING NOTIFICATIONS HERE (ALL BUT FIRST ONE SHOWN IN 'notif-current') */}
        <div className="notif-list next">
          <Notification title="errorHappened" msg="tryAgain" type="success" />
          <Notification title="errorHappened" msg="tryAgain" type="success" />
        </div>
      </div>
    );
  }
}

export default Notifications;
