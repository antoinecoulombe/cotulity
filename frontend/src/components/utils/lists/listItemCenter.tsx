interface ListItemCenterProps {
  children: any;
  className?: string;
  style?: object;
}

export default function ListItemCenter(props: ListItemCenterProps) {
  return (
    <div
      className={`list-item-center ${props.className ?? ''}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
}
