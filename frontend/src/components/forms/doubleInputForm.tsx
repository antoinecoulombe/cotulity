import React, { useEffect, useState } from 'react';
import Input from './input';
import IconToolTip from '../global/iconTooltip';
import Translate from '../utils/translate';

export interface DoubleInputFormProps {
  name: Array<string>;
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
  squaredInputs?: boolean;
  required?: boolean;
  className?: string;
  parent?: {
    firstValue?: string;
    secondValue?: string;
    onChange: (e: any) => void;
  };
  onSubmit?: (firstValue: string, secondValue: string) => void;
  onHelpClick?: (e: any) => void;
  onBack?: (e: any) => void;
}

export default function DoubleInputForm(props: DoubleInputFormProps) {
  const [firstValue, setFirstValue] = useState<string>('');
  const [secondValue, setSecondValue] = useState<string>('');

  useEffect(() => {
    setFirstValue(
      firstValue == '' ? props.parent?.firstValue ?? '' : firstValue
    );
    setSecondValue(
      secondValue == '' ? props.parent?.secondValue ?? '' : secondValue
    );
  });

  function handleKeyPress(event: any) {
    // if (event.key === 'Enter') props.onSubmit?.(value);
  }

  function onChange(event: any) {
    // setValue(event.target.value);
    // if (props.parent?.onChange) props.parent.onChange(event);
  }

  return (
    <div
      className={`si-form double${props.squaredInputs ? ' squaredInputs' : ''}${
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
          name={props.name[0]}
          label={props.label}
          type={props.type ?? 'text'}
          value={props.parent?.firstValue ?? firstValue}
          error={props.error}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          filled={props.parent?.firstValue != undefined}
          className={props.squaredInputs ? ' squared' : ''}
        ></Input>
        <Input
          name={props.name[1]}
          label={props.label}
          type={props.type ?? 'text'}
          value={props.parent?.secondValue ?? secondValue}
          error={props.error}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          filled={props.parent?.secondValue != undefined}
          className={props.squaredInputs ? ' squared' : ''}
        ></Input>
        {props.onSubmit && (
          <IconToolTip
            icon="arrow-alt-circle-right"
            style={props.style}
            onClick={() => {
              props.onSubmit?.(firstValue, secondValue);
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
