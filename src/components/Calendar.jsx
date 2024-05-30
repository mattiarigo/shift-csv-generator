import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const ShiftCalendar = ({
  shifts,
  onSelectEvent,
  onSelectSlot,
  activeDay,
  shiftColors,
}) => {
  const events = shifts.map((shift) => {
    const shiftInfo = shiftColors[shift.shiftType]
      ? { color: shiftColors[shift.shiftType] }
      : {};
    return {
      title: shift.shiftType,
      start: new Date(shift.date),
      end: new Date(shift.date),
      allDay: true,
      ...shiftInfo,
    };
  });

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color;
    return {
      style: { backgroundColor },
    };
  };

  const dayPropGetter = (date) => {
    if (moment(date).isSame(activeDay, 'day')) {
      return {
        className: 'active-day',
      };
    }
    if (moment(date).isSame(new Date(), 'day')) {
      return {
        className: 'current-day',
      };
    }
    return {};
  };

  return (
    <Calendar
      localizer={localizer}
      views={{ month: true, week: false, day: false, agenda: false }}
      events={events}
      startAccessor="start"
      endAccessor="end"
      selectable
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      style={{ height: 500 }}
      eventPropGetter={eventStyleGetter}
      defaultDate={new Date()}
      dayPropGetter={dayPropGetter}
    />
  );
};

export default ShiftCalendar;
