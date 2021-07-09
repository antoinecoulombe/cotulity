import React from 'react';

interface ListItemProps {
  children: object;
  className?: string;
}

export default function ListItem(props: ListItemProps) {
  return (
    <div className={`list-item ${props.className ?? ''}`}>{props.children}</div>
  );
}
