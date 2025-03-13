'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, addWeeks, subWeeks, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppointmentCard } from './appointment-card';
import { getBusinessAppointments, getBusinessStaff } from '@/lib/api';
import { Appointment, User } from '@/types';
import { useAuth } from '@/lib/auth/authContext';

// Constants for calendar display
const HOUR_HEIGHT = 60; // pixels per hour
const HALF_HOUR_HEIGHT = HOUR_HEIGHT / 2; // pixels per half hour
const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // pixels per minute

// Business hours configuration
const BUSINESS_HOURS = {
  start: 8, // 8:00
  end: 22,   // 22:00
};

// Generate hourly time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = BUSINESS_HOURS.start; hour <= BUSINESS_HOURS.end; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`); // Add half-hour increments
  }
  return slots;
};

// Format time display in 24-hour format
const formatTimeDisplay = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  
  if (minutes === 0) {
    return { primary: `${hours}`, secondary: '00' };
  } else {
    return { primary: '', secondary: '30' };
  }
};

// Calculate appointment position and height
const calculateAppointmentStyle = (appointment: Appointment) => {
  const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
  const [endHour, endMinute] = appointment.endTime.split(':').map(Number);
  
  // Calculate minutes from beginning of business hours
  const startMinutesFromOpen = (startHour - BUSINESS_HOURS.start) * 60 + startMinute;
  const endMinutesFromOpen = (endHour - BUSINESS_HOURS.start) * 60 + endMinute;
  const durationMinutes = endMinutesFromOpen - startMinutesFromOpen;
  
  // Convert to pixels using our defined constants
  return {
    top: `${startMinutesFromOpen * MINUTE_HEIGHT}px`,
    height: `${durationMinutes * MINUTE_HEIGHT}px`,
  };
};

export function CalendarView() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate]);
  
  // Time slots for the day
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  
  // Fetch staff and appointments data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.businessId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch staff and appointments in parallel
        const [staffData, appointmentsData] = await Promise.all([
          getBusinessStaff(user.businessId),
          getBusinessAppointments(user.businessId)
        ]);
        
        setStaffMembers(staffData);
        setAppointments(appointmentsData);
        
        // Auto-select the first staff member if none is selected
        if (!selectedStaffId && staffData.length > 0) {
          setSelectedStaffId(staffData[0].id);
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.businessId, selectedStaffId]);
  
  // Filter appointments based on selected staff and current week
  const filteredAppointments = useMemo(() => {
    if (!selectedStaffId) return [];
    
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    
    return appointments.filter(appointment => {
      // Only show appointments for selected staff
      if (appointment.employeeId !== selectedStaffId) return false;
      
      // Filter by current week
      const appointmentDate = parseISO(appointment.date);
      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
    });
  }, [appointments, selectedStaffId, currentDate]);
  
  // Navigation functions
  const goToToday = () => setCurrentDate(new Date());
  const goToPrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  
  // Refresh appointments after changes
  const refreshAppointments = async () => {
    if (!user?.businessId) return;
    
    try {
      setIsLoading(true);
      const updatedAppointments = await getBusinessAppointments(user.businessId);
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get title for the calendar header
  const calendarTitle = `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`;
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar header with controls */}
      <div className="p-3 border-b flex items-center justify-between gap-2 sticky top-0 z-30 bg-white">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="bg-white border-gray-300 text-black hover:bg-gray-100"
          >
            Today
          </Button>
          
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goToPrevWeek} className="text-gray-700">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextWeek} className="text-gray-700">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="font-medium text-base">
            {calendarTitle}
          </h2>
          
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            Week View
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Staff selection dropdown */}
          <Select 
            value={selectedStaffId} 
            onValueChange={setSelectedStaffId}
          >
            <SelectTrigger className="w-[180px] bg-white border-gray-300">
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map(staff => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Day headers row */}
      <div className="flex border-b border-gray-200 sticky top-[60px] z-20 bg-white">
        <div className="w-20 flex-shrink-0 border-r border-gray-200"></div>
        <div className="flex-1">
          <div className="flex">
            {weekDays.map(day => (
              <div
                key={day.toISOString()}
                className={`flex-1 h-14 flex flex-col items-center justify-center ${
                  isWeekend(day) ? 'bg-gray-50' : ''
                } ${
                  isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`text-sm font-normal text-gray-800 ${
                  isSameDay(day, new Date()) ? 'text-blue-600' : ''
                }`}>
                  {format(day, 'EEEE')}
                </div>
                <div className={`text-xl font-medium ${
                  isSameDay(day, new Date()) ? 'text-blue-600' : ''
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Calendar body - Scrollable area */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Time labels column */}
        <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-white">
          <div className="relative pt-6">
            {timeSlots.map(time => {
              const timeLabel = formatTimeDisplay(time);
              const [hours, minutes] = time.split(':').map(Number);
              return (
                <div 
                  key={time} 
                  className={`relative border-b ${minutes === 0 ? 'border-gray-300' : 'border-gray-100'}`}
                  style={{ height: `${HALF_HOUR_HEIGHT}px` }}
                >
                  <div className="absolute top-0 right-2 text-xs -translate-y-1/2 flex">
                    {timeLabel.primary && (
                      <span className="font-medium text-gray-800 mr-0.5">{timeLabel.primary}</span>
                    )}
                    <span className="text-gray-400">{timeLabel.secondary}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Days columns */}
        <div className="flex-1">
          <div className="flex h-full">
            {weekDays.map(day => {
              const isWeekendDay = isWeekend(day);
              return (
                <div 
                  key={day.toISOString()} 
                  className={`flex-1 ${
                    isWeekendDay ? 'bg-gray-50' : 'bg-white'
                  } ${
                    isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Time slots background */}
                  <div className="relative pt-6">
                    {timeSlots.map(time => {
                      const [hours, minutes] = time.split(':').map(Number);
                      return (
                        <div 
                          key={`${day.toISOString()}-${time}`} 
                          className={`border-b ${minutes === 0 ? 'border-gray-300' : 'border-gray-100'}`}
                          style={{ height: `${HALF_HOUR_HEIGHT}px` }}
                        />
                      );
                    })}
                    
                    {/* Appointments */}
                    {filteredAppointments
                      .filter(appointment => isSameDay(parseISO(appointment.date), day))
                      .map(appointment => {
                        const style = calculateAppointmentStyle(appointment);
                        const adjustedStyle = {
                          ...style,
                          top: `calc(${style.top} + 24px)`,
                        };
                        
                        return (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onClick={() => refreshAppointments()}
                            onStatusChange={refreshAppointments}
                            style={adjustedStyle}
                          />
                        );
                      })
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 