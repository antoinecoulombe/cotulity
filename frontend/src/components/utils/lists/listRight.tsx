interface ListItemRightProps {
  children: any;
  className?: string;
  style?: object;
}

const ListItemRight = (props: ListItemRightProps): JSX.Element => {
  return (
    <div
      className={`list-item-right ${props.className ?? ''}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export default ListItemRight;
