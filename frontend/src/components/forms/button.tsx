import React from 'react';

interface ButtonProps {
  className?: string;
}

export default function Button(props: ButtonProps) {
  return (
    <div className={props.className ?? ''}>
      <button>Change theme</button>
    </div>
  );
}
