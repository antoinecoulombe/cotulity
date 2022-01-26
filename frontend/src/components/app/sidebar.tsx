import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { useEffect, useState } from 'react';
import Translate from '../utils/translate';
import $ from 'jquery';
import '../../assets/css/app/sidebar.css';

export interface SidebarTab {
  id: number;
  value: string;
  img?: string;
  prefix?: string;
  suffix?: string;
  isUser?: boolean;
  count?: number;
  selected?: boolean;
  action: (tabs: SidebarTab[]) => void;
}

interface SidebarProps {
  tabs: Array<SidebarTab>;
}

export default function Sidebar(props: SidebarProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  async function switchSidebarTab(id: number) {
    if (!props.tabs || !props.tabs.length) return [];
    let newTabs = [...props.tabs];
    newTabs[props.tabs.findIndex((t) => t.selected)].selected = false;
    newTabs[props.tabs.findIndex((t) => t.id === id)].selected = true;
    return newTabs;
  }

  async function handleClick(id: number) {
    let tabs = await switchSidebarTab(id);
    props.tabs.find((t) => t.id === id)?.action(tabs);
  }

  return (
    <div
      className={`${hovered ? 'hovered ' : ''}sidebar`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="tabs top">
        {props.tabs
          .filter((t) => !t.isUser)
          .map((t) => (
            <div
              key={`tab-${t.id}`}
              className={`tab${t.selected ? ' selected' : ''}`}
              onClick={() => handleClick(t.id)}
            >
              <div className="left">
                <FontAwesomeIcon
                  icon={[
                    t.img === 'star' ? 'far' : 'fas',
                    (t.img ?? 'plus') as IconName,
                  ]}
                  className="icon"
                />
                <h4>
                  <Translate
                    name={t.value}
                    prefix={t.prefix}
                    suffix={t.suffix}
                  />
                </h4>
              </div>
            </div>
          ))}
      </div>
      {props.tabs.filter((t) => t.isUser).length && (
        <div className="tabs bottom">
          {props.tabs
            .filter((t) => t.isUser)
            .map((ut) => (
              <div
                key={`utab-${ut.id}`}
                className={`tab user${ut.selected ? ' selected' : ''}`}
                onClick={() => handleClick(ut.id)}
              >
                <div className="left">
                  {ut.img ? (
                    <img
                      src={`http://localhost:3000/images/public/${ut.img}`}
                      alt={`${ut.value[0]}${
                        ut.value[ut.value.length - 2]
                      }`.toUpperCase()}
                    />
                  ) : (
                    <FontAwesomeIcon icon="user-circle" />
                  )}
                  <h4>{ut.value}</h4>
                </div>
                {(ut.count ?? 0) > 0 && (
                  <div className="right">
                    <div className="counter">
                      <p>{(ut.count ?? 0) > 9 ? '9+' : ut.count}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
