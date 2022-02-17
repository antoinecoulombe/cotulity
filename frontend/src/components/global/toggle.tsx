import Translate from '../utils/translate';
import ToggleTab from './toggleTab';

export interface Tab {
  name: string;
  prefix?: string;
  active?: boolean;
  body: JSX.Element;
}

interface ToggleProps {
  tabs: Array<Tab>;
  toggleTab(name: string): void;
}

const Toggle = (props: ToggleProps): JSX.Element => {
  return (
    <div className="toggle">
      <div className="tabs">
        {props.tabs.map((t) => (
          <h2
            key={`toggletitle-${t.name}`}
            id={`h2-${t.name}`}
            className={t.active ? 'active' : ''}
            onClick={() => props.toggleTab(t.name)}
          >
            <Translate name={t.name} prefix={t.prefix ?? ''}></Translate>
          </h2>
        ))}
      </div>
      {props.tabs.map((t) => (
        <ToggleTab
          key={`toggletab-${t.name}`}
          active={t.active ?? false}
          id={`tab-${t.name}`}
        >
          {t.body}
        </ToggleTab>
      ))}
    </div>
  );
};

export default Toggle;
