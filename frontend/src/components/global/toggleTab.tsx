interface ToggleTabProps {
  children: JSX.Element;
  id: string;
  active?: boolean;
}

export default function ToggleTab(props: ToggleTabProps) {
  return props.active ? props.children : <></>;
}
