import React from 'react';

const ShiftForm = ({
  currentDay,
  shiftTypes,
  onAddShift,
  isEditing,
  onCancelEdit,
}) => {
  return (
    <div>
      <h3>Seleziona il turno per il giorno {currentDay}</h3>
      <div class="btn-group" role="group">
        {shiftTypes.map((shift, index) => (
          <button
            class="btn btn-outline-dark"
            key={shift.type}
            onClick={() => onAddShift(shift.type)}
          >
            {index + 1} - {shift.type} ({shift.startTime} - {shift.endTime}){' '}
            {shift.allDayEvent ? '(All Day)' : ''}
          </button>
        ))}
      </div>
      {isEditing && <button onClick={onCancelEdit}>Cancel</button>}
    </div>
  );
};

export default ShiftForm;
