import React, { useState, useEffect } from 'react';
import { TimeInput } from '@nextui-org/date-input'; // Assurez-vous que l'importation est correcte
import { Time } from '@internationalized/date';
import { Calendar, DateValue } from '@nextui-org/calendar';

import { CalendarDate } from '@internationalized/date';

interface TimecodeInputProps {
  seconds?: number;
  handleInputChange: (value: number) => void;
  label: string;
}

export const TimecodeInput: React.FC<TimecodeInputProps> = ({ seconds = 0, label, handleInputChange }) => {
  const convertSecondsToTime = (seconds: number): Time => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return new Time(hours, minutes, remainingSeconds);
  };

  const convertTimeToSeconds = (time: Time): number => {
    return time.hour * 3600 + time.minute * 60 + time.second;
  };

  const [time, setTime] = useState<Time>(convertSecondsToTime(seconds));

  useEffect(() => {
    setTime(convertSecondsToTime(seconds));
  }, [seconds]);

  const handleTimeChange = (newTime: any) => {
    if (newTime instanceof Time) {
      setTime(newTime);
      handleInputChange(convertTimeToSeconds(newTime));
    } else {
      console.error('Unexpected time format:', newTime);
    }
  };

  return (
    <TimeInput
      label={label}
      labelPlacement='outside'
      value={time}
      onChange={handleTimeChange}
      hourCycle={24}
      granularity='second'
      classNames={{
        label: 'text-semibold text-default-600 text-24',
        inputWrapper: 'bg-default-50 shadow-none border-1 border-default-200 h-[50px]',
        input: 'h-[50px]',
      }}
      className='min-h-[50px]'
      hideTimeZone
    />
  );
};

// Function to parse ISO date string
function intlParseDate(dateString: string): CalendarDate {
  const [year, month, day] = dateString.split('-').map(Number);
  return new CalendarDate(year, month, day);
}

interface DateTimeIntervalPickerProps {
  label: string;
  interval: string;
  handleInputChange: (value: string) => void;
}

const parseInterval = (interval: string) => {
  if (!interval) {
    throw new Error('Interval is required');
  }

  const [start, end] = interval.split('/');
  if (!start || !end) {
    throw new Error('Invalid interval format');
  }

  const [startDate, startTime] = start.split('T');
  const [endDate, endTime] = end.split('T');

  if (!startDate || !startTime || !endDate || !endTime) {
    throw new Error('Invalid start or end datetime format');
  }

  if (startDate !== endDate) {
    throw new Error('Start and end dates must be the same.');
  }

  const date = intlParseDate(startDate);
  const parseTime = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + (seconds || 0);
  };

  return {
    date,
    start: parseTime(startTime),
    end: parseTime(endTime),
  };
};

export const DateTimeIntervalPicker: React.FC<DateTimeIntervalPickerProps> = ({
  label,
  interval = '2023-01-01T00:00:00/2023-01-01T00:00:00', // Provide a default interval
  handleInputChange,
}) => {
  const [parsedInterval, setParsedInterval] = useState<{ date: CalendarDate; start: number; end: number }>(() => {
    try {
      return parseInterval(interval);
    } catch (error) {
      console.error(error);
      // Provide a default value in case of error
      const now = new Date();
      const defaultDate = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
      return { date: defaultDate, start: 0, end: 0 };
    }
  });

  useEffect(() => {
    try {
      setParsedInterval(parseInterval(interval));
    } catch (error) {
      console.error(error);
    }
  }, [interval]);

  const formatDateTime = (date: CalendarDate, seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;

    const dateString = date.toString();
    return `${dateString}T${timeString}`;
  };

  const handleStartChange = (seconds: number) => {
    const newInterval = { ...parsedInterval, start: seconds };
    setParsedInterval(newInterval);
    handleInputChange(
      `${formatDateTime(newInterval.date, newInterval.start)}/${formatDateTime(newInterval.date, newInterval.end)}`,
    );
  };

  const handleEndChange = (seconds: number) => {
    const newInterval = { ...parsedInterval, end: seconds };
    setParsedInterval(newInterval);
    handleInputChange(
      `${formatDateTime(newInterval.date, newInterval.start)}/${formatDateTime(newInterval.date, newInterval.end)}`,
    );
  };

  const handleDateChange = (newDate: CalendarDate) => {
    const newInterval = { ...parsedInterval, date: newDate };
    setParsedInterval(newInterval);
    handleInputChange(
      `${formatDateTime(newInterval.date, newInterval.start)}/${formatDateTime(newInterval.date, newInterval.end)}`,
    );
  };

  return (
    <div className='flex flex-col w-full gap-10'>
      <label>{label}</label>
      <div className='flex flex-col gap-20'>
        <div className='w-full'>
          <Calendar
            classNames={{
              cellButton: 'rounded-12',
              base: 'w-full calendarbase shadow-none',
              content: 'w-full',
              headerWrapper: 'w-full',
              prevButton: 'rounded-8 w-[50px]',
              nextButton: 'rounded-8 w-[50px]',
            }}
            aria-label='Date'
            value={parsedInterval.date}
            onChange={handleDateChange}
            showMonthAndYearPickers
            visibleMonths={2}
            color='secondary'
            showShadow={false}
          />
        </div>
        <div className='flex flex-col w-full'>
          <TimecodeInput label='Start Time' seconds={parsedInterval.start} handleInputChange={handleStartChange} />
          <TimecodeInput label='End Time' seconds={parsedInterval.end} handleInputChange={handleEndChange} />
        </div>
        {/* <p>
          Interval: {formatDateTime(parsedInterval.date, parsedInterval.start)}/
          {formatDateTime(parsedInterval.date, parsedInterval.end)}
        </p> */}
      </div>
    </div>
  );
};
interface DateInputProps {
  date?: string;
  handleInputChange: (value: string) => void;
  label: string;
}

export const DatePicker: React.FC<DateInputProps> = ({ label, date, handleInputChange }) => {
  const getInitialDateValue = (): CalendarDate | null => {
    if (date) {
      const parsedDate = new Date(date);
      if (isValidDate(parsedDate)) {
        // Convertir en CalendarDate si nécessaire
        return new CalendarDate(parsedDate.getFullYear(), parsedDate.getMonth() + 1, parsedDate.getDate());
      }
    }
    return null;
  };

  const isValidDate = (d: Date): boolean => {
    return d instanceof Date && !isNaN(d.getTime());
  };

  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(getInitialDateValue());

  useEffect(() => {
    setSelectedDate(getInitialDateValue());
  }, [date]);

  const handleDateChange = (newDate: DateValue | null) => {
    if (newDate instanceof CalendarDate) {
      setSelectedDate(newDate);
      handleInputChange(newDate.toString().split('T')[0]); // Exemple de format ISO 8601 sans l'heure
    } else {
      setSelectedDate(null);
      handleInputChange(''); // Peut-être gérer le cas où newDate est null
    }
  };

  return (
    <div className='datetime-picker'>
      <label>{label}</label>
      <Calendar
        classNames={{
          cellButton: 'rounded-12',
          base: 'w-full calendarbase shadow-none',
          content: 'w-full',
          headerWrapper: 'w-full',
          prevButton: 'rounded-8 w-[50px]',
          nextButton: 'rounded-8 w-[50px]',
        }}
        aria-label='Date'
        value={selectedDate}
        onChange={handleDateChange}
        showMonthAndYearPickers
        visibleMonths={2}
        color='secondary'
        showShadow={false}
      />
    </div>
  );
};
