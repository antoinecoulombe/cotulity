import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { useOutsideAlerter } from '../utils/outsideClick';
import Input from './input';
import Title from './title';

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
  const selectedRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<DropdownOption[]>(
    props.options.filter((o) => o.selected)
  );
  const [unselected, setUnselected] = useState<DropdownOption[]>(
    props.options.filter((o) => !o.selected)
  );
  const [opened, setOpened] = useState<boolean>(false);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setOpened(false));


  useEffect(() => {
    if (selectedRef.current)
      selectedRef.current.scrollLeft = 15000;
  }, [selected]);

  function selectHandle(id:number, from: DropdownOption[], to: DropdownOption[], selected: boolean) {
    let f = [...from];
    let t = [...to];

    let i = from.findIndex((x) => x.id === id); 
    f.splice(i, 1);
    t.push(from[i]);
    t[t.length - 1].selected = selected;

    if (!selected)
      t.sort((a, b) => a.value.localeCompare(b.value));

    setSelected(selected ? t : f);
    setUnselected(selected ? f : t);
    props.onSelect?.(selected ? t : f);

    if (selected && !f.length)
      setOpened(false);
  }

  function unSelect(id: number) {
    selectHandle(id, selected, unselected, false);
  }

  function select(id: number) {
    selectHandle(id, unselected, selected, true);
  }

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
          name={props.name}
          label={props.label}
          type={'text'}
          value={''}
          error={props.error}
          onChange={() => {}}
          onFocus={() => setOpened(true)} 
          className={opened ? 'active' : ''}
          filled={selected.length > 0}
          before={
            <div className="dropdown-selected" ref={selectedRef}>
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
                        alt={`${us.value[0]}${us.value.split(' ')[1][0]}`.toUpperCase()}
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
