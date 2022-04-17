import IconToolTip from '../global/iconTooltip';
import Translate from '../utils/translate';

interface SetSafeDeleteProps {}

const SetSafeDelete = (props: SetSafeDeleteProps): JSX.Element => {
  const toggleSafeDelete = (): void => {
    localStorage.setItem(
      'safeDelete',
      localStorage.getItem('safeDelete') === 'true' ? 'false' : 'true'
    );
  };

  return (
    <div className="setting safe-delete">
      <div className="left">
        <h2>
          <Translate name="title" prefix="settings.safeDelete." />
        </h2>
        <IconToolTip
          icon="question-circle"
          style={{ iconWidth: 23, tooltipMultiplier: 20 }}
        >
          settings.safeDelete.tooltip
        </IconToolTip>
      </div>
      <div className="right">
        <div className="input-toggle">
          <div className="generic-input">
            <input
              id="theme-switch"
              type="checkbox"
              className="switch"
              disabled={true}
            />
            {/* {localStorage.getItem('safeDelete') === 'true' ? (
              <input
                id="theme-switch"
                type="checkbox"
                className="switch"
                defaultChecked
                onClick={toggleSafeDelete}
              />
            ) : (
              <input
                id="theme-switch"
                type="checkbox"
                className="switch"
                onClick={toggleSafeDelete}
              />
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetSafeDelete;
