import React from 'react';
import IconToolTip from './iconTooltip';
import Translate from './translate';

interface WarningPopupProps {
  title: string;
  desc: string;
  yesText: string;
  noText: string;
  children?: string;
  cancelAction: (event: any) => void;
  doAction: (event: any) => void;
}

export default function WarningPopup(props: WarningPopupProps) {
  return (
    <div className="popup-container">
      <div className="warning-popup">
        <div className="icon">
          <IconToolTip
            icon="exclamation-circle"
            style={{ iconWidth: 50, tooltipMultiplier: 9 }}
            error={true}
          >
            {props.children}
          </IconToolTip>
        </div>
        <div className="warning-info">
          <h2>
            <Translate name={props.title} />
          </h2>
          <h3>
            <Translate name={props.desc} />
          </h3>
        </div>
        <div className="buttons">
          <button className="no" onClick={props.cancelAction}>
            <p>
              <Translate name={props.noText} />
            </p>
          </button>
          <button className="yes" onClick={props.doAction}>
            <p>
              <Translate name={props.yesText} />
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
