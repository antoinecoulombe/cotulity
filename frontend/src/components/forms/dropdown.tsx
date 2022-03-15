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
  values?: {
    first?: string;
    second?: string;
  };
  onSelectTransform?: (value: string) => string;
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
    if (!newOptions.find((o) => o.selected)) {
      newOptions[0].selected = true;
      setOptions(newOptions);
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
  };

  const getSelectedValue = () => {
    let selected = options.find((o) => o.selected);
    return !selected ? options[0].value : selected.value;
  };

  return (
    <div className={`si-form ${props.className ?? ''} r-offset `}>
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
          onFocus={() => setOpened(true)}
          className={opened ? 'active' : ''}
          filled={false}
          neverFocused={true}
          after={
            opened ? (
              <div className="dropdown-unselected">
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
