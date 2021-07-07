import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import Translate from './translate';

interface TooltipProps {
  children: string;
  hovered: boolean;
  over?: boolean;
  parentCentered?: boolean;
  style?: object;
}

export default function Tooltip(props: TooltipProps) {
  return (
    <>
      {props.hovered && (
        <div
          className={`tooltip-container  ${
            props.parentCentered === true || props.parentCentered === undefined
              ? 'parent-centered'
              : ''
          }`}
          style={props.style ?? {}}
        >
          <div className={`tooltip ${props.over ? 'over' : ''}`}>
            <p>
              <Translate name={props.children}></Translate>
            </p>
            <div className="triangle"></div>
          </div>
        </div>
      )}
    </>
  );
}
