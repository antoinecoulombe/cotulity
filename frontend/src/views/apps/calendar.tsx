import { useCallback, useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import { HomeMember } from './homes';
import { DropdownMultiOption } from '../../components/forms/dropdownMulti';
import axios from '../../utils/fetchClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment';
import frLocale from '@fullcalendar/core/locales/fr';
import AppContainer from '../../components/app/appContainer';
import EditPopup from '../../components/calendar/editPopup';
import $ from 'jquery';
import '../../assets/css/apps/calendar.css';
import ViewPopup from '../../components/calendar/viewPopup';

export interface CalendarEvent {
  id: number;
  name: string;
  shared: boolean;
  repeat: string;
  untilDate: string;
  Occurences: CalendarEventOccurence[];
  Owner?: HomeMember;
}

export interface CalendarEventOccurence {
  id: number;
  location: string;
  notes: string;
  start: string;
  end: string;
  duration: number;
  Event: CalendarEvent;
  Users?: HomeMember[];
}

interface CalendarHomeMember extends HomeMember {
  color?: string;
}

interface FcEvent {
  title: string;
  start: Date;
  end: Date;
  event: CalendarEventOccurence;
  className: string;
}

export const initCalendarEvent: CalendarEvent = {
  id: -1,
  name: '',
  shared: true,
  repeat: 'none',
  untilDate: '/@:',
  Occurences: [],
};

export const initCalendarEventOccurence: CalendarEventOccurence = {
  id: -1,
  location: '',
  notes: '',
  start: '/@:',
  end: '/@:',
  duration: 120,
  Event: initCalendarEvent,
  Users: [],
};

const nullJSX: JSX.Element = <></>;

const AppCalendar = (): JSX.Element => {
  const calendarColors: string[] = [
    'blue',
    'red',
    'orange',
    'purple',
    'green',
    'pink',
    'turquoise',
    'yellow',
    'lightblue',
    'gray',
    'lightgray',
  ];

  const { setNotification, setSuccessNotification, setErrorNotification } =
    useNotifications();
  const { t } = useTranslation('common');

  const [events, setEvents] = useState<CalendarEventOccurence[]>([]);
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [users, setUsers] = useState<CalendarHomeMember[]>([]);

  const getEvents = (): void => {
    axios
      .get(`/calendar/${localStorage.getItem('currentHome')}/events`)
      .then((res: any) => {
        if (res.data.events && res.data.users) {
          setEvents(res.data.events);

          setUsers(
            res.data.users
              .sort((a, b) => a.id - b.id)
              .map((u, i) => {
                return {
                  ...u,
                  color: calendarColors[i % calendarColors.length],
                };
              })
          );
        } else setErrorNotification(res.data);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  };

  const setTitleHTML = () => {
    let title = $('.fc-toolbar-title').text().split(' ');
    if ($('.fc-toolbar-title > b').length > 0) return;
    if (!title || !title.length) return;

    if (title.length === 2)
      $('.fc-toolbar-title').html(`${title[0]}<br/><b>${title[1]}</b>`);
    else if (title.length === 5 || title.length === 6) {
      let firstRow = $('.fc-toolbar-title').text();
      firstRow = firstRow.substring(
        0,
        firstRow.lastIndexOf(localStorage.getItem('lang') === 'fr' ? ' ' : ',')
      );
      $('.fc-toolbar-title').html(
        `${firstRow}<br/><b>${title[title.length - 1]}</b>`
      );
    }
  };

  const setCalendarHeigth = () => {
    let table = $('.fc-scrollgrid-sync-table');
    let view = $('.fc-view-harness');
    let cal = $('.fc');
    if (!table.length || !view.length || !cal.length) return;

    let winHeight = $(window)?.height();
    if (!winHeight) return;

    let tableHeight = winHeight - 460;
    table.height(tableHeight);
    view.height(tableHeight + 59);
    cal.height(tableHeight + 59 + 70);
  };

  useEffect(() => {
    getEvents();
    setTitleHTML();
    setCalendarHeigth();

    window.addEventListener('resize', () => setCalendarHeigth());

    $('.fc-toolbar-title').on('DOMSubtreeModified', () => {
      setTitleHTML();
    });

    return () => {
      $('.fc-toolbar-title').off('DOMSubtreeModified');
      window.removeEventListener('resize', () => setCalendarHeigth());
    };
  }, []);

  const handleSubmit = (event: CalendarEvent) => {
    axios({
      method: event.id === -1 ? 'post' : 'put',
      url: `/calendar/${localStorage.getItem('currentHome')}/events/${
        event.id === -1 ? '' : event.id
      }`,
      data: {
        event,
      },
    })
      .then((res: any) => {
        let newEvents = [...events];
        if (event.id !== -1) {
          // res.data.deletedIds.forEach((id) => {
          //   let taskOccIndex = -1;
          //   let taskIndex = newEvents.findIndex((t) => {
          //     if (t.Occurences) {
          //       taskOccIndex = t.Occurences?.findIndex((to) => to.id === id);
          //       return taskOccIndex !== -1;
          //     }
          //     return false;
          //   });
          //   if (taskIndex >= 0 && taskOccIndex >= 0)
          //     newEvents[taskIndex].Occurences.splice(taskOccIndex, 1);
          //   if (newEvents[taskIndex].Occurences.length === 0)
          //     newEvents.splice(taskIndex, 1);
          // });
          // res.data.task.Occurences.forEach((to) => (to.completedOn = null));
          // let taskIndex = newEvents.findIndex((t) => t.id === res.data.task.id);
          // if (taskIndex < 0) newEvents.push(res.data.task);
          // else {
          //   newEvents[taskIndex].name = res.data.task.name;
          //   newEvents[taskIndex].repeat = res.data.task.repeat;
          //   newEvents[taskIndex].shared = res.data.task.shared;
          //   newEvents[taskIndex].untilDate = res.data.task.untilDate;
          //   newEvents[taskIndex].Occurences = newEvents[
          //     taskIndex
          //   ].Occurences.concat(res.data.task.Occurences);
          // }
        } else newEvents.push(res.data.event);

        setPopup(nullJSX);
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  };

  const deleteEvent = (id: number, closePopup?: boolean) => {};

  const showEditPopup = (
    event?: CalendarEventOccurence,
    justDate?: boolean
  ): void => {
    setPopup(
      <EditPopup
        onCancel={() => setPopup(nullJSX)}
        event={event}
        justDate={justDate}
        users={users.map((u) => {
          return {
            id: u.id,
            value: `${u.firstname} ${u.lastname}`,
            img: u.Image?.url ?? undefined,
            icon:
              (u.Image?.url ?? undefined) === undefined
                ? 'user-circle'
                : undefined,
            selected: !event
              ? false
              : (event.Users?.filter((eu) => eu.id === u.id)?.length ?? -1) > 0,
          } as DropdownMultiOption;
        })}
        onSubmit={(eventGroup: CalendarEvent) => handleSubmit(eventGroup)}
        onDelete={event ? (id: number) => deleteEvent(id, true) : undefined}
      />
    );
  };

  const showViewPopup = (event: CalendarEventOccurence): void => {
    setPopup(
      <ViewPopup
        event={event}
        users={users}
        onCancel={() => setPopup(nullJSX)}
        onEdit={() => showEditPopup(event)}
      />
    );
  };

  const onEventClick = (arg) => {
    showViewPopup(arg.event._def.extendedProps.event);
  };

  const onDateClick = (arg) => {
    showEditPopup(
      { ...initCalendarEventOccurence, start: arg.date },
      arg.view.type === 'dayGridMonth'
    );
  };

  const onEventSet = (arg) => {
    // console.log('event set');
  };

  const onEventDrop = (arg) => {
    console.log('event dropped');
  };

  const getOccurences = useCallback((): FcEvent[] => {
    let ev: FcEvent[] = [];

    events.forEach((e) =>
      events.forEach((eo) =>
        ev.push({
          title: eo.Event.name,
          start: new Date(eo.start),
          end: new Date(eo.end),
          event: eo,
          className:
            users.find((u) => u.id === eo.Event.Owner?.id)?.color ?? 'blue',
        })
      )
    );

    return ev;
  }, [events]);

  return (
    <AppContainer
      popup={popup}
      title="calendar"
      appName="calendar"
      onAddClick={() => showEditPopup(undefined)}
      bodyMinHeight={580}
    >
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          momentPlugin,
        ]}
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today',
        }}
        locale={localStorage.getItem('lang') === 'fr' ? 'fr' : 'en'}
        locales={[frLocale]}
        allDaySlot={false}
        events={getOccurences()}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: false,
          hour12: false,
        }}
        initialView="dayGridMonth"
        editable={true}
        eventClick={onEventClick}
        eventsSet={onEventSet}
        dateClick={onDateClick}
        eventDrop={onEventDrop}
      />
    </AppContainer>
  );
};

export default AppCalendar;
