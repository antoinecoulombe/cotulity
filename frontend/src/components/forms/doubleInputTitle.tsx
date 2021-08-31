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
  onChange: (e: any, input: number) => boolean;
}

interface Inputs {
  first: string;
  second: string;
}

export default function DoubleInputForm(props: DoubleInputFormProps) {
  const [values, setValues] = useState<Inputs>({
    first: props.values?.first ?? '',
    second: props.values?.second ?? '',
  });

  function onChange(e: any, input: number) {
    if (props.onChange == undefined || props.onChange(e, input)) {
      if (input == 1) setValues({ ...values, first: e.target.value });
      if (input == 2) setValues({ ...values, second: e.target.value });
    }
  }

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
}
