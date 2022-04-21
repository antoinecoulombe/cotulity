import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  CalendarEventOccurence,
  CalendarHomeMember,
} from '../../views/apps/calendar';
import Popup from '../utils/popup';

interface EditPopupProps {
  users: CalendarHomeMember[];
  event: CalendarEventOccurence;
  onCancel?(...attr: any): any;
  onEdit?(...attr: any): any;
}

const ViewPopup = (props: EditPopupProps): JSX.Element => {
  const { t } = useTranslation('common');

  const getDateHTML = () => {
    let start = new Date(props.event.start);
    let end = new Date(props.event.end);

    const zeroPad = (number: number): string => {
      if (number < 10) return '0' + number;
      return number.toString();
    };

    return (
      <h3>
        <b>
          {t(`date.month.${start.toDateString().split(' ')[1].toLowerCase()}`)}{' '}
          {start.getDate()}
          {', '}
          {zeroPad(start.getHours())}:{zeroPad(start.getMinutes())}
        </b>{' '}
        {t('calendar.title.event.to')}{' '}
        <b>
          {start.getFullYear() === end.getFullYear() &&
          start.getMonth() === end.getMonth() &&
          start.getDate() === end.getDate()
            ? ''
            : t(
                `date.month.${end.toDateString().split(' ')[1].toLowerCase()}`
              ) +
              ' ' +
              end.getDate() +
              ', '}
          {zeroPad(end.getHours())}:{zeroPad(end.getMinutes())}
        </b>
      </h3>
    );
  };

  return (
    <Popup
      onCancel={() => props.onCancel?.()}
      type="custom"
      new={props.event === undefined}
      className="calendar-event-popup"
      noX={true}
    >
      <div className="info-event">
        <div className="title">
          <h2>{props.event.Event.name}</h2>
          <FontAwesomeIcon icon="pen" onClick={props.onEdit} />
        </div>
        <div className="img-text">
          <FontAwesomeIcon icon="calendar-day" />
          {getDateHTML()}
        </div>
        {props.event.location && (
          <div className="img-text">
            <FontAwesomeIcon icon="location-dot" />
            <h3>
              {t('calendar.title.event.at')} <b>{props.event.location}</b>
            </h3>
          </div>
        )}
        {props.event.Event.repeat !== 'none' && (
          <div className="img-text">
            <FontAwesomeIcon icon="repeat" />
            <h3>
              {localStorage.getItem('lang') === 'en'
                ? t('calendar.title.event.repeats') + ' '
                : ''}
              <b>{t('tasks.name.repeat.' + props.event.Event.repeat)}</b>{' '}
              {t('calendar.title.event.until').toLowerCase()}{' '}
              <b>
                {t(
                  `date.month.${new Date(props.event.Event.untilDate)
                    .toDateString()
                    .split(' ')[1]
                    .toLowerCase()}`
                )}{' '}
                {new Date(props.event.Event.untilDate).getDate()}
              </b>
            </h3>
          </div>
        )}
        {props.event.Users && (
          <div className="participants">
            <h3>
              <b>{t('calendar.title.event.users')}</b>
            </h3>
            <div className="imgs">
              {props.event.Users.map((u) =>
                u.Image ? (
                  <img
                    key={u.id}
                    src={u.Image.url}
                    title={`${u.firstname} ${u.lastname}`}
                  ></img>
                ) : (
                  <FontAwesomeIcon
                    key={u.id}
                    icon="user-circle"
                    title={`${u.firstname} ${u.lastname}`}
                    className={
                      props.users.find((pu) => pu.id === u.id)?.color ?? ''
                    }
                  />
                )
              )}
            </div>
          </div>
        )}
        <div className={`notes${props.event.notes ? '' : ' no-notes'}`}>
          <h3>
            <b>Notes</b>
          </h3>
          <h4>
            {props.event.notes ? (
              <b>{props.event.notes}</b>
            ) : (
              t('calendar.title.event.noNotes')
            )}
          </h4>
        </div>
      </div>
    </Popup>
  );
};

export default ViewPopup;
