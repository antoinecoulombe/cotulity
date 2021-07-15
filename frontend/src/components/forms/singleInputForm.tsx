import React, { useEffect, useState } from 'react';
import Input from './input';
import IconToolTip from '../global/iconTooltip';
import Translate from '../utils/translate';

export interface SingleInputFormProps {
  name: string;
  title: string;
  style: {
    iconWidth: number;
    tooltipMultiplier: number;
    marginRight?: number;
  };
  type?: 'text' | 'password' | 'phone' | 'email';
  label?: string;
  children?: string;
  error?: boolean;
  required?: boolean;
  className?: string;
  parent?: { value?: string; onChange: (e: any) => void };
  onSubmit?: (value: string) => void;
  onHelpClick?: (e: any) => void;
  onBack?: (e: any) => void;
}

export default function SingleInputForm(props: SingleInputFormProps) {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    setValue(value == '' ? props.parent?.value ?? '' : value);
  });

  function handleKeyPress(event: any) {
    if (event.key === 'Enter') props.onSubmit?.(value);
  }

  function onChange(event: any) {
    setValue(event.target.value);
    if (props.parent?.onChange) props.parent.onChange(event);
  }

  return (
    <div
      className={`si-form${
        !props.onBack && props.onSubmit != undefined ? ' offset' : ''
      } ${props.className ?? ''}${!props.onSubmit ? ' r-offset' : ''}`}
    >
      <div className="title">
        <h2>
          <Translate name={props.title}></Translate>
          {props.required ? <b className="input-required">*</b> : ''}
        </h2>
        {props.children && (
          <IconToolTip
            icon="question-circle"
            style={{ iconWidth: 23, tooltipMultiplier: 20 }}
            onClick={props.onHelpClick}
          >
            {props.children}
          </IconToolTip>
        )}
      </div>
      <div className="input-container">
        {props.onBack && (
          <IconToolTip
            icon="arrow-alt-circle-left"
            style={props.style}
            onClick={props.onBack}
          >
            nav.goBack
          </IconToolTip>
        )}
        <Input
          name={props.name}
          label={props.label}
          type={props.type ?? 'text'}
          value={props.parent?.value ?? value}
          error={props.error}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          filled={props.parent?.value != undefined}
        ></Input>
        {props.onSubmit && (
          <IconToolTip
            icon="arrow-alt-circle-right"
            style={props.style}
            onClick={() => {
              props.onSubmit?.(value);
            }}
          >
            nav.submit
          </IconToolTip>
        )}
      </div>
    </div>
  );
}
