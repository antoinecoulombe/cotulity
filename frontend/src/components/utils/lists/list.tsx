import React from 'react';

interface ListProps {
  children: object;
  className?: string;
}

export default function List(props: ListProps) {
  return (
    <div className={`list ${props.className ?? ''}`}>{props.children}</div>
  );
}
