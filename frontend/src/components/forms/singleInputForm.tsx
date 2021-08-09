import React, { useEffect, useState } from 'react';
import Input from './input';
import IconToolTip from '../global/iconTooltip';
import Translate from '../utils/translate';
import Title from './title';

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
  value?: string;
  error?: boolean;
  required?: boolean;
  className?: string;
  parent?: { onChange: (e: any) => void };
  onSubmit?: (value: string) => void;
  onHelpClick?: (e: any) => void;
  onBack?: (e: any) => void;
}

export default function SingleInputForm(props: SingleInputFormProps) {
  const [value, setValue] = useState<string>(props.value ?? '');

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
      <Title help={props.children} required={props.required}>
        {props.title}
      </Title>
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
          value={props.value ?? value}
          error={props.error}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          filled={(props.value?.length ?? 0) > 0}
        ></Input>
        {props.onSubmit && (
          <IconToolTip
            icon="arrow-alt-circle-right"
            style={props.style}
            onClick={() => {
              props.onSubmit?.(value);
            }}
            className="submit"
          >
            nav.submit
          </IconToolTip>
        )}
      </div>
    </div>
  );
}
