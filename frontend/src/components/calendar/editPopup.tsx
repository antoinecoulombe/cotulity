import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { handleDate, getDateTime, InputToDateTime } from '../../utils/date';
import { useNotifications } from '../../contexts/NotificationsContext';
import {
  CalendarEventOccurence,
  initCalendarEventOccurence,
} from '../../views/apps/calendar';
import DropdownMulti, { DropdownMultiOption } from '../forms/dropdownMulti';
import IconToolTip from '../global/iconTooltip';
import Popup from '../utils/popup';
import Dropdown from '../forms/dropdown';
import SingleInputForm from '../forms/singleInputForm';
import DoubleInputTitle from '../forms/doubleInputTitle';
import Translate from '../utils/translate';
import WarningPopup from '../global/warningPopup';

interface EditPopupProps {
  users: Array<DropdownMultiOption>;
  event?: CalendarEventOccurence;
  justDate?: boolean;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  onDelete?(...attr: any): any;
}

interface CalendarErrors {
  name: boolean;
  location: boolean;
  notes: boolean;
  start: boolean;
  duration: boolean;
  repeat: boolean;
  untilDate: boolean;
  Users: boolean;
}

const initCalendarErrors: CalendarErrors = {
  name: false,
  location: false,
  notes: false,
  start: false,
  duration: false,
  repeat: false,
  untilDate: false,
  Users: false,
};

const nullJSX: JSX.Element = <></>;

const EditPopup = (props: EditPopupProps): JSX.Element => {
  const { t } = useTranslation('common');
  const { setErrorNotification } = useNotifications();

  const [eventOccurence, setEventOccurence] = useState<CalendarEventOccurence>(
    props.event
      ? {
          ...props.event,
          start: handleDate(
            props.event.start,
            props.justDate === true ? 'date' : undefined
          ),
          end: handleDate(props.event.end),
          Event: {
            ...props.event.Event,
            untilDate: handleDate(props.event.Event.untilDate),
          },
        }
      : initCalendarEventOccurence
  );

  const [errors, setErrors] = useState<CalendarErrors>({
    ...initCalendarErrors,
  });

  const [popup, setPopup] = useState<JSX.Element>(nullJSX);

  const toggleSharedSwitch = (): void => {
    setEventOccurence({
      ...eventOccurence,
      Event: {
        ...eventOccurence.Event,
        shared: !eventOccurence.Event?.shared,
      },
    });
  };

  const onSubmit = (updateAllOnUpdate?: boolean): void => {
    let newErrors = { ...initCalendarErrors };
    if (!eventOccurence.Event.name?.length) newErrors.name = true;
    if (!eventOccurence.Users?.length) newErrors.Users = true;
    if (!eventOccurence.Event.repeat?.length) newErrors.repeat = true;
    if (
      !eventOccurence.start?.length ||
      eventOccurence.start === '/@:' ||
      !getDateTime(eventOccurence.start).hour.length ||
      !getDateTime(eventOccurence.start).minute.length ||
      !getDateTime(eventOccurence.start).month.length ||
      !getDateTime(eventOccurence.start).day.length
    )
      newErrors.start = true;
    if (!eventOccurence.duration) newErrors.duration = true;

    setErrors(newErrors);

    for (const prop in newErrors) if (newErrors[prop]) return;

    try {
      let startString = getDateTime(eventOccurence.start);
      let startDate = new Date(
        new Date().getFullYear(),
        parseInt(startString.month) - 1,
        parseInt(startString.day),
        parseInt(startString.hour),
        parseInt(startString.minute)
      );

      let endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + eventOccurence.duration);

      let untilDate =
        eventOccurence.Event.untilDate !== '/@:'
          ? eventOccurence.Event.untilDate.substring(
              0,
              eventOccurence.Event.untilDate.indexOf('@')
            ) + '@23:59'
          : '/@:';

      props.onSubmit(
        {
          ...eventOccurence,
          end: handleDate(endDate),
          Event: { ...eventOccurence.Event, untilDate: untilDate },
        },
        updateAllOnUpdate
      );
    } catch (error) {
      setErrorNotification({ title: 'request.error', msg: 'request.error' });
    }
  };

  const setDueDateTime = (e: any, field: string, end?: boolean): boolean => {
    if (e.target.value.length > 2) return false;
    let newDate = InputToDateTime(
      e,
      field,
      end ? eventOccurence.end : eventOccurence.start
    );
    if (!newDate) return false;

    if (end) setEventOccurence({ ...eventOccurence, end: newDate });
    else setEventOccurence({ ...eventOccurence, start: newDate });

    return true;
  };

  const setUntilDate = (e: any, field: string): boolean => {
    if (e.target.value.length > 2) return false;
    let newDate = InputToDateTime(e, field, eventOccurence.Event.untilDate);
    if (!newDate) return false;
    setEventOccurence({
      ...eventOccurence,
      Event: { ...eventOccurence.Event, untilDate: newDate },
    });
    return true;
  };

  const handleUserSelect = (selected: DropdownMultiOption[]): void => {
    let newEvent = { ...eventOccurence };
    newEvent.Users = selected.map((us) => {
      return {
        id: us.id,
        firstname: us.value.split(' ')[0],
        lastname: us.value.split(' ')[1],
        Image: !us.img ? null : { url: us.img },
      };
    });
    setEventOccurence(newEvent);
  };

  const handleRepeatSelect = (selected: DropdownMultiOption): void => {
    let newEvent = { ...eventOccurence };
    newEvent.Event.repeat = selected.altId ?? 'none';
    setEventOccurence(newEvent);
  };

  const handleDurationSelect = (selected: DropdownMultiOption): void => {
    let newEvent = { ...eventOccurence };
    newEvent.duration = selected.id;
    setEventOccurence(newEvent);
  };

  return (
    <Popup
      popup={popup}
      onCancel={() => props.onCancel?.()}
      onSubmit={() => {
        if (eventOccurence.id === -1) onSubmit();
        else {
          setPopup(
            <WarningPopup
              title={t('calendar.event.update.title')}
              desc={t('calendar.event.update.desc')}
              yesText={t('calendar.event.update.allNext')}
              noText={t('calendar.event.update.onlyThisOne')}
              onCancel={() => setPopup(nullJSX)}
              onYes={() => {
                setPopup(nullJSX);
                onSubmit(true);
              }}
              onNo={() => {
                setPopup(nullJSX);
                onSubmit(false);
              }}
            ></WarningPopup>
          );
        }
      }}
      onDelete={
        props.event?.Event.name.length
          ? () => props.onDelete?.(props.event?.id)
          : undefined
      }
      type="edit"
      new={props.event === undefined}
    >
      <div className="form">
        <h1>
          <Translate
            name={props.event?.Event.name.length ? 'edit' : 'create'}
            prefix="calendar.title.event."
          />
        </h1>
        <SingleInputForm
          name="calendar.name.event.name"
          title="calendar.title.event.name"
          type="text"
          required={true}
          value={eventOccurence.Event.name}
          parent={{
            onChange: (e: any) =>
              setEventOccurence({
                ...eventOccurence,
                Event: { ...eventOccurence.Event, name: e.target.value },
              }),
          }}
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={errors.name}
        ></SingleInputForm>
        <SingleInputForm
          name="calendar.name.event.location"
          title="calendar.title.event.location"
          type="text"
          value={eventOccurence.location}
          parent={{
            onChange: (e: any) =>
              setEventOccurence({
                ...eventOccurence,
                location: e.target.value,
              }),
          }}
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={errors.location}
        ></SingleInputForm>
        <DropdownMulti
          name="calendar.name.event.users"
          title="calendar.title.event.users"
          options={props.users}
          onSelect={(selected) => handleUserSelect(selected)}
          onSelectTransform={(value: string) => {
            let split = value.split(' ');
            return `${split[0]} ${split[1][0].toUpperCase()}.`;
          }}
          className="in-popup"
          required={true}
          error={errors.Users}
        ></DropdownMulti>
        <Dropdown
          name="tasks.name.repeat.none"
          title="calendar.title.event.repeat"
          options={[
            {
              id: 1,
              altId: 'none',
              value: t('tasks.name.repeat.none'),
              selected: eventOccurence.Event.repeat === 'none',
            },
            {
              id: 2,
              altId: 'day',
              value: t('tasks.name.repeat.day'),
              selected: eventOccurence.Event.repeat === 'day',
            },
            {
              id: 3,
              altId: 'week',
              value: t('tasks.name.repeat.week'),
              selected: eventOccurence.Event.repeat === 'week',
            },
            {
              id: 4,
              altId: 'twoweek',
              value: t('tasks.name.repeat.twoweek'),
              selected: eventOccurence.Event.repeat === 'twoweek',
            },
            {
              id: 5,
              altId: 'month',
              value: t('tasks.name.repeat.month'),
              selected: eventOccurence.Event.repeat === 'month',
            },
          ]}
          onSelect={(selected) => handleRepeatSelect(selected)}
          className={`in-popup${
            eventOccurence.Event.repeat !== 'none'
              ? ' half double with-d-squared'
              : ''
          }`}
          required={true}
          error={errors.repeat}
        ></Dropdown>
        {eventOccurence.Event.repeat !== 'none' && (
          <DoubleInputTitle
            name={['tasks.name.date.dd', 'tasks.name.date.mm']}
            title="calendar.title.event.until"
            required={true}
            type="text"
            values={{
              first: getDateTime(eventOccurence.Event.untilDate).day,
              second: getDateTime(eventOccurence.Event.untilDate).month,
            }}
            onChange={(e: any, input: number) =>
              setUntilDate(e, input === 1 ? 'day' : 'month')
            }
            className="in-popup half squared-inputs right"
            error={errors.untilDate}
          ></DoubleInputTitle>
        )}
        <DoubleInputTitle
          name={['tasks.name.date.dd', 'tasks.name.date.mm']}
          title="calendar.title.event.startsAt"
          required={true}
          type="text"
          values={{
            first: getDateTime(eventOccurence.start).day,
            second: getDateTime(eventOccurence.start).month,
          }}
          onChange={(e: any, input: number) =>
            setDueDateTime(e, input === 1 ? 'day' : 'month')
          }
          className="in-popup half squared-inputs left"
          error={errors.start}
        ></DoubleInputTitle>
        <DoubleInputTitle
          name={['tasks.name.date.hh', 'tasks.name.date.mm']}
          title="&#8205;"
          type="text"
          values={{
            first: getDateTime(eventOccurence.start).hour,
            second: getDateTime(eventOccurence.start).minute,
          }}
          onChange={(e: any, input: number) =>
            setDueDateTime(e, input === 1 ? 'hour' : 'minute')
          }
          className="in-popup half squared-inputs right"
          error={errors.start}
        ></DoubleInputTitle>
        <Dropdown
          name="60 minutes"
          title="calendar.title.event.duration"
          options={[
            {
              id: 30,
              value: '30 minutes',
              selected: eventOccurence.duration === 30,
            },
            {
              id: 60,
              value: '60 minutes',
              selected: eventOccurence.duration === 60,
            },
            {
              id: 90,
              value: '90 minutes',
              selected: eventOccurence.duration === 90,
            },
            {
              id: 120,
              value: `2 ${t('time.hours')}`,
              selected: eventOccurence.duration === 120,
            },
            {
              id: 180,
              value: `3 ${t('time.hours')}`,
              selected: eventOccurence.duration === 180,
            },
            {
              id: 240,
              value: `4 ${t('time.hours')}`,
              selected: eventOccurence.duration === 240,
            },
            {
              id: 300,
              value: `5 ${t('time.hours')}`,
              selected: eventOccurence.duration === 300,
            },
          ]}
          maxOptions={4}
          onSelect={(selected) => handleDurationSelect(selected)}
          className="in-popup"
          required={true}
          error={errors.duration}
        ></Dropdown>
        <SingleInputForm
          name="calendar.name.event.notes"
          title="calendar.title.event.notes"
          type="text"
          value={eventOccurence.notes}
          parent={{
            onChange: (e: any) =>
              setEventOccurence({
                ...eventOccurence,
                notes: e.target.value,
              }),
          }}
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={errors.notes}
          heightMultiplier={2}
        ></SingleInputForm>

        <div className="switch help last">
          <h2>
            <b>
              <Translate name="shared" prefix="calendar.title.event." />
            </b>
            <IconToolTip
              icon="question-circle"
              style={{ iconWidth: 23, tooltipMultiplier: 10 }}
            >
              calendar.tooltip.shared
            </IconToolTip>
          </h2>
          <div className="input-toggle">
            <div className="generic-input">
              <input
                id="theme-switch"
                type="checkbox"
                className="switch"
                defaultChecked={!eventOccurence.Event.shared}
                disabled={eventOccurence.Event.id !== -1}
                onClick={() => toggleSharedSwitch()}
              />
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default EditPopup;
