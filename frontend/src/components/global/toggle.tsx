import React, { useEffect, useState } from 'react';
import Translate from '../utils/translate';
import ToggleTab from './toggleTab';

interface tabs {
  name: string;
  prefix?: string;
  active?: boolean;
  body: JSX.Element;
}

interface ToggleProps {
  tabs: Array<tabs>;
}

export default function Toggle(props: ToggleProps) {
  const [tabs, setTabs] = useState<tabs[]>([]);

  useEffect(() => {
    setTabs(props.tabs);
  }, []);

  function toggleTab(name: string) {
    console.log(name);
    let tabsCopy = tabs.slice();
    tabsCopy.forEach((t) => (t.active = false));
    tabsCopy[tabsCopy.findIndex((t) => t.name == name)].active = true;
    setTabs(tabsCopy);
  }

  return (
    <div className="toggle">
      <div className="tabs">
        {tabs.map((t) => (
          <h2
            key={t.name}
            className={t.active ? 'active' : ''}
            onClick={() => toggleTab(t.name)}
          >
            <Translate name={t.name} prefix={t.prefix ?? ''}></Translate>
          </h2>
        ))}
      </div>
      {tabs.map((t) => (
        <ToggleTab
          key={t.name}
          active={t.active ?? false}
          id={`tabs-${t.name}`}
        >
          {t.body}
        </ToggleTab>
      ))}
    </div>
  );
}
