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
  beforeImg?: JSX.Element;
  after?: JSX.Element;
  filled?: boolean;
  neverFocused?: boolean;
  heightMultiplier?: number;
  onChange: (e: any) => void;
  onKeyPress?: (e: any) => void;
  onClick?: (e: any) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

const Input = (props: InputProps): JSX.Element => {
  const handleBlur = (event: any): void => {
    if (
      props.neverFocused === true ||
      (!props.filled && !event.target.value.length)
    ) {
      $(event.target).removeClass('filled');
      $(event.target).next().removeClass('filled');
    } else {
      $(event.target).addClass('filled');
      $(event.target).next().addClass('filled');
    }

    props.onBlur?.(event);
  };

  return (
    <div
      className={`form-input ${props.className ?? ''}${
        props.error ? ' error' : ''
      }${props.heightMultiplier ? `height-${props.heightMultiplier}x` : ''}`}
    >
      {props.before}
      {props.beforeImg && (
        <div className="input-before-img">{props.beforeImg}</div>
      )}
      {props.heightMultiplier ? (
        <textarea
          id={props.name}
          name={props.name}
          value={props.value}
          onBlur={handleBlur}
          onChange={props.onChange}
          onKeyPress={props.onKeyPress}
          onClick={props.onClick}
          onFocus={props.onFocus}
          className={`${
            props.neverFocused === true
              ? 'never-focused'
              : props.filled
              ? 'filled'
              : ''
          }${props.beforeImg ? ' with-image' : ''}`}
        ></textarea>
      ) : (
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
          className={`${
            props.neverFocused === true
              ? 'never-focused'
              : props.filled
              ? 'filled'
              : ''
          }${props.beforeImg ? ' with-image' : ''}`}
        ></input>
      )}

      <label
        htmlFor={props.name}
        className={
          props.neverFocused === true
            ? 'never-focused'
            : props.filled
            ? 'filled'
            : ''
        }
      >
        <Translate name={`${props.label ?? props.name}`} />{' '}
        {props.error && <FontAwesomeIcon icon="times-circle" />}
      </label>
      {props.after}
    </div>
  );
};

export default Input;
