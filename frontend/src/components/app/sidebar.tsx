import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { useState } from 'react';
import Translate from '../utils/translate';
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
  handle: (tabs: SidebarTab[]) => void;
  action?: (...attr: any) => any;
}

interface SidebarProps {
  tabs: Array<SidebarTab>;
}

const Sidebar = (props: SidebarProps): JSX.Element => {
  const [hovered, setHovered] = useState<boolean>(false);

  const switchSidebarTab = async (id: number): Promise<SidebarTab[]> => {
    let newTabs = [...props.tabs];
    newTabs[props.tabs.findIndex((t) => t.selected)].selected = false;
    newTabs[props.tabs.findIndex((t) => t.id === id)].selected = true;
    return newTabs;
  };

  const handleClick = async (id: number): Promise<void> => {
    if (!props.tabs || !props.tabs.length) return;
    if (props.tabs.find((t) => t.selected && t.id === id)) return;
    let tabs = await switchSidebarTab(id);
    props.tabs.find((t) => t.id === id)?.handle(tabs);
  };

  return props.tabs ? (
    <div
      className={`${hovered ? 'hovered ' : ''}sidebar`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="tabs top">
        {props.tabs.filter((t) => !t.isUser).length ? (
          props.tabs
            .filter((t) => !t.isUser)
            .map((t) => (
              <div
                key={`tab-${t.id}`}
                className={`tab${t.selected ? ' selected' : ''}`}
                onClick={() => handleClick(t.id)}
              >
                <div className="left">
                  <FontAwesomeIcon
                    icon={['fas', (t.img ?? 'plus') as IconName]}
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
            ))
        ) : (
          <></>
        )}
      </div>
      {props.tabs.filter((t) => t.isUser).length ? (
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
                      src={`http://localhost:4000/images/public/${ut.img}`}
                      alt={`${ut.value[0]}${
                        ut.value[ut.value.length - 2]
                      }`.toUpperCase()}
                    />
                  ) : (
                    <FontAwesomeIcon icon="user-circle" />
                  )}
                  <h4>{ut.value}</h4>
                </div>
                {(ut.count ?? -1) >= 0 && (
                  <div className="right">
                    <div
                      className={`counter${
                        (ut.count ?? -1) == 0 ? ' done' : ''
                      }`}
                    >
                      <p>
                        {(ut.count ?? 0) > 9 ? (
                          '9+'
                        ) : ut.count === 0 ? (
                          <Translate
                            name={'countZero'}
                            prefix={'tasks.sidebar.'}
                          />
                        ) : (
                          ut.count
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
};

export default Sidebar;
