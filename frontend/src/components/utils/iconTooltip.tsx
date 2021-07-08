import React, { useState } from 'react';
import Tooltip from './tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

interface IconTooltipProps {
  icon: string;
  onClick?: (e: any) => void;
  children: string;
  style: {
    iconWidth: number;
    tooltipMultiplier: number;
    marginRight?: number;
  };
}

export default function IconToolTip(props: IconTooltipProps) {
  const [hovered, setHover] = useState<boolean>(false);

  return (
    <>
      <div
        className="icon-tooltip"
        style={{
          position: 'absolute',
          right: 0,
          width: props.style.iconWidth,
          height: props.style.iconWidth,
          marginRight: props.style.marginRight,
        }}
      >
        {hovered && (
          <Tooltip
            hovered={hovered}
            parentCentered={false}
            style={{
              position: 'absolute',
              width: props.style.iconWidth * props.style.tooltipMultiplier,
              bottom: props.style.iconWidth + 8,
              right:
                -(props.style.iconWidth * (props.style.tooltipMultiplier - 1)) /
                2,
            }}
          >
            {props.children}
          </Tooltip>
        )}

        <FontAwesomeIcon
          icon={['fas', props.icon as IconName]}
          className="icon"
          onClick={props.onClick}
          style={{
            width: props.style.iconWidth,
            height: props.style.iconWidth,
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        ></FontAwesomeIcon>
      </div>
    </>
  );
}
