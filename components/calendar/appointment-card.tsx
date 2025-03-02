'use client';

import { useState } from 'react';
import { Appointment } from '@/types';
import { services, clients, getStatusDetails } from '@/lib/dummy-data';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AppointmentDetailView } from './appointment-detail';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const service = services.find(s => s.id === appointment.serviceId);
  const client = clients.find(c => c.id === appointment.clientId);
  const statusDetails = getStatusDetails(appointment.status);
  
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
        <div className={cn(`text-xs px-2 py-1 flex items-center text-white font-medium`, statusDetails.color)}>
          <span className="truncate">{appointment.startTime}-{appointment.endTime}</span>
        </div>
        <div className="text-xs p-2 flex-1 bg-purple-100">
          <div className="font-medium">{service?.name}</div>
          <div className="text-slate-600 truncate">{client?.name}</div>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AppointmentDetailView 
            appointment={appointment} 
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}