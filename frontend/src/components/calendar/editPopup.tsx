import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarEventOccurence,
  CalendarEvent,
  initCalendarEventOccurence,
} from '../../views/apps/calendar';
import DropdownMulti, { DropdownMultiOption } from '../forms/dropdownMulti';
import IconToolTip from '../global/iconTooltip';
import Popup from '../utils/popup';
import Dropdown from '../forms/dropdown';
import SingleInputForm from '../forms/singleInputForm';
import DoubleInputTitle from '../forms/doubleInputTitle';
import Translate from '../utils/translate';

interface EditPopupProps {
  event?: CalendarEventOccurence;
  users: Array<DropdownMultiOption>;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  onDelete?(...attr: any): any;
}

interface CalendarErrors {
  name: boolean;
  participants: boolean;
  dueDate: boolean;
  dueTime: boolean;
  untilDate: boolean;
}

const initCalendarErrors: CalendarErrors = {
  name: false,
  participants: false,
  dueDate: false,
  dueTime: false,
  untilDate: false,
};

const EditPopup = (props: EditPopupProps): JSX.Element => {
  const { t } = useTranslation('common');

  // Input format: 2021-08-18T08:26:21.000Z
  // Input format: Mon, 09 Jan 2023 05:00:00 GMT
  // Output format: 'DD/MM@HH:mm'
  const handleDate = (date: string): string => {
    let newDate = new Date(date);
    return `${newDate.getUTCDate()}/${
      newDate.getUTCMonth() + 1
    }@${newDate.getUTCHours()}:${newDate.getUTCMinutes()}`;
  };

  const [eventOccurence, setEventOccurence] = useState<CalendarEventOccurence>(
    props.event
      ? {
          ...props.event,
          start: handleDate(props.event.start),
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

  useEffect(() => {}, []);

  // const onChange = (event: any) => {
  //   setName(event.target.value);
  // };

  const toggleSharedSwitch = (): void => {
    setEventOccurence({
      ...eventOccurence,
      Event: {
        ...eventOccurence.Event,
        shared: !eventOccurence.Event?.shared,
      },
    });
  };

  const onSubmit = (): void => {
    let newErrors = { ...initCalendarErrors };
  };

  const getDateTime = (
    dateTime: string
  ): {
    day: string;
    month: string;
    hour: string;
    minute: string;
  } => {
    try {
      let split = dateTime.split('@');
      var day: string, month: string, hour: string, minute: string;
      if (split[0].length > 1) {
        day = split[0].substring(0, split[0].indexOf('/'));
        month = split[0].substring(split[0].indexOf('/') + 1);
      } else {
        day = '';
        month = '';
      }

      if (split[1].length > 1) {
        hour = split[1].substring(0, split[1].indexOf(':'));
        minute = split[1].substring(split[1].indexOf(':') + 1);
      } else {
        hour = '';
        minute = '';
      }
      return { day: day, month: month, hour: hour, minute: minute };
    } catch (error) {
      return { day: '', month: '', hour: '', minute: '' };
    }
  };

  const InputToDateTime = (
    e: any,
    field: string,
    date: string
  ): string | null => {
    var newDate: string = '';
    switch (field) {
      case 'day':
        if (e.target.value > 31) return null;
        newDate = e.target.value + date.substring(date.indexOf('/'));
        break;
      case 'month':
        if (e.target.value > 12) return null;
        newDate = date.substring(0, date.indexOf('/') + 1);
        newDate += e.target.value;
        newDate += date.substring(date.indexOf('@'));
        break;
      case 'hour':
        if (e.target.value > 23) return null;
        newDate = date.substring(0, date.indexOf('@') + 1);
        newDate += e.target.value;
        newDate += date.substring(date.indexOf(':'));
        break;
      case 'minute':
        if (e.target.value > 59) return null;
        newDate = date.substring(0, date.indexOf(':') + 1);
        newDate += e.target.value;
        break;
    }
    return newDate;
  };

  // const setDueDateTime = (e: any, field: string): boolean => {
  //   if (e.target.value.length > 2) return false;
  //   let newDate = InputToDateTime(e, field, eventOccurence.dueDateTime);
  //   if (!newDate) return false;
  //   setEventOccurence({ ...eventOccurence, dueDateTime: newDate });
  //   return true;
  // };

  // const setUntilDate = (e: any, field: string): boolean => {
  //   if (e.target.value.length > 2) return false;
  //   let newDate = InputToDateTime(e, field, eventOccurence.Task.untilDate);
  //   if (!newDate) return false;
  //   setEventOccurence({
  //     ...eventOccurence,
  //     Task: { ...eventOccurence.Task, untilDate: newDate },
  //   });
  //   return true;
  // };

  // const handleUserSelect = (selected: DropdownMultiOption[]): void => {
  //   let newTask = { ...eventOccurence };
  //   newTask.Users = selected.map((us) => {
  //     return {
  //       id: us.id,
  //       firstname: us.value.split(' ')[0],
  //       lastname: us.value.split(' ')[1],
  //       Image: !us.img ? null : { url: us.img },
  //     };
  //   });
  //   setEventOccurence(newTask);
  // };

  // const handleRepeatSelect = (selected: DropdownMultiOption): void => {
  //   let newTask = { ...eventOccurence };
  //   newTask.Task.repeat = selected.altId ?? 'none';
  //   setEventOccurence(newTask);
  // };

  return (
    <Popup
      onCancel={() => props.onCancel?.()}
      onSubmit={onSubmit}
      onDelete={
        props.event ? () => props.onDelete?.(props.event?.id) : undefined
      }
      type="edit"
      new={props.event === undefined}
    >
      <div className="form">
        <h1>
          <Translate
            name={props.event ? 'manage' : 'create'}
            prefix="tasks.title."
          />
        </h1>
        {/* <SingleInputForm
          name="tasks.name.taskDesc"
          title="form.name"
          type="text"
          required={true}
          value={eventOccurence.Task.name}
          parent={{
            onChange: (e: any) =>
              setEventOccurence({
                ...eventOccurence,
                Task: { ...eventOccurence.Task, name: e.target.value },
              }),
          }}
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={errors.name}
        ></SingleInputForm>
        <DropdownMulti
          name="tasks.name.participants"
          title="tasks.title.participants"
          options={props.users}
          onSelect={(selected) => handleUserSelect(selected)}
          onSelectTransform={(value: string) => {
            let split = value.split(' ');
            return `${split[0]} ${split[1][0].toUpperCase()}.`;
          }}
          className="in-popup"
          required={eventOccurence.Task.shared}
          disabled={!eventOccurence.Task.shared}
          error={errors.participants}
        ></DropdownMulti>
        <Dropdown
          name="tasks.name.repeat.none"
          title="tasks.title.repeat"
          options={[
            {
              id: 1,
              altId: 'none',
              value: t('tasks.name.repeat.none'),
              selected: eventOccurence.Task.repeat === 'none',
            },
            {
              id: 2,
              altId: 'day',
              value: t('tasks.name.repeat.day'),
              selected: eventOccurence.Task.repeat === 'day',
            },
            {
              id: 3,
              altId: 'week',
              value: t('tasks.name.repeat.week'),
              selected: eventOccurence.Task.repeat === 'week',
            },
            {
              id: 4,
              altId: 'twoweek',
              value: t('tasks.name.repeat.twoweek'),
              selected: eventOccurence.Task.repeat === 'twoweek',
            },
            {
              id: 5,
              altId: 'month',
              value: t('tasks.name.repeat.month'),
              selected: eventOccurence.Task.repeat === 'month',
            },
          ]}
          onSelect={(selected) => handleRepeatSelect(selected)}
          className={`in-popup${
            eventOccurence.Task.repeat !== 'none'
              ? ' half double with-d-squared'
              : ''
          }`}
          required={true}
        ></Dropdown>
        {eventOccurence.Task.repeat !== 'none' && (
          <DoubleInputTitle
            name={['tasks.name.date.dd', 'tasks.name.date.mm']}
            title="tasks.title.until"
            required={true}
            type="text"
            values={{
              first: getDateTime(eventOccurence.Task.untilDate).day,
              second: getDateTime(eventOccurence.Task.untilDate).month,
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
          title="tasks.title.dueDate"
          required={true}
          type="text"
          values={{
            first: getDateTime(eventOccurence.dueDateTime).day,
            second: getDateTime(eventOccurence.dueDateTime).month,
          }}
          onChange={(e: any, input: number) =>
            setDueDateTime(e, input === 1 ? 'day' : 'month')
          }
          className="in-popup half squared-inputs left"
          error={errors.dueDate}
        ></DoubleInputTitle>
        <DoubleInputTitle
          name={['tasks.name.date.hh', 'tasks.name.date.mm']}
          title="tasks.title.dueTime"
          type="text"
          values={{
            first: getDateTime(eventOccurence.dueDateTime).hour,
            second: getDateTime(eventOccurence.dueDateTime).minute,
          }}
          onChange={(e: any, input: number) =>
            setDueDateTime(e, input === 1 ? 'hour' : 'minute')
          }
          className="in-popup half squared-inputs right"
          error={errors.dueTime}
        ></DoubleInputTitle>
        <div className="switch">
          <h2>
            <Translate name="important" prefix="tasks.title." />
          </h2>
        </div>
        <div className="switch help last">
          <h2>
            <b>
              <Translate name="shared" prefix="tasks.title." />
            </b>
            <IconToolTip
              icon="question-circle"
              style={{ iconWidth: 23, tooltipMultiplier: 10 }}
            >
              tasks.tooltip.shared
            </IconToolTip>
          </h2>
          <div className="input-toggle">
            <div className="generic-input">
              <input
                id="theme-switch"
                type="checkbox"
                className="switch"
                defaultChecked={eventOccurence.Task.shared}
                disabled={eventOccurence.Task.id !== -1}
                onClick={() => toggleSharedSwitch('shared')}
              />
            </div>
          </div>
        </div> */}
      </div>
    </Popup>
  );
};

export default EditPopup;
