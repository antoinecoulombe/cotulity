interface ToggleTabProps {
  children: JSX.Element;
  id: string;
  active?: boolean;
}

const ToggleTab = (props: ToggleTabProps): JSX.Element => {
  return props.active ? props.children : <></>;
};

export default ToggleTab;
