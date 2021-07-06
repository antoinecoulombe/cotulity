import React from 'react';
import Translate from './translate';

interface TooltipProps {
  children: string;
  hovered: boolean;
}

export default function Tooltip(props: TooltipProps) {
  return (
    <>
      {!props.hovered && (
        <div className="tooltip">
          <p>
            <Translate name={props.children}></Translate>
          </p>
        </div>
      )}
    </>
  );
}
