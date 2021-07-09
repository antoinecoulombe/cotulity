import React, { useState } from 'react';
import Tooltip from './tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

interface IconTooltipProps {
  icon: string;
  children: string;
  style: {
    iconWidth: number;
    tooltipMultiplier: number;
    marginRight?: number;
  };
  circled?: { value: boolean; multiplier: number; offset?: number };
  error?: boolean;
  onClick?: (e: any) => void;
  className?: string;
}

export default function IconToolTip(props: IconTooltipProps) {
  const [hovered, setHover] = useState<boolean>(false);

  let iconSize = props.style.iconWidth;
  if (props.circled) iconSize *= props.circled.multiplier;

  let padding = props.circled ? (props.style.iconWidth - iconSize) / 2 : 0;

  return (
    <>
      <div
        className={`icon-tooltip ${props.className ?? ''}${
          props.circled ? ' circled' : ''
        }${props.error ? ' error' : ''}`}
        style={{
          position: 'absolute',
          right: 0,
          width: props.style.iconWidth,
          height: props.style.iconWidth,
          marginRight: props.style.marginRight,
        }}
      >
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

        <FontAwesomeIcon
          icon={['fas', props.icon as IconName]}
          className="icon"
          onClick={props.onClick}
          style={{
            width: iconSize,
            height: iconSize,
            paddingTop: padding,
            paddingBottom: padding,
            paddingLeft: padding + (props.circled?.offset ?? 0),
            paddingRight: padding - (props.circled?.offset ?? 0),
            cursor: props.onClick ? 'pointer' : 'default',
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        ></FontAwesomeIcon>
      </div>
    </>
  );
}
