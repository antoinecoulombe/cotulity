interface ListItemCenterProps {
  children: any;
  className?: string;
  style?: object;
}

const ListItemCenter = (props: ListItemCenterProps): JSX.Element => {
  return (
    <div
      className={`list-item-center ${props.className ?? ''}`}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export default ListItemCenter;
