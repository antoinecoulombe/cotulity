import React from 'react';

interface OneDropdownProps {
  className?: string;
}

export default function OneDropdown(props: OneDropdownProps) {
  return <div className={props.className ?? ''}>one selection drop down</div>;
}
