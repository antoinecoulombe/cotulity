import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import Tooltip from './tooltip';

interface IconTooltipProps {
  icon: string;
  style: {
    iconWidth: number;
    tooltipMultiplier: number;
    marginRight?: number;
  };
  children?: string;
  circled?: {
    value: boolean;
    multiplier: number;
    offsetX?: number;
    offsetY?: number;
  };
  error?: boolean;
  onClick?: (e: any) => void;
  className?: string;
}

const IconToolTip = (props: IconTooltipProps): JSX.Element => {
  const [hovered, setHover] = useState<boolean>(false);

  let iconSize = props.style.iconWidth;
  if (props.circled) iconSize *= props.circled.multiplier;

  let padding = props.circled ? (props.style.iconWidth - iconSize) / 2 : 0;

  const containerStyle: any = {
    position: 'absolute',
    right: 0,
    width: props.style.iconWidth,
    height: props.style.iconWidth,
    marginRight: props.style.marginRight,
  };

  const iconStyle: any = {
    width: iconSize,
    height: iconSize,
    paddingTop: padding + (props.circled?.offsetY ?? 0),
    paddingBottom: padding + (props.circled?.offsetY ?? 0),
    paddingLeft: padding + (props.circled?.offsetX ?? 0),
    paddingRight: padding + (props.circled?.offsetX ?? 0),
    cursor: props.onClick ? 'pointer' : 'default',
  };

  if (!props.children && props.error) {
    iconStyle.color = 'var(--itp-error-hover-bg-color)';
    iconStyle.opacity = 1;
    containerStyle.opacity = 1;
  }

  return (
    <>
      <div
        className={`icon-tooltip ${props.className ?? ''}${
          props.circled ? ' circled' : ''
        }${props.error ? ' error' : ''}`}
        style={containerStyle}
      >
        {props.children && (
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
          style={iconStyle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        />
      </div>
    </>
  );
};

export default IconToolTip;
