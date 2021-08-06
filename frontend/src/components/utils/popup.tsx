import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconToolTip from '../global/iconTooltip';
import ReactDOMServer from 'react-dom/server';
import Translate from './translate';

interface PopupProps {
  children: any;
  type: 'edit' | 'si' | 'warning';
  new?: boolean;
  onCancel(...attr: any): any;
  onSubmit?(...attr: any): any;
  onDelete?(...attr: any): any;
}

export default function Popup(props: PopupProps) {
  return (
    <div className="popup-container">
      <div className={`popup ${props.type}`}>
        <div className="close">
          <FontAwesomeIcon
            icon="times"
            className="icon"
            onClick={props.onCancel}
          />
        </div>
        {props.children}
        {props.onSubmit && (
          <div className="buttons">
            {props.onDelete && (
              <IconToolTip
                icon="trash"
                style={{ iconWidth: 38, tooltipMultiplier: 5 }}
                circled={{ value: true, multiplier: 0.45 }}
                error={true}
                onClick={(...attr) => props.onDelete?.(attr)}
              >
                {ReactDOMServer.renderToStaticMarkup(
                  <Translate name="delete" prefix="nav." />
                )}
              </IconToolTip>
            )}
            <button className="no" onClick={props.onCancel}>
              <p>
                <Translate name="cancel" prefix="nav." />
              </p>
            </button>
            <button
              className="save"
              onClick={(...attr) => props.onSubmit?.(attr)}
            >
              <p>
                <Translate name={props.new ? 'send' : 'save'} prefix="nav." />
              </p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
