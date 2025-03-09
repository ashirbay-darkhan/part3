'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppointmentCard } from './appointment-card';
import { getAppointments, getUsers, getBusinessAppointments, getBusinessStaff } from '@/lib/api';
import { Appointment, User } from '@/types';
import { Avatar } from '@/components/ui/avatar-fallback';
import { useAuth } from '@/lib/auth/authContext';

// Utility functions for date handling
const getDaysInWeek = (date: Date) => {
  const days = [];
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Set to Monday

  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
};

const getHoursOfDay = () => {
  const hours = [];
  for (let i = 10; i <= 21; i++) {
    hours.push(`${i}:00`);
    hours.push(`${i}:30`);
  }
  return hours;
};

const formatHour = (hour: string) => {
  const [h, m] = hour.split(':');
  return `${h}${m === '00' ? '' : `:${m}`}`;
};

const isAppointmentInTimeSlot = (appointment: Appointment, day: Date, hour: string) => {
  const appointmentDate = new Date(appointment.date);
  const isSameDay = appointmentDate.toDateString() === day.toDateString();
  
  if (!isSameDay) return false;
  
  const [h, m] = hour.split(':').map(Number);
  const [startH, startM] = appointment.startTime.split(':').map(Number);
  const [endH, endM] = appointment.endTime.split(':').map(Number);
  
  const hourInMinutes = h * 60 + m;
  const startInMinutes = startH * 60 + startM;
  const endInMinutes = endH * 60 + endM;
  
  return hourInMinutes >= startInMinutes && hourInMinutes < endInMinutes;
};

const getDayName = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export function WeekCalendarView() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [appointmentDetails, setAppointmentDetails] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get business-specific data
        if (user?.businessId) {
          const [appointmentsData, staffData] = await Promise.all([
            getBusinessAppointments(user.businessId),
            getBusinessStaff()
          ]);
          
          console.log('Fetched appointments:', appointmentsData);
          console.log('Fetched staff:', staffData);
          
          setAppointments(appointmentsData);
          setStaffMembers(staffData);
        } else {
          // Fallback to all data if no business ID
          const [appointmentsData, usersData] = await Promise.all([
            getAppointments(),
            getUsers()
          ]);
          setAppointments(appointmentsData);
          // Filter users who are likely staff (only keep users with serviceIds)
          setStaffMembers(usersData.filter(u => u.serviceIds && u.serviceIds.length > 0));
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const daysInWeek = useMemo(() => getDaysInWeek(selectedDate), [selectedDate]);
  const hoursOfDay = getHoursOfDay();
  
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      if (selectedStaff && selectedStaff !== 'all' && appointment.employeeId !== selectedStaff) {
        return false;
      }
      
      const appointmentDate = new Date(appointment.date);
      const weekStart = daysInWeek[0];
      const weekEnd = daysInWeek[6];
      
      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
    });
  }, [selectedStaff, daysInWeek, appointments]);
  
  // Staff with appointments in the current week
  const staffWithAppointments = useMemo(() => {
    const staffIds = appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        const weekStart = daysInWeek[0];
        const weekEnd = daysInWeek[6];
        return aptDate >= weekStart && aptDate <= weekEnd;
      })
      .map(apt => apt.employeeId);
    
    const uniqueStaffIds = Array.from(new Set(staffIds));
    return staffMembers.filter(user => uniqueStaffIds.includes(user.id));
  }, [appointments, daysInWeek, staffMembers]);
  
  const previousWeek = () => {
    const prevWeek = new Date(selectedDate);
    prevWeek.setDate(selectedDate.getDate() - 7);
    setSelectedDate(prevWeek);
  };
  
  const nextWeek = () => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(selectedDate.getDate() + 7);
    setSelectedDate(nextWeek);
  };
  
  const handleAppointmentClick = (appointment: Appointment) => {
    setAppointmentDetails(appointment);
  };

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId);
  };
  
  // Add a function to refresh appointments after a status change
  const refreshAppointments = async () => {
    setIsLoading(true);
    try {
      // Re-fetch appointments using the same method as in the initial load
      if (user?.businessId) {
        const appointmentsData = await getBusinessAppointments(user.businessId);
        setAppointments(appointmentsData);
      } else {
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800">
      {/* Calendar header with controls - adjust for mobile */}
      <div className="p-4 border-b dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedDate(new Date())}
            className="dark:border-gray-700 dark:text-white"
          >
            Today
          </Button>
          
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={previousWeek} className="dark:text-gray-300">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextWeek} className="dark:text-gray-300">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="font-semibold text-lg hidden sm:block">
            {formatDate(daysInWeek[0])} - {formatDate(daysInWeek[6])}, {daysInWeek[0].getFullYear()}
          </h2>
          <h2 className="font-semibold text-lg sm:hidden">
            {formatDate(daysInWeek[0]).substring(0, 3)} - {formatDate(daysInWeek[6]).substring(0, 3)}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[120px] sm:w-[180px]">
              <SelectValue placeholder="All staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              {staffMembers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="hidden sm:block">
            <Select defaultValue="week">
              <SelectTrigger className="w-[80px] sm:w-[120px]">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Staff filter pills/avatars */}
      <div className="px-4 py-2 border-b dark:border-gray-800 flex items-center overflow-x-auto">
        <Button
          variant={selectedStaff === 'all' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full mr-2 text-xs"
          onClick={() => handleStaffSelect('all')}
        >
          All Staff
        </Button>
        
        {staffWithAppointments.map(staff => (
          <Button
            key={staff.id}
            variant={selectedStaff === staff.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-full mr-2 flex items-center space-x-1 px-2"
            onClick={() => handleStaffSelect(staff.id)}
          >
            <Avatar src={staff.avatar} name={staff.name} className="w-6 h-6" />
            <span className="text-xs">{staff.name}</span>
          </Button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="w-8 h-8 border-4 border-pawly-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 border-b overflow-x-auto">
          {/* Time column */}
          <div className="border-r sticky left-0 bg-white dark:bg-gray-900 z-10">
            <div className="h-16 border-b"></div> {/* Empty corner */}
            {hoursOfDay.map((hour, index) => (
              <div 
                key={hour} 
                className="h-16 flex items-start justify-end pr-2 pt-1 text-xs text-slate-500"
              >
                {hour.endsWith(':00') && <span>{formatHour(hour)}</span>}
              </div>
            ))}
          </div>
          
          {/* Days columns */}
          {daysInWeek.map((day, dayIndex) => (
            <div key={dayIndex} className="border-r last:border-r-0 min-w-[120px]">
              {/* Day header */}
              <div className="h-16 border-b p-2 text-center">
                <div className="text-sm font-medium hidden sm:block">{getDayName(day)}</div>
                <div className="text-sm font-medium sm:hidden">{getDayName(day).substring(0, 3)}</div>
                <div className={`text-xl sm:text-2xl mt-1 ${day.toDateString() === new Date().toDateString() ? 'bg-blue-100 text-blue-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mx-auto' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
              
              {/* Hours grid with appointments */}
              {hoursOfDay.map((hour, hourIndex) => {
                const appointmentsInSlot = filteredAppointments.filter(apt => 
                  isAppointmentInTimeSlot(apt, day, hour)
                );
                
                return (
                  <div 
                    key={`${dayIndex}-${hourIndex}`}
                    className="h-16 border-b last:border-b-0 relative"
                  >
                    {appointmentsInSlot.map((appointment) => (
                      <AppointmentCard 
                        key={appointment.id}
                        appointment={appointment}
                        onClick={() => handleAppointmentClick(appointment)}
                        onStatusChange={refreshAppointments}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}