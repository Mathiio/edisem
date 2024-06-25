import React, { useState, useEffect } from 'react';
import { TimeInput } from '@nextui-org/date-input'; // Assurez-vous que l'importation est correcte
import { Time } from '@internationalized/date';

interface TimecodeInputProps {
  seconds: number;
  handleInputChange: (value: number) => void;
  label: string;
}

export const TimecodeInput: React.FC<TimecodeInputProps> = ({ seconds, label, handleInputChange }) => {
  // Convertir les secondes en objet Time
  const convertSecondsToTime = (seconds: number): Time => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return new Time(hours, minutes, remainingSeconds);
  };

  // Convertir l'objet Time en secondes
  const convertTimeToSeconds = (time: Time): number => {
    return time.hour * 3600 + time.minute * 60 + time.second;
  };

  // État local pour gérer l'heure en tant qu'objet Time
  const [time, setTime] = useState<Time>(convertSecondsToTime(seconds));

  // Mettre à jour l'état local lorsque les secondes initiales changent
  useEffect(() => {
    setTime(convertSecondsToTime(seconds));
  }, [seconds]);

  // Gérer le changement de temps
  const handleTimeChange = (newTime: Time) => {
    setTime(newTime); // Mettre à jour l'état local avec le nouveau temps
    const newSeconds = convertTimeToSeconds(newTime); // Convertir le nouveau temps en secondes
    handleInputChange(newSeconds); // Appeler handleInputChange avec les nouvelles secondes
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
      isRequired
      hideTimeZone
    />
  );
};
