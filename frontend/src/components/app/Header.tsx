import React from 'react';
import '../../assets/css/open-app.css';
import IconToolTip from '../global/iconTooltip';
import Translate from '../utils/translate';

interface HeaderProps {
  appName: string;
  title: string;
  onAddClick?: (e: any) => void;
}

export default function Header(props: HeaderProps) {
  return (
    <div className="header">
      <h1>
        <Translate
          name={props.title}
          prefix={`${props.appName}.title.`}
        ></Translate>
      </h1>
      {props.onAddClick && (
        <IconToolTip
          icon="plus-circle"
          style={{ iconWidth: 39, tooltipMultiplier: 5 }}
          className="add-btn"
          onClick={props.onAddClick}
        >
          {`${props.appName}.tooltip.add`}
        </IconToolTip>
      )}
    </div>
  );
}
