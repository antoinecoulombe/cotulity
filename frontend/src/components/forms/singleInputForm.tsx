import { useState } from 'react';
import Input from './input';
import IconToolTip from '../global/iconTooltip';
import Title from './title';

export interface SingleInputFormProps {
  name: string;
  title?: string;
  iconStyle: {
    iconWidth: number;
    tooltipMultiplier: number;
    marginRight?: number;
    marginTop?: number;
  };
  popupStyle?: {
    minWidth: number;
    width: string;
  };
  type?: 'text' | 'password' | 'phone' | 'email';
  label?: string;
  children?: string;
  value?: string;
  error?: boolean;
  required?: boolean;
  className?: string;
  onlyNumbers?: boolean;
  parent?: { onChange: (e: any) => void };
  errorCheck?: (input: string) => boolean;
  onSubmit?: (value: string) => void;
  onHelpClick?: (e: any) => void;
  onBack?: (e: any) => void;
}

const SingleInputForm = (props: SingleInputFormProps): JSX.Element => {
  const [value, setValue] = useState<string>(props.value ?? '');
  const [error, setError] = useState<boolean>(false);

  const handleKeyPress = (event: any): void => {
    if (event.key === 'Enter' && !hasErrors()) props.onSubmit?.(value);
  };

  const cancelChange = (e: any): boolean => {
    if (!props.onlyNumbers || !e.target.value.length) return false;
    if (props.onlyNumbers === true && isNaN(e.target.value)) return true;
    if ((e.target.value.match(/\./g) || []).length > 1) return true;
    return false;
  };

  const onChange = (e: any): void => {
    if (cancelChange(e)) return;

    setValue(e.target.value);
    if (props.parent?.onChange) props.parent.onChange(e);
  };

  const hasErrors = () => {
    if (!props.errorCheck) return false;

    if (props.errorCheck(value)) {
      setError(true);
      return true;
    }

    if (error) setError(false);
    return false;
  };

  return (
    <div
      className={`si-form${
        !props.onBack && props.onSubmit !== undefined ? ' offset' : ''
      } ${props.className ?? ''}${!props.onSubmit ? ' r-offset' : ''}`}
    >
      {props.title && (
        <Title help={props.children} required={props.required}>
          {props.title}
        </Title>
      )}
      <div className="input-container">
        {props.onBack && (
          <IconToolTip
            icon="arrow-alt-circle-left"
            style={props.iconStyle}
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
          error={props.error || error}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          filled={(props.value?.length ?? 0) > 0}
        ></Input>
        {props.onSubmit && (
          <IconToolTip
            icon="arrow-alt-circle-right"
            style={props.iconStyle}
            onClick={() => {
              if (!hasErrors()) props.onSubmit?.(value);
            }}
            className="submit"
          >
            nav.submit
          </IconToolTip>
        )}
      </div>
    </div>
  );
};

export default SingleInputForm;
