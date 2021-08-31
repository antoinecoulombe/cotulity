interface ListItemRightProps {
  children: any;
  className?: string;
  style?: object;
}

export default function ListItemRight(props: ListItemRightProps) {
  return (
    <div
      className={`list-item-right ${props.className ?? ''}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
}
