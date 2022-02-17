import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router';
import { Home } from '../../views/apps/homes';
import { useOutsideAlerter } from '../utils/outsideClick';
import IconToolTip from '../global/iconTooltip';

interface HomesDropdownProps {
  homes: Home[];
  onChange: (home: Home[]) => void;
}

const HomesDropdown = (props: HomesDropdownProps): JSX.Element => {
  const [active, setActive] = useState<boolean>(false);
  const history = useHistory();

  const handleClick = (): void => {
    if (props.homes.length > 1) setActive(!active);
  };

  const handleChange = (event: any): void => {
    const clickedIndex = props.homes.findIndex(
      (home) => home.refNumber === event.target.id
    );
    const newHomes = [props.homes[clickedIndex]]
      .concat(props.homes.slice(0, clickedIndex))
      .concat(props.homes.slice(clickedIndex + 1));

    props.onChange(newHomes);
    setActive(false);
  };

  const iconWidth = 32;

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setActive(false));

  return !props.homes || !props.homes.length ? (
    <></>
  ) : (
    <>
      <div
        ref={wrapperRef}
        className={`homes-dropdown-container ${active ? 'active' : ''}`}
      >
        <div className="homes selected">
          <div className={`home ${props.homes.length <= 1 ? 'alone' : ''}`}>
            <h1 onClick={handleClick}>
              {props.homes[0].UserHome.nickname ?? props.homes[0].name}
            </h1>
            {props.homes.length > 1 && (
              <>
                <FontAwesomeIcon
                  icon={active ? 'chevron-up' : 'chevron-down'}
                  className="chevron"
                  onClick={handleClick}
                />
                {active && (
                  <IconToolTip
                    icon="plus-circle"
                    onClick={() => history.push('/apps/homes/new')}
                    style={{
                      iconWidth: iconWidth,
                      tooltipMultiplier: 8,
                      marginRight: iconWidth,
                    }}
                  >
                    homes.tooltip.add
                  </IconToolTip>
                )}
              </>
            )}
          </div>
        </div>
        {active && (
          <div className="homes list">
            {props.homes.length > 1 &&
              props.homes.slice(1).map((home) => (
                <div
                  className="home"
                  id={`${home.refNumber}`}
                  key={home.id}
                  onClick={handleChange}
                >
                  <h1>{home.UserHome.nickname ?? home.name}</h1>
                  <FontAwesomeIcon
                    icon="arrow-alt-circle-right"
                    className="icon"
                  />
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="homes-dropdown-blocker"></div>
    </>
  );
};

export default HomesDropdown;
