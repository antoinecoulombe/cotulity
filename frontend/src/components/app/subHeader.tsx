import Translate from '../utils/translate';

export interface SubHeaderProps {
  tabs: Array<{ name: string; action: () => void; selected?: boolean }>;
  orderBy?: Array<{ name: string; action: () => void }>;
  filters?: Array<{ name: string; action: () => void }>;
}

export function switchSubHeaderTab(
  subHeader: SubHeaderProps,
  selected: string
) {
  let newTabs = [...subHeader.tabs];
  newTabs[subHeader.tabs.findIndex((t) => t.selected)].selected = false;
  newTabs[subHeader.tabs.findIndex((t) => t.name === selected)].selected = true;
  return newTabs;
}

export default function SubHeader(props: SubHeaderProps) {
  return (
    <div className="sub-header">
      <div className="tabs">
        {props.tabs.map((t) => (
          <h3
            className={`link${t.selected ? ' selected' : ''}`}
            onClick={t.action}
            key={t.name}
          >
            <Translate name={t.name} prefix="subHeader."></Translate>
          </h3>
        ))}
      </div>

      <div className="options">
        {props.orderBy && (
          <h2>
            <Translate name="orderBy" prefix="subHeader."></Translate>
          </h2>
        )}
        {props.filters && (
          <h2>
            <Translate name="filters" prefix="subHeader."></Translate>
          </h2>
        )}
      </div>
    </div>
  );
}
