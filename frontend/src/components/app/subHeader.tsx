import Translate from '../utils/translate';
import '../../assets/css/app/subheader.css';

export interface SubHeaderTab {
  name: string;
  action: () => void;
  selected?: boolean;
}

export interface SubHeaderProps {
  tabs: SubHeaderTab[];
  tabHandler: (tabs: SubHeaderTab[]) => void;
  // orderBy?: { name: string; action: () => void }[];
  // filters?: { name: string; action: () => void }[];
}

const SubHeader = (props: SubHeaderProps): JSX.Element => {
  const switchSubHeaderTab = (selectedTab: string): SubHeaderTab[] => {
    let newTabs = [...props.tabs];
    try {
      newTabs[newTabs.findIndex((t) => t.selected)].selected = false;
      newTabs[newTabs.findIndex((t) => t.name === selectedTab)].selected = true;
    } catch (error) {
      newTabs = newTabs.map((nt) => {
        return { name: nt.name, action: nt.action, selected: false };
      });
      newTabs[0].selected = true;
    }
    props.tabHandler(newTabs);
    return newTabs;
  };

  return (
    <div className="sub-header">
      <div className="tabs">
        {props.tabs.map((t) => (
          <h3
            className={`link${t.selected ? ' selected' : ''}`}
            onClick={() => {
              switchSubHeaderTab(t.name);
              t.action();
            }}
            key={t.name}
          >
            <Translate name={t.name} prefix="subHeader."></Translate>
          </h3>
        ))}
      </div>
      {/* <div className="options">
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
      </div> */}
    </div>
  );
};

export default SubHeader;
