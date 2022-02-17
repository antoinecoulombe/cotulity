import '../../../assets/css/utils/list.css';

interface ListProps {
  children: object;
  className?: string;
}

const List = (props: ListProps): JSX.Element => {
  return (
    <div className={`list ${props.className ?? ''}`}>{props.children}</div>
  );
};

export default List;
