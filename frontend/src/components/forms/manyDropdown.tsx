import React from 'react';

interface ManyDropdownProps {
  className?: string;
}

export default function ManyDropdown(props: ManyDropdownProps) {
  return <div className={props.className ?? ''}>many selections drop down</div>;
}
