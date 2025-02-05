import React, { useState, useEffect } from 'react';
import { Datepicker } from "@meinefinsternis/react-horizontal-date-picker";
import { enUS } from "date-fns/locale";
import { Tabs, TimePicker, Button, Space } from '@/components/ui/tabs';
import { PlusCircle, Trash2 } from 'lucide-react';

const DynamicDatePicker = ({ form, startDate, endDate }) => {
  const [selectedDates, setSelectedDates] = useState({
    startValue: null,
    endValue: null,
    rangeDates: [],
  });
  
  const [timeSlots, setTimeSlots] = useState({});
  
  useEffect(() => {
    if (startDate && endDate) {
      setSelectedDates({
        startValue: new Date(startDate),
        endValue: new Date(endDate),
        rangeDates: []
      });
    }
  }, [startDate, endDate]);

  const handleDateChange = (dates) => {
    if (!Array.isArray(dates) || dates.length < 3) {
      console.error("Invalid date format received:", dates);
      return;
    }

    const [startValue, endValue, rangeDates] = dates;
    setSelectedDates({ startValue, endValue, rangeDates });
    
    // Initialize time slots for new dates
    const newTimeSlots = {};
    rangeDates.forEach(date => {
      if (!timeSlots[date.toISOString()]) {
        newTimeSlots[date.toISOString()] = [];
      }
    });
    
    setTimeSlots(prev => ({...prev, ...newTimeSlots}));
  };

  const addTimeSlot = (date) => {
    const dateKey = date.toISOString();
    setTimeSlots(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { start_time: null, end_time: null }]
    }));
  };

  const removeTimeSlot = (date, index) => {
    const dateKey = date.toISOString();
    setTimeSlots(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (date, index, type, value) => {
    const dateKey = date.toISOString();
    setTimeSlots(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map((slot, i) => 
        i === index ? { ...slot, [type]: value } : slot
      )
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full space-y-6">
      <Datepicker
        onChange={handleDateChange}
        locale={enUS}
        startValue={selectedDates.startValue}
        endValue={selectedDates.endValue}
      />
      
      {selectedDates.rangeDates.length > 0 && (
        <Tabs defaultValue={selectedDates.rangeDates[0].toISOString()} className="w-full">
          {selectedDates.rangeDates.map((date) => (
            <Tabs.List key={date.toISOString()}>
              <Tabs.Trigger value={date.toISOString()}>
                {formatDate(date)}
              </Tabs.Trigger>
            </Tabs.List>
          ))}
          
          {selectedDates.rangeDates.map((date) => (
            <Tabs.Content key={date.toISOString()} value={date.toISOString()}>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Time Slots for {formatDate(date)}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addTimeSlot(date)}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>
                
                {timeSlots[date.toISOString()]?.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <TimePicker
                      className="w-32"
                      format="HH:mm"
                      value={slot.start_time}
                      onChange={(value) => updateTimeSlot(date, index, 'start_time', value)}
                      placeholder="Start Time"
                    />
                    <TimePicker
                      className="w-32"
                      format="HH:mm"
                      value={slot.end_time}
                      onChange={(value) => updateTimeSlot(date, index, 'end_time', value)}
                      placeholder="End Time"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeSlot(date, index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </Tabs.Content>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default DynamicDatePicker;