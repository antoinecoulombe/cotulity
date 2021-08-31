import IconToolTip from './iconTooltip';
import Translate from '../utils/translate';
import Popup from '../utils/popup';

interface WarningPopupProps {
  title: string;
  desc?: string;
  yesText: string;
  noText: string;
  children?: string;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
}

export default function WarningPopup(props: WarningPopupProps) {
  return (
    <Popup onCancel={props.onCancel} type="warning">
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
          <Translate name={props.desc ?? 'popup.warning.desc'} />
        </h3>
      </div>
      <div className="buttons">
        <button className="no" onClick={props.onCancel}>
          <p>
            <Translate name={props.noText} />
          </p>
        </button>
        <button className="yes" onClick={props.onSubmit}>
          <p>
            <Translate name={props.yesText} />
          </p>
        </button>
      </div>
    </Popup>
  );
}
