'use client';

import { useState, useEffect } from 'react';
import { Appointment, Service, Client } from '@/types';
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogHeader
} from '@/components/ui/dialog';
import { Clock, User, Phone } from 'lucide-react';
import { getService, getClient } from '@/lib/api';
import { AppointmentDetailView } from '@/components/calendar/appointment-detail';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
  onStatusChange?: () => Promise<void>;
  style?: {
    top: string;
    height: string;
  };
}

export function AppointmentCard({ appointment, onClick, onStatusChange, style }: AppointmentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch service and client data in parallel
        const [serviceData, clientData] = await Promise.all([
          getService(appointment.serviceId),
          getClient(appointment.clientId)
        ]);
        
        setService(serviceData);
        setClient(clientData);
      } catch (error) {
        console.error('Error fetching appointment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointment.serviceId, appointment.clientId]);
  
  // Get status tag with appropriate styling
  const renderStatusTag = () => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-500', icon: '⏳' },
      'Arrived': { color: 'bg-green-500', icon: '✅' },
      'No-Show': { color: 'bg-red-500', icon: '❌' },
      'Confirmed': { color: 'bg-blue-500', icon: '✓' },
      'Completed': { color: 'bg-purple-500', icon: '✓' },
      'Cancelled': { color: 'bg-gray-500', icon: '✗' }
    };
    
    const config = statusConfig[appointment.status as keyof typeof statusConfig] || { color: 'bg-gray-500', icon: '' };
    
    return (
      <span className={`${config.color} text-white text-xs px-2 py-1 rounded font-medium uppercase flex items-center`}>
        {config.icon && <span className="mr-1">{config.icon}</span>}
        {appointment.status}
      </span>
    );
  };
  
  const getCardHeaderColor = () => {
    const headerColors = {
      'Pending': 'bg-yellow-600',
      'Arrived': 'bg-green-600',
      'No-Show': 'bg-red-600',
      'Confirmed': 'bg-blue-600',
      'Completed': 'bg-purple-600',
      'Cancelled': 'bg-gray-600'
    };
    
    return headerColors[appointment.status as keyof typeof headerColors] || 'bg-gray-600';
  };
  
  const handleClick = () => {
    setIsDialogOpen(true);
    onClick();
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    if (onStatusChange) {
      onStatusChange();
    }
  };
  
  return (
    <>
      <div
        className="absolute left-1 right-1 rounded-md overflow-hidden shadow-sm cursor-pointer transition-all hover:shadow-lg border border-gray-200 transform hover:-translate-y-0.5 hover:scale-[1.01]"
        style={style}
        onClick={handleClick}
      >
        <div className={`${getCardHeaderColor()} text-white text-xs px-2 py-1.5 flex items-center justify-between`}>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1.5" />
            <span className="font-semibold">{appointment.startTime} - {appointment.endTime}</span>
          </div>
          {renderStatusTag()}
        </div>
        
        <div className="p-2 bg-white">
          <div className="font-medium text-sm truncate">
            {isLoading ? 'Loading...' : service?.name}
          </div>
          
          <div className="flex items-center text-xs text-gray-700 truncate mt-1.5">
            <User className="h-3 w-3 mr-1.5 text-gray-500" />
            <span>{isLoading ? 'Loading...' : client?.name}</span>
          </div>
          
          {!isLoading && client?.phone && (
            <div className="flex items-center text-xs text-gray-500 truncate mt-1">
              <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
        <DialogContent className="p-0 !max-w-[1000px] !w-[90vw] h-[90vh] sm:!max-w-[1300px]">
          <DialogHeader className="sr-only">
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {isDialogOpen && (
            <AppointmentDetailView
              appointment={appointment}
              onClose={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}