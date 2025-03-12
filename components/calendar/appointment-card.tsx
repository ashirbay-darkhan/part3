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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getCardHeaderColor()}`}></span>
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-pulse text-gray-400">Loading appointment details...</div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{service?.name}</h3>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{appointment.date} • {appointment.startTime} - {appointment.endTime}</span>
                    </div>
                  </div>
                  
                  <div className="mt-1">{renderStatusTag()}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        Client Information
                      </h3>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">{client?.name}</p>
                          {client?.email && <p className="text-sm text-gray-500">{client.email}</p>}
                        </div>
                        
                        {client?.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Service Details</h3>
                      
                      <div className="space-y-2">
                        {service?.duration && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Duration</span>
                            <span className="text-sm font-medium">{service.duration} min</span>
                          </div>
                        )}
                        
                        {service?.price && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Price</span>
                            <span className="text-sm font-medium">${service.price}</span>
                          </div>
                        )}
                        
                        {service?.description && (
                          <div className="pt-2 mt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}