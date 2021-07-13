import React from 'react';
import IconToolTip from './iconTooltip';
import Translate from './translate';

interface WarningPopupProps {
  title: string;
  desc: string;
  yesText: string;
  noText: string;
  children?: string;
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
          <button>
            <Translate name={props.noText} />
          </button>
          <button>
            <Translate name={props.yesText} />
          </button>
        </div>
      </div>
    </div>
  );
}
