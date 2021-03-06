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
  disabled?: { value: boolean; tooltip: string };
  onClick?: (name: string) => void;
}

const App = (props: AppProps): JSX.Element => {
  const { setNotification } = useNotifications();
  const [hovered, setHover] = useState<boolean>(false);
  const history = useHistory();

  const handleClick = (): void => {
    if (props.onClick) props.onClick(props.name);
    else
      axios
        .get(`/apps/${props.name}`)
        .then(async (res: any) => {
          history.push(`/apps/${props.name}`);
        })
        .catch((err) => {
          if (err?.response?.data) setNotification(err.response.data);
        });
  };

  return (
    <div
      className={`app-container${
        props.disabled?.value === true ? ' disabled' : ''
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={props.disabled?.value === true ? undefined : handleClick}
    >
      <Tooltip hovered={hovered} over={true}>
        {props.disabled?.value === true
          ? props.disabled.tooltip
          : `apps.${props.name}.name`}
      </Tooltip>
      <div className={`app ${props.name}`}>
        <FontAwesomeIcon
          icon={[
            'fas',
            (props.disabled?.value === true && hovered
              ? 'ban'
              : props.icon) as IconName,
          ]}
        />
      </div>
    </div>
  );
};

export default App;
