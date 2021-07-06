import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { useHistory } from 'react-router';
import { useNotifications } from '../../contexts/NotificationsContext';
import Tooltip from '../utils/tooltip';
import axios from '../../utils/fetchClient';

interface AppProps {
  id?: number;
  name: string;
  icon: string;
}

export default function App(props: AppProps) {
  const { setNotification } = useNotifications();
  const [hovered, setHover] = useState<boolean>(false);
  const history = useHistory();

  function handleClick() {
    axios
      .get(`/apps/${props.name}`)
      .then(async (res: any) => {
        history.push(`/apps/${props.name}`);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  return (
    <div
      className="app-container"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    >
      <div className="app">
        <FontAwesomeIcon
          icon={['fas', props.icon as IconName]}
        ></FontAwesomeIcon>
      </div>
      <Tooltip hovered={hovered}>{`apps.${props.name}.name`}</Tooltip>
    </div>
  );
}
