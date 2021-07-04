import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

interface AppProps {
  id: string;
  icon: string;
}

export default function App(props: AppProps) {
  return (
    <div className="app-container" id={`app-${props.id}`}>
      <div className="app">
        <FontAwesomeIcon
          icon={['fas', props.icon as IconName]}
        ></FontAwesomeIcon>
      </div>
    </div>
  );
}
