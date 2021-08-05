import React from 'react';
import Translate from '../utils/translate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import '../../assets/css/open-app.css';

export interface SidebarProps {
  tabs: Array<{
    icon: string;
    name: string;
    action: () => void;
    prefix?: string;
    selected?: boolean;
  }>;
  userTabs: Array<{
    user: {
      id: number;
      firstname: string;
      lastname: string;
      Image?: { url: string };
      taskCount: number;
    };
    action: () => void;
    selected?: boolean;
  }>;
}

export function switchSidebarTab(sidebar: SidebarProps, selected: string) {
  let newTabs = [...sidebar.tabs];
  newTabs[sidebar.tabs.findIndex((t) => t.selected == true)].selected = false;
  newTabs[sidebar.tabs.findIndex((t) => t.name == selected)].selected = true;
  return newTabs;
}

export function switchSidebarUserTab(sidebar: SidebarProps, id: number) {
  let newTabs = [...sidebar.userTabs];
  newTabs[sidebar.userTabs.findIndex((t) => t.selected == true)].selected =
    false;
  newTabs[sidebar.userTabs.findIndex((t) => t.user.id == id)].selected = true;
  return newTabs;
}

export default function Sidebar(props: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="tabs top">
        {props.tabs.map((t) => (
          <div
            key={`tab-${t.name}`}
            className={`tab${t.selected ? ' selected' : ''}`}
            onClick={t.action}
          >
            <div className="left">
              <FontAwesomeIcon
                icon={[t.icon == 'star' ? 'far' : 'fas', t.icon as IconName]}
                className="icon"
              />
              <h3>
                <Translate name={`${t.prefix ?? ''}${t.name}`} />
              </h3>
            </div>
          </div>
        ))}
      </div>
      {props.userTabs.length > 0 && (
        <div className="tabs bottom">
          {props.userTabs.map((ut) => (
            <div
              key={ut.user.id}
              className={`tab user${ut.selected ? ' selected' : ''}`}
            >
              <div className="left">
                {ut.user.Image?.url ? (
                  <img
                    src={`http://localhost:3000/images/public/${ut.user.Image.url}`}
                  />
                ) : (
                  <FontAwesomeIcon icon="user-circle" />
                )}
                <h3>{`${
                  ut.user.firstname.length > 9
                    ? ut.user.firstname.substring(0, 9) + '...'
                    : ut.user.firstname
                } ${ut.user.lastname[0].toUpperCase()}.`}</h3>
              </div>
              {ut.user.taskCount > 0 && (
                <div className="right">
                  <div className="counter">
                    <p>{ut.user.taskCount > 9 ? '9+' : ut.user.taskCount}</p>
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
