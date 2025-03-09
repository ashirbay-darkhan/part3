'use client';

import { useState, useEffect } from 'react';
import { Appointment, Service, Client, User } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogHeader
} from '@/components/ui/dialog';
import { AppointmentDetailView } from './appointment-detail';
import { cn } from '@/lib/utils';
import { getService, getClient, getUser } from '@/lib/api';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
  onStatusChange?: () => Promise<void>;
}

export function AppointmentCard({ appointment, onClick, onStatusChange }: AppointmentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Use Promise.allSettled to continue even if some requests fail
        const results = await Promise.allSettled([
          getService(appointment.serviceId),
          getClient(appointment.clientId),
          getUser(appointment.employeeId)
        ]);
        
        // Handle each result
        if (results[0].status === 'fulfilled') {
          setService(results[0].value);
        }
        
        if (results[1].status === 'fulfilled') {
          setClient(results[1].value);
        }
        
        if (results[2].status === 'fulfilled') {
          setEmployee(results[2].value);
        }
      } catch (error) {
        console.error('Error fetching appointment data:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointment.serviceId, appointment.clientId, appointment.employeeId]);
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500';
      case 'Arrived':
        return 'bg-green-500';
      case 'No-Show':
        return 'bg-red-500';
      case 'Confirmed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const statusColor = getStatusColor(appointment.status);
  
  // Calculate duration in hours for height
  const [startH, startM] = appointment.startTime.split(':').map(Number);
  const [endH, endM] = appointment.endTime.split(':').map(Number);
  const startInMinutes = startH * 60 + startM;
  const endInMinutes = endH * 60 + endM;
  const durationInHours = (endInMinutes - startInMinutes) / 60;
  
  // Calculate position from top
  const topPosition = ((startH - 10) * 2 + (startM === 30 ? 1 : 0)) * 16; // 10:00 is our start time
  
  const handleClick = () => {
    setIsDialogOpen(true);
    // Reset states to trigger fresh data loading
    setIsLoading(true);
    setHasError(false);
    onClick();
  };
  
  return (
    <>
      <div
        className="absolute left-1 right-1 rounded cursor-pointer overflow-hidden bg-purple-200 flex flex-col"
        style={{
          top: `${topPosition}px`,
          height: `${durationInHours * 32}px`,
        }}
        onClick={handleClick}
      >
        <div className={cn(`text-xs px-2 py-1 flex items-center text-white font-medium`, statusColor)}>
          <span className="truncate">{appointment.startTime}-{appointment.endTime}</span>
        </div>
        <div className="text-xs p-2 flex-1 bg-purple-100 dark:bg-purple-900">
          <div className="font-medium dark:text-white">
            {service?.name || `Service ${appointment.serviceId.substring(0, 6)}`}
          </div>
          <div className="text-slate-600 dark:text-slate-300 truncate">
            {client?.name || `Client ${appointment.clientId.substring(0, 6)}`}
          </div>
          {employee && (
            <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 truncate">
              Staff: {employee.name}
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-5xl w-[1100px] max-h-[85vh] overflow-y-auto p-0 [&>button]:hidden"
          style={{ maxWidth: '1100px', width: '90%' }}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          <AppointmentDetailView 
            key={`appointment-${appointment.id}-${isDialogOpen ? 'open' : 'closed'}`}
            appointment={appointment} 
            onClose={() => {
              setIsDialogOpen(false);
              // If there was a status change, refresh the appointment data
              if (onStatusChange) {
                onStatusChange();
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}