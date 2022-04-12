import { useState } from 'react';

interface ListItemProps {
  children: object;
  uid?: number;
  className?: string;
  onClick?: JSX.Element[];
}

const ListItem = (props: ListItemProps): JSX.Element => {
  const [clicked, setClicked] = useState<boolean>(false);
  return (
    <>
      <div
        className={`list-item ${props.className ?? ''}${
          clicked ? ' clicked' : ''
        }`}
        data-uid={props.uid}
        onClick={props.onClick ? () => setClicked(!clicked) : undefined}
        style={{ cursor: props.onClick ? 'pointer' : 'auto' }}
      >
        {props.children}
        {props.onClick && clicked ? (
          <div className="list-item-click">{props.onClick}</div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default ListItem;
