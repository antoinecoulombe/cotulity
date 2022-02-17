interface ListItemProps {
  children: object;
  uid: number;
  className?: string;
}

const ListItem = (props: ListItemProps): JSX.Element => {
  return (
    <div className={`list-item ${props.className ?? ''}`} data-uid={props.uid}>
      {props.children}
    </div>
  );
};

export default ListItem;
