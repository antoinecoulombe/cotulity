import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Translate from '../utils/translate';
import $ from 'jquery';

interface InputProps {
  name: string;
  type: 'text' | 'password' | 'phone' | 'email';
  value: string;
  error?: boolean;
  label?: string;
  className?: string;
  before?: JSX.Element;
  after?: JSX.Element;
  filled?: boolean;
  onChange: (e: any) => void;
  onKeyPress?: (e: any) => void;
  onClick?: (e: any) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

export default function Input(props: InputProps) {
  function handleBlur(event: any) {
    if (!props.filled && event.target.value.length == 0) {
      $(event.target).removeClass('filled');
      $(event.target).next().removeClass('filled');
    } else {
      $(event.target).addClass('filled');
      $(event.target).next().addClass('filled');
    }

    props.onBlur?.(event);
  }

  return (
    <div
      className={`form-input ${props.className ?? ''} ${
        props.error ? 'error' : ''
      }`}
    >
      {props.before}
      <input
        id={props.name}
        name={props.name}
        type={props.type}
        value={props.value}
        onBlur={handleBlur}
        onChange={props.onChange}
        onKeyPress={props.onKeyPress}
        onClick={props.onClick}
        onFocus={props.onFocus}
        className={props.filled ? 'filled' : ''}
      ></input>
      <label htmlFor={props.name} className={props.filled ? 'filled' : ''}>
        <Translate name={`${props.label ?? props.name}`} />{' '}
        {props.error && <FontAwesomeIcon icon="times-circle" />}
      </label>
      {props.after}
    </div>
  );
}
