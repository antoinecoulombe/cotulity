import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import Translate from '../utils/translate';
import '../../assets/css/open-app.css';

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
  async function switchSidebarTab(id: number) {
    if (!props.tabs || props.tabs.length == 0) return [];
    let newTabs = [...props.tabs];
    newTabs[props.tabs.findIndex((t) => t.selected == true)].selected = false;
    newTabs[props.tabs.findIndex((t) => t.id == id)].selected = true;
    return newTabs;
  }

  async function handleClick(id: number) {
    let tabs = await switchSidebarTab(id);
    props.tabs.find((t) => t.id == id)?.action(tabs);
  }

  return (
    <div className="sidebar">
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
                    t.img == 'star' ? 'far' : 'fas',
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
      {props.tabs.filter((t) => t.isUser).length > 0 && (
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
