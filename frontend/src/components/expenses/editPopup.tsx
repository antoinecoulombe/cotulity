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
import { HomeMember } from '../../views/apps/homes';

interface Expense {
  amount?: number;
  date?: string;
  description?: string;
  Users: HomeMember[];
}

interface EditPopupProps {
  users: Array<DropdownMultiOption>;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
}

interface ExpenseErrors {
  amount: boolean;
  date: boolean;
  description: boolean;
  users: boolean;
}

const initExpenseErrors: ExpenseErrors = {
  amount: false,
  date: false,
  description: false,
  users: false,
};

const EditPopup = (props: EditPopupProps): JSX.Element => {
  const { t } = useTranslation('common');

  const [expense, setExpense] = useState<Expense>({ date: '/', Users: [] });

  const [errors, setErrors] = useState<ExpenseErrors>(initExpenseErrors);

  useEffect(() => {}, []);

  const onSubmit = (): void => {
    let newErrors = { ...initExpenseErrors };

    let date = getDate(expense.date);

    if (!expense.description?.length) newErrors.description = true;
    if (!expense.amount || isNaN(expense.amount)) newErrors.amount = true;
    if (date.day.length == 0 || date.month.length == 0) newErrors.date = true;

    setErrors(newErrors);

    for (const prop in newErrors) if (newErrors[prop]) return;
    props.onSubmit(expense);
  };

  const getDate = (
    dateTime?: string
  ): {
    day: string;
    month: string;
  } => {
    try {
      if (!dateTime) throw 'Date undefined';

      let split = dateTime.split('/');
      return { day: split[0], month: split[1] };
    } catch (error) {
      return { day: '', month: '' };
    }
  };

  const InputToDate = (e: any, field: string, date: string): string | null => {
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
        break;
    }
    return newDate;
  };

  const setDate = (e: any, field: string): boolean => {
    if (e.target.value.length > 2) return false;
    let newDate = InputToDate(e, field, expense.date ?? '');
    if (!newDate || !newDate.length) return false;
    setExpense({ ...expense, date: newDate });
    return true;
  };

  const handleUserSelect = (selected: DropdownMultiOption[]): void => {
    let newExpense = { ...expense };
    newExpense.Users = selected.map((us) => {
      return {
        id: us.id,
        firstname: us.value.split(' ')[0],
        lastname: us.value.split(' ')[1],
        Image: !us.img ? null : { url: us.img },
      };
    });
    setExpense(newExpense);
  };

  const handleAmount = (e: any): void => {
    setExpense({
      ...expense,
      amount: e.target.value,
    });
  };

  return (
    <Popup
      onCancel={() => props.onCancel?.()}
      onSubmit={onSubmit}
      type="edit"
      new={true}
    >
      <div className="form">
        <h1>
          <Translate name="create" prefix="expenses.title." />
        </h1>
        <DropdownMulti
          name="expenses.name.splittedWith"
          title="expenses.title.splittedWith"
          options={props.users}
          onSelect={(selected) => handleUserSelect(selected)}
          onSelectTransform={(value: string) => {
            let split = value.split(' ');
            return `${split[0]} ${split[1][0].toUpperCase()}.`;
          }}
          className="in-popup"
          required={true}
          error={errors.users}
        ></DropdownMulti>
        <SingleInputForm
          name="expenses.name.amount"
          title="expenses.title.amount"
          type="text"
          required={true}
          value={expense.amount?.toString()}
          parent={{
            onChange: (e: any) => handleAmount(e),
          }}
          onlyNumbers={true}
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup half double with-d-squared"
          error={errors.amount}
        ></SingleInputForm>
        <DoubleInputTitle
          name={['tasks.name.date.dd', 'tasks.name.date.mm']}
          title="expenses.title.date"
          required={true}
          type="text"
          values={{
            first: getDate(expense.date).day,
            second: getDate(expense.date).month,
          }}
          onChange={(e: any, input: number) =>
            setDate(e, input === 1 ? 'day' : 'month')
          }
          onlyNumbers={true}
          className="in-popup half squared-inputs right"
          error={errors.date}
        ></DoubleInputTitle>
        <SingleInputForm
          name="expenses.name.description"
          title="expenses.title.description"
          type="text"
          required={true}
          value={expense.description}
          parent={{
            onChange: (e: any) =>
              setExpense({
                ...expense,
                description: e.target.value,
              }),
          }}
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={errors.description}
        ></SingleInputForm>
      </div>
    </Popup>
  );
};

export default EditPopup;
