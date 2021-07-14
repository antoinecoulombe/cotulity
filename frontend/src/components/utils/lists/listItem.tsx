import React from 'react';

interface ListItemProps {
  children: object;
  uid: number;
  className?: string;
}

export default function ListItem(props: ListItemProps) {
  return (
    <div className={`list-item ${props.className ?? ''}`} data-uid={props.uid}>
      {props.children}
    </div>
  );
}
