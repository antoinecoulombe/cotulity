import React from 'react';
import $ from 'jquery';
import Translate from '../utils/translate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface InputProps {
  name: string;
  type: 'text' | 'password' | 'phone' | 'email';
  value: string;
  error?: boolean;
  label?: string;
  className?: string;
  onChange: (e: any) => void;
  onKeyPress?: (e: any) => void;
}

function handleBlur(event: any) {
  if (event.target.value.length == 0) {
    $(event.target).removeClass('filled');
    $(event.target).next().removeClass('filled');
  } else {
    $(event.target).addClass('filled');
    $(event.target).next().addClass('filled');
  }
}

export function resetClass(event: any) {
  handleBlur(event);
}

class Input extends React.Component<InputProps> {
  constructor(props: InputProps) {
    super(props);
  }

  handleChange(event: any) {
    this.props.onChange(event);
  }

  handleKeyPress(event: any) {
    this.props.onKeyPress?.(event);
  }

  render() {
    return (
      <div
        className={`form-input ${this.props.className} ${
          this.props.error ? 'error' : ''
        }`}
      >
        <input
          id={this.props.name}
          name={this.props.name}
          type={this.props.type}
          value={this.props.value}
          onBlur={handleBlur}
          onChange={this.props.onChange}
          onKeyPress={this.props.onKeyPress}
        ></input>
        <label htmlFor={this.props.name}>
          <Translate name={`${this.props.label ?? this.props.name}`} />{' '}
          {this.props.error && (
            <FontAwesomeIcon icon="times-circle"></FontAwesomeIcon>
          )}
        </label>
      </div>
    );
  }
}

export default Input;
