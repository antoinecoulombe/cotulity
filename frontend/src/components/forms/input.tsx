import React from 'react';
import $ from 'jquery';
import Translate from '../utils/translate';

interface InputProps {
  name: string;
  type: 'text' | 'password' | 'phone' | 'email' | 'password';
  value?: string;
  label?: string;
  classes?: Array<string>;
  onChange: (e: any) => void;
}

class Input extends React.Component<InputProps> {
  constructor(props: InputProps) {
    super(props);
  }

  handleChange(event: any) {
    this.props.onChange(event);
  }

  render() {
    return (
      <div
        className={
          'form-input ' + this.props.classes?.toString().replace(',', ' ')
        }
      >
        <input
          id={this.props.name}
          name={this.props.name}
          type={this.props.type}
          value={this.props.value}
          onBlur={(e) => {
            if (e.target.value.length == 0) {
              $(e.target).removeClass('filled');
              $(e.target).next().removeClass('filled');
            } else {
              $(e.target).addClass('filled');
              $(e.target).next().addClass('filled');
            }
          }}
          onChange={this.handleChange.bind(this)}
        ></input>
        <label htmlFor={this.props.name}>
          <Translate name={`form.${this.props.label ?? this.props.name}`} />
        </label>
      </div>
    );
  }
}

export default Input;
