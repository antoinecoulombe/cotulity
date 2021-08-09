import React, { useEffect, useState } from 'react';
import Input from './input';
import IconToolTip from '../global/iconTooltip';
import Translate from '../utils/translate';
import $ from 'jquery';
import Title from './title';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

export interface DropdownProps {
  name: string;
  title: string;
  options: Array<DropdownOption>;
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
  onSelect: (selected: Array<DropdownOption>) => void;
}

export interface DropdownOption {
  id: number;
  value: string;
  img?: string;
  icon?: string;
  selected?: boolean;
}

export default function Dropdown(props: DropdownProps) {
  const [selected, setSelected] = useState<DropdownOption[]>(
    props.options.filter((o) => o.selected)
  );
  const [unselected, setUnselected] = useState<DropdownOption[]>(
    props.options.filter((o) => !o.selected)
  );
  const [selectedCount, setSelectedCount] = useState<number>(selected.length);
  const [opened, setOpened] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCount < selected.length)
      $(
        `#${props.name.substring(
          props.name.lastIndexOf('.') + 1
        )}-dropdown-selected .dropdown-selected`
      ).scrollLeft(15000);
    setSelectedCount(selected.length);
  }, [selected]);

  function openOrClose() {
    if (unselected.length == 0) setOpened(false);
    else setOpened(!opened);
  }

  function unSelect(id: number) {
    let s = [...selected];
    let us = [...unselected];
    let i = selected.findIndex((x) => x.id == id);
    s.splice(i, 1);
    us.push(selected[i]);
    us[us.length - 1].selected = false;
    us.sort((a, b) => a.value.localeCompare(b.value));
    setSelected(s);
    setUnselected(us);
    props.onSelect?.(s);
  }

  function select(id: number) {
    let s = [...selected];
    let us = [...unselected];
    let i = unselected.findIndex((x) => x.id == id);
    us.splice(i, 1);
    s.push(unselected[i]);
    s[s.length - 1].selected = true;
    setSelected(s);
    setUnselected(us);
    props.onSelect?.(s);

    if (us.length == 0) setOpened(false);
  }

  return (
    <div className={`si-form ${props.className ?? ''} r-offset `}>
      <Title help={props.children} required={props.required}>
        {props.title}
      </Title>
      <div
        id={`${props.name.substring(
          props.name.lastIndexOf('.') + 1
        )}-dropdown-selected`}
        className={`input-container dropdown${
          props.disabled ? ' disabled' : ''
        }`}
      >
        <Input
          name={props.name}
          label={props.label}
          type={'text'}
          value={''}
          error={props.error}
          onChange={() => {}}
          onClick={openOrClose}
          className={opened ? 'active' : ''}
          filled={selected.length > 0}
          before={
            <div className="dropdown-selected">
              {selected.map((s) => (
                <div key={`s-${s.id}`} className="option">
                  <p>
                    {props.onSelectTransform
                      ? props.onSelectTransform(s.value)
                      : s.value}
                  </p>
                  <FontAwesomeIcon
                    icon="times-circle"
                    onClick={() => unSelect(s.id)}
                    className="icon"
                  />
                </div>
              ))}
            </div>
          }
          after={
            opened ? (
              <div className="dropdown-unselected">
                {unselected.map((us) => (
                  <div
                    key={`us-${us.id}`}
                    className="option"
                    onClick={() => select(us.id)}
                  >
                    {us.img && (
                      <img
                        src={`http://localhost:3000/images/public/${us.img}`}
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
}
