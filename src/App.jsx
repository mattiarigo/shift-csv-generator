import React, { useState, useEffect, useCallback } from 'react';
import ShiftForm from './components/ShiftForm';
import ShiftCalendar from './components/Calendar';
import { saveAs } from 'file-saver';
import moment from 'moment';
import shiftsData from './shifts.json';

const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const App = () => {
  const [shifts, setShifts] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [isEnteringShifts, setIsEnteringShifts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [shiftColors, setShiftColors] = useState({});

  useEffect(() => {
    setShiftTypes(shiftsData);
    const colors = {};
    shiftsData.forEach((shift) => {
      colors[shift.type] = generateRandomColor();
    });
    setShiftColors(colors);
  }, []);

  const startEnteringShifts = (date) => {
    setCurrentDate(new Date(date));
    setIsEnteringShifts(true);
  };

  const addShift = (shiftType) => {
    if (currentDate) {
      const dateStr = moment(currentDate).format('YYYY-MM-DD');
      const existingShiftIndex = shifts.findIndex(
        (shift) => shift.date === dateStr
      );

      if (existingShiftIndex !== -1) {
        const updatedShifts = [...shifts];
        updatedShifts[existingShiftIndex] = { date: dateStr, shiftType };
        setShifts(updatedShifts);
      } else {
        const newShift = { date: dateStr, shiftType };
        setShifts([...shifts, newShift]);
      }
      setCurrentDate(moment(currentDate).add(1, 'day').toDate());
      setIsEditing(false);
      setEditIndex(null);
    }
  };

  const handleSelectEvent = (event) => {
    const shiftIndex = shifts.findIndex(
      (shift) => shift.date === moment(event.start).format('YYYY-MM-DD')
    );
    setCurrentDate(new Date(event.start));
    setIsEditing(true);
    setEditIndex(shiftIndex);
    setIsEnteringShifts(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setCurrentDate(slotInfo.start);
    setIsEnteringShifts(true);
    setIsEditing(false);
    setEditIndex(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditIndex(null);
    setCurrentDate(null);
    setIsEnteringShifts(false);
  };

  const resetShifts = () => {
    setShifts([]);
    setIsEnteringShifts(false);
    setCurrentDate(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const loadedShifts = content.split('\n').map((line) => {
          const [date, shiftType] = line.split(',');
          return { date, shiftType };
        });
        setShifts(loadedShifts);
      };
      reader.readAsText(file);
    }
  };

  const generateCSV = () => {
    const csvData = [
      [
        'Subject',
        'Start Date',
        'Start Time',
        'End Date',
        'End Time',
        'All Day Event',
        'Description',
        'Location',
        'Private',
      ],
    ];

    shifts.forEach((shift) => {
      const shiftInfo = shiftTypes.find((st) => st.type === shift.shiftType);
      if (shiftInfo) {
        const { startTime, endTime, allDayEvent } = shiftInfo;
        csvData.push([
          shift.shiftType,
          shift.date,
          startTime,
          shift.date,
          endTime,
          allDayEvent ? 'True' : 'False',
          '', // Description
          '', // Location
          'False', // Private
        ]);
      }
    });

    const csvContent = csvData.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'shifts.csv');
  };

  const handleDeleteShift = () => {
    if (currentDate) {
      const dateStr = moment(currentDate).format('YYYY-MM-DD');
      const updatedShifts = shifts.filter((shift) => shift.date !== dateStr);
      setShifts(updatedShifts);
      setIsEnteringShifts(false);
      setCurrentDate(null);
    }
  };

  const handleKeyDown = useCallback(
    (event) => {
      if (isEnteringShifts) {
        const shiftIndex = parseInt(event.key, 10) - 1;
        if (shiftIndex >= 0 && shiftIndex < shiftTypes.length) {
          addShift(shiftTypes[shiftIndex].type);
        }
      }
      if (event.key === 'Enter') {
        generateCSV();
      }
    },
    [isEnteringShifts, shiftTypes, addShift, generateCSV]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="container">
      <h1>Shift CSV Generator</h1>
      <div class="alert alert-primary" role="alert">
        <p>
          Clicca sul primo giorno, scegli il turno e prosegui. Al termine clicca
          "Download CSV" e importa il file nel tuo calendario preferito!
        </p>
        <p>
          Puoi cancellare un turno inserito cliccando sul giorno desiderato e
          poi "Delete". Altrimenti ricomincia da capo cliccando "Reset".
        </p>
      </div>
      {isEnteringShifts && currentDate && (
        <ShiftForm
          currentDay={moment(currentDate).format('YYYY-MM-DD')}
          shiftTypes={shiftTypes}
          onAddShift={addShift}
          isEditing={isEditing}
          onCancelEdit={cancelEdit}
        />
      )}
      <br />
      <div className="card">
        <div className="card-body">
          <ShiftCalendar
            shifts={shifts}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            activeDay={currentDate}
            shiftColors={shiftColors}
          />
        </div>
      </div>
      <br />
      {/* <input type="file" accept=".csv" onChange={handleFileUpload} /> */}
      <button class="btn btn-primary" onClick={generateCSV}>
        Download CSV
      </button>
      <button class="btn btn-danger" onClick={resetShifts}>
        Reset
      </button>
      <button class="btn btn-secondary" onClick={handleDeleteShift}>
        Delete
      </button>
    </div>
  );
};

export default App;
