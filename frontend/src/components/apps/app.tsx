import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { useHistory } from 'react-router';
import { useNotifications } from '../../contexts/NotificationsContext';
import Tooltip from '../global/tooltip';
import axios from '../../utils/fetchClient';

interface AppProps {
  id?: number;
  name: string;
  icon: string;
  onClick?: (name: string) => void;
}

export default function App(props: AppProps) {
  const { setNotification } = useNotifications();
  const [hovered, setHover] = useState<boolean>(false);
  const history = useHistory();

  function handleClick() {
    if (props.onClick) props.onClick(props.name);
    else
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
      <Tooltip
        hovered={hovered}
        over={true}
      >{`apps.${props.name}.name`}</Tooltip>
      <div className={`app ${props.name}`}>
        <FontAwesomeIcon icon={['fas', props.icon as IconName]} />
      </div>
    </div>
  );
}
