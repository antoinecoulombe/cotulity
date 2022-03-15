import { useEffect, useState } from 'react';
import { initTaskOccurence, Task, TaskOccurence } from '../../views/apps/tasks';
import { useTranslation } from 'react-i18next';
import DropdownMulti, { DropdownMultiOption } from '../forms/dropdownMulti';
import Popup from '../utils/popup';
import SingleInputForm from '../forms/singleInputForm';
import DoubleInputTitle from '../forms/doubleInputTitle';
import Translate from '../utils/translate';
import IconToolTip from '../global/iconTooltip';
import Dropdown from '../forms/dropdown';

interface EditPopupProps {
  taskOccurence?: TaskOccurence;
  users: Array<DropdownMultiOption>;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  onDelete?(...attr: any): any;
}

interface TaskEditErrors {
  name: boolean;
  participants: boolean;
  dueDate: boolean;
  untilDate: boolean;
}

const initTaskEditErrors: TaskEditErrors = {
  name: false,
  participants: false,
  dueDate: false,
  untilDate: false,
};

const EditPopup = (props: EditPopupProps): JSX.Element => {
  const { t } = useTranslation('common');

  // Input format: 2021-08-18T08:26:21.000Z
  const handleDate = (date: string): string => {
    let split = date.split('T');
    let handledDate = '';
    handledDate += split[0].substring(split[0].lastIndexOf('-') + 1) + '/';
    handledDate +=
      split[0].substring(split[0].indexOf('-') + 1, split[0].lastIndexOf('-')) +
      '@';
    handledDate += split[1].substring(0, split[1].indexOf(':')) + ':';
    handledDate += split[1].substring(
      split[1].indexOf(':') + 1,
      split[1].lastIndexOf(':')
    );
    return handledDate;
  };

  const [taskOccurence, setTaskOccurence] = useState<TaskOccurence>(
    props.taskOccurence
      ? {
          ...props.taskOccurence,
          dueDateTime: handleDate(props.taskOccurence.dueDateTime),
        }
      : initTaskOccurence
  );

  const [errors, setErrors] = useState<TaskEditErrors>(initTaskEditErrors);

  useEffect(() => {}, []);

  // const onChange = (event: any) => {
  //   setName(event.target.value);
  // };

  const toggleSwitch = (field: string): void => {
    if (field === 'important')
      setTaskOccurence({
        ...taskOccurence,
        important: !taskOccurence.important,
        Task: {
          ...taskOccurence.Task,
        },
      });
    else if (field === 'shared') {
      setTaskOccurence({
        ...taskOccurence,
        Task: {
          ...taskOccurence.Task,
          shared: !taskOccurence.Task?.shared,
        },
      });
    }
  };

  const onSubmit = (): void => {
    let newErrors = { ...initTaskEditErrors };

    if (!taskOccurence.Task.name.length) newErrors.name = true;
    if (taskOccurence.Task.shared && !taskOccurence.Users?.length)
      newErrors.participants = true;
    if (
      taskOccurence.Task.repeat !== 'none' &&
      taskOccurence.Task.untilDate === '/@:'
    )
      newErrors.untilDate = true;
    if (taskOccurence.dueDateTime === '/@:') newErrors.dueDate = true;

    setErrors(newErrors);

    if (
      !newErrors.dueDate &&
      !newErrors.name &&
      !newErrors.participants &&
      !newErrors.untilDate
    )
      props.onSubmit(taskOccurence);
  };

  const getDateTime = (
    dateTime: string
  ): {
    day: string;
    month: string;
    hour: string;
    minute: string;
  } => {
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
  };

  const InputToDateTime = (e: any, field: string): string | null => {
    var newDate: string = '';
    switch (field) {
      case 'day':
        if (e.target.value > 31) return null;
        newDate =
          e.target.value +
          taskOccurence.dueDateTime.substring(
            taskOccurence.dueDateTime.indexOf('/')
          );
        break;
      case 'month':
        if (e.target.value > 12) return null;
        newDate = taskOccurence.dueDateTime.substring(
          0,
          taskOccurence.dueDateTime.indexOf('/') + 1
        );
        newDate += e.target.value;
        newDate += taskOccurence.dueDateTime.substring(
          taskOccurence.dueDateTime.indexOf('@')
        );
        break;
      case 'hour':
        if (e.target.value > 23) return null;
        newDate = taskOccurence.dueDateTime.substring(
          0,
          taskOccurence.dueDateTime.indexOf('@') + 1
        );
        newDate += e.target.value;
        newDate += taskOccurence.dueDateTime.substring(
          taskOccurence.dueDateTime.indexOf(':')
        );
        break;
      case 'minute':
        if (e.target.value > 59) return null;
        newDate = taskOccurence.dueDateTime.substring(
          0,
          taskOccurence.dueDateTime.indexOf(':') + 1
        );
        newDate += e.target.value;
        break;
    }
    return newDate;
  };

  const setDueDateTime = (e: any, field: string): boolean => {
    if (e.target.value.length > 2) return false;
    let newDate = InputToDateTime(e, field);
    if (!newDate) return false;
    setTaskOccurence({ ...taskOccurence, dueDateTime: newDate });
    return true;
  };

  const setUntilDate = (e: any, field: string): boolean => {
    if (e.target.value.length > 2) return false;
    let newDate = InputToDateTime(e, field);
    if (!newDate) return false;
    setTaskOccurence({
      ...taskOccurence,
      Task: { ...taskOccurence.Task, untilDate: newDate },
    });
    return true;
  };

  const handleUserSelect = (selected: DropdownMultiOption[]): void => {
    let newTask = { ...taskOccurence };
    newTask.Users = selected.map((us) => {
      return {
        id: us.id,
        firstname: us.value.split(' ')[0],
        lastname: us.value.split(' ')[1],
        Image: !us.img ? null : { url: us.img },
      };
    });
    setTaskOccurence(newTask);
  };

  const handleRepeatSelect = (selected: DropdownMultiOption): void => {
    let newTask = { ...taskOccurence };
    console.log(selected);
    newTask.Task.repeat = selected.altId ?? 'none';
    setTaskOccurence(newTask);
  };

  return (
    <Popup
      onCancel={() => props.onCancel?.()}
      onSubmit={onSubmit}
      onDelete={
        props.taskOccurence
          ? () => props.onDelete?.(props.taskOccurence?.id)
          : undefined
      }
      type="edit"
      new={props.taskOccurence === undefined}
    >
      <div className="form">
        <h1>
          <Translate
            name={props.taskOccurence ? 'manage' : 'create'}
            prefix="tasks.title."
          />
        </h1>
        <SingleInputForm
          name="tasks.name.taskDesc"
          title="form.name"
          type="text"
          required={true}
          value={taskOccurence.Task.name}
          parent={{
            onChange: (e: any) =>
              setTaskOccurence({
                ...taskOccurence,
                Task: { ...taskOccurence.Task, name: e.target.value },
              }),
          }}
          style={{ iconWidth: 36, tooltipMultiplier: 8 }}
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
          required={taskOccurence.Task.shared}
          disabled={!taskOccurence.Task.shared}
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
              selected: taskOccurence.Task.repeat === 'none',
            },
            {
              id: 2,
              altId: 'day',
              value: t('tasks.name.repeat.day'),
              selected: taskOccurence.Task.repeat === 'day',
            },
            {
              id: 3,
              altId: 'week',
              value: t('tasks.name.repeat.week'),
              selected: taskOccurence.Task.repeat === 'week',
            },
            {
              id: 4,
              altId: 'twoweek',
              value: t('tasks.name.repeat.twoweek'),
              selected: taskOccurence.Task.repeat === 'twoweek',
            },
            {
              id: 5,
              altId: 'month',
              value: t('tasks.name.repeat.month'),
              selected: taskOccurence.Task.repeat === 'month',
            },
          ]}
          onSelect={(selected) => handleRepeatSelect(selected)}
          className={`in-popup${
            taskOccurence.Task.repeat !== 'none'
              ? ' half double with-d-squared'
              : ''
          }`}
          required={true}
        ></Dropdown>
        {taskOccurence.Task.repeat !== 'none' && (
          <DoubleInputTitle
            name={['tasks.name.date.dd', 'tasks.name.date.mm']}
            title="tasks.title.until"
            required={true}
            type="text"
            values={{
              first: getDateTime(taskOccurence.Task.untilDate).day,
              second: getDateTime(taskOccurence.Task.untilDate).month,
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
            first: getDateTime(taskOccurence.dueDateTime).day,
            second: getDateTime(taskOccurence.dueDateTime).month,
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
            first: getDateTime(taskOccurence.dueDateTime).hour,
            second: getDateTime(taskOccurence.dueDateTime).minute,
          }}
          onChange={(e: any, input: number) =>
            setDueDateTime(e, input === 1 ? 'hour' : 'minute')
          }
          className="in-popup half squared-inputs right"
        ></DoubleInputTitle>
        <div className="switch">
          <h2>
            <Translate name="important" prefix="tasks.title." />
          </h2>
          <div className="input-toggle">
            <div className="generic-input">
              <input
                id="theme-switch"
                type="checkbox"
                className="switch"
                defaultChecked={taskOccurence.important}
                onClick={() => toggleSwitch('important')}
              />
              {taskOccurence.important && (
                <IconToolTip
                  icon="exclamation-circle"
                  style={{ iconWidth: 23, tooltipMultiplier: 10 }}
                  error={true}
                  className="after-switch"
                />
              )}
            </div>
          </div>
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
          <div className="input-toggle disabled">
            <div className="generic-input disabled">
              <input
                id="theme-switch"
                type="checkbox"
                className="switch"
                defaultChecked={taskOccurence.Task.shared}
                disabled={
                  taskOccurence.id !== -1 &&
                  taskOccurence.Task.Owner?.id !==
                    parseInt(localStorage.getItem('userId') ?? '-1')
                }
                onClick={() => toggleSwitch('shared')}
              />
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default EditPopup;
