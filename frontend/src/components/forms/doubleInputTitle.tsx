import { useState } from 'react';
import Input from './input';
import Title from './title';

export interface DoubleInputFormProps {
  name: Array<string>;
  title: string;
  type?: 'text' | 'password' | 'phone' | 'email';
  label?: string;
  children?: string;
  error?: boolean;
  required?: boolean;
  className?: string;
  values?: {
    first?: string;
    second?: string;
  };
  onlyNumbers?: boolean;
  onlyPositives?: boolean;
  onChange: (e: any, input: number) => boolean;
}

interface Inputs {
  first: string;
  second: string;
}

const DoubleInputForm = (props: DoubleInputFormProps): JSX.Element => {
  const [values, setValues] = useState<Inputs>({
    first: props.values?.first ?? '',
    second: props.values?.second ?? '',
  });

  const cancelChange = (e: any): boolean => {
    if (!props.onlyNumbers || !e.target.value.length) return false;
    if (props.onlyNumbers === true) {
      if (isNaN(e.target.value)) return true;
      if (props.onlyPositives === true && e.target.value <= 0) return true;
    }
    if ((e.target.value.match(/\./g) || []).length) return true;
    return false;
  };

  const onChange = (e: any, input: number): void => {
    if (cancelChange(e)) return;

    if (props.onChange === undefined || props.onChange(e, input)) {
      if (input === 1) setValues({ ...values, first: e.target.value });
      if (input === 2) setValues({ ...values, second: e.target.value });
    }
  };

  return (
    <div className={`si-form double r-offset ${props.className ?? ''}`}>
      <Title help={props.children} required={props.required}>
        {props.title}
      </Title>
      <div className="input-container">
        <Input
          name={props.name[0]}
          label={props.label}
          type={props.type ?? 'text'}
          value={values.first}
          error={props.error}
          onChange={(e: any) => onChange(e, 1)}
          filled={(props.values?.first?.length ?? 0) > 0}
        ></Input>
        <Input
          name={props.name[1]}
          label={props.label}
          type={props.type ?? 'text'}
          value={values.second}
          error={props.error}
          onChange={(e: any) => onChange(e, 2)}
          filled={(props.values?.second?.length ?? 0) > 0}
        ></Input>
      </div>
    </div>
  );
};

export default DoubleInputForm;
