import React from 'react';

interface ListItemLeftProps {
  children: any;
  className?: string;
  style?: object;
}

export default function ListItemLeft(props: ListItemLeftProps) {
  return (
    <div
      className={`list-item-left ${props.className ?? ''}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
}
