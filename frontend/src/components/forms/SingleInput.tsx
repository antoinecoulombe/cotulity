import React from 'react';
import Input from './input';
import IconToolTip from '../utils/iconTooltip';
import Translate from '../utils/translate';

interface SingleInputProps {
  name: string;
  type: 'text' | 'password' | 'phone' | 'email';
  title: string;
  value: string;
  children?: string;
  error?: boolean;
  label?: string;
  classes?: Array<string>;
  style: {
    iconWidth: number;
    tooltipMultiplier: number;
    marginRight?: number;
  };
  onChange: (e: any) => void;
  onKeyPress?: (e: any) => void;
  onHelpClick?: (e: any) => void;
}

export default function SingleInput(props: SingleInputProps) {
  return (
    <div className="input-container">
      <h2>
        <Translate name={props.title}></Translate>
      </h2>
      {props.children && (
        <IconToolTip
          icon="question-circle"
          style={props.style}
          onClick={props.onHelpClick}
        >
          {props.children}
        </IconToolTip>
      )}
      <Input
        name={props.name}
        label={props.label}
        type={props.type}
        value={props.value}
        error={props.error}
        classes={props.classes}
        onChange={props.onChange}
        onKeyPress={props.onKeyPress}
      ></Input>
    </div>
  );
}
