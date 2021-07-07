import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '../utils/tooltip';
import { useHistory } from 'react-router';
import IconToolTip from '../utils/iconTooltip';

export interface UserHome {
  id: number;
  refNumber: number;
  name: string;
  UserHome: { nickname: string };
}

interface HomesDropdownProps {
  homes: UserHome[];
  onChange: (home: UserHome[]) => void;
}

export default function HomesDropdown(props: HomesDropdownProps) {
  const [active, setActive] = useState<boolean>(false);
  const history = useHistory();

  function handleClick() {
    if (props.homes.length > 1) setActive(!active);
  }

  function handleChange(event: any) {
    const clickedIndex = props.homes.findIndex(
      (home) => home.refNumber == event.target.id
    );
    const newHomes = [props.homes[clickedIndex]]
      .concat(props.homes.slice(0, clickedIndex))
      .concat(props.homes.slice(clickedIndex + 1));

    props.onChange(newHomes);
    setActive(false);
  }

  const iconWidth = 32;

  if (!props.homes || props.homes.length === 0) return <></>;
  else
    return (
      <div className={`homes-dropdown-container ${active ? 'active' : ''}`}>
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
                ></FontAwesomeIcon>
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
                    homes.joinOrCreate
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
                  ></FontAwesomeIcon>
                </div>
              ))}
          </div>
        )}
      </div>
    );
}
