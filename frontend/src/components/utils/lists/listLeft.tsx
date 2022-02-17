interface ListItemLeftProps {
  children: any;
  className?: string;
  style?: object;
}

const ListItemLeft = (props: ListItemLeftProps): JSX.Element => {
  return (
    <div
      className={`list-item-left ${props.className ?? ''}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export default ListItemLeft;
