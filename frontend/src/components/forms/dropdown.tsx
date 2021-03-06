import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { useOutsideAlerter } from '../utils/outsideClick';
import Input from './input';
import Title from './title';

export interface DropdownProps {
  name: string;
  title: string;
  options: DropdownOption[];
  label?: string;
  children?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maxOptions?: number;
  values?: {
    first?: string;
    second?: string;
  };
  onSelect: (selected: DropdownOption) => void;
}

export interface DropdownOption {
  id: number;
  value: string;
  altId?: string;
  img?: string;
  icon?: string;
  selected?: boolean;
}

const Dropdown = (props: DropdownProps): JSX.Element => {
  const [options, setOptions] = useState<DropdownOption[]>(props.options);
  const [opened, setOpened] = useState<boolean>(false);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setOpened(false));

  useEffect(() => {
    let newOptions = [...props.options];
    if (!newOptions.length) return;
    if (!newOptions.find((o) => o.selected)) {
      newOptions[0].selected = true;
      setOptions(newOptions);
      props.onSelect?.(newOptions[0]);
    }
  }, []);

  const selectHandle = (id: number): void => {
    let newOptions = [...options];
    newOptions.forEach((o) => (o.selected = false));

    let selected = newOptions.find((o) => o.id === id);
    if (!selected) newOptions[0].selected = true;
    else {
      selected.selected = true;
      props.onSelect?.(selected);
    }

    setOptions(newOptions);
    setOpened(false);
  };

  const getSelectedValue = () => {
    if (!options.length) return '';
    let selected = options.find((o) => o.selected);
    return !selected ? options[0].value : selected.value;
  };

  return (
    <div className={`si-form ${props.className ?? ''} r-offset`}>
      <Title help={props.children} required={props.required}>
        {props.title}
      </Title>
      <div
        ref={wrapperRef}
        id={`${props.name.substring(
          props.name.lastIndexOf('.') + 1
        )}-dropdown-selected`}
        className={`input-container dropdown${
          props.disabled ? ' disabled' : ''
        }`}
      >
        <Input
          name={getSelectedValue()}
          label={props.label}
          type={'text'}
          value={getSelectedValue()}
          error={props.error}
          onChange={() => {}}
          onClick={() => setOpened(options.length > 1 ? !opened : false)}
          className={opened ? 'active' : ''}
          filled={false}
          neverFocused={true}
          beforeImg={
            options.find((o) => o.selected)?.img ||
            options.find((o) => o.selected)?.icon ? (
              <>
                {options.find((o) => o.selected)?.img && (
                  <img
                    src={`http://localhost:4000/images/public/${
                      options.find((o) => o.selected)?.img
                    }`}
                    alt={`${options.find((o) => o.selected)?.value[0]}${
                      options.find((o) => o.selected)?.value.split(' ')[1][0]
                    }`.toUpperCase()}
                  />
                )}
                {options.find((o) => o.selected)?.icon && (
                  <FontAwesomeIcon
                    icon={[
                      'fas',
                      options.find((o) => o.selected)?.icon as IconName,
                    ]}
                    className="icon"
                  />
                )}
              </>
            ) : undefined
          }
          after={
            opened ? (
              <div
                className="dropdown-unselected"
                style={
                  props.maxOptions
                    ? {
                        maxHeight: props.maxOptions * 50,
                        overflowX: 'hidden',
                        overflowY: 'scroll',
                      }
                    : undefined
                }
              >
                {options
                  .filter((o) => !o.selected)
                  .map((us) => (
                    <div
                      key={`us-${us.id}`}
                      className={`option${
                        !us.img && !us.icon ? ' no-margin' : ''
                      }`}
                      onClick={() => selectHandle(us.id)}
                    >
                      {us.img && (
                        <img
                          src={`http://localhost:4000/images/public/${us.img}`}
                          alt={`${us.value[0]}${
                            us.value.split(' ')[1][0]
                          }`.toUpperCase()}
                        />
                      )}
                      {us.icon && (
                        <FontAwesomeIcon
                          icon={['fas', us.icon as IconName]}
                          className="icon"
                        />
                      )}
                      <p>{us.value}</p>
                    </div>
                  ))}
              </div>
            ) : undefined
          }
        ></Input>
      </div>
    </div>
  );
};

export default Dropdown;
