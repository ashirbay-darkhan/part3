'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Appointment, Service, Client, User, AppointmentStatus } from '@/types';
import { getService, getClient, getUser, updateAppointmentStatus } from '@/lib/api';

interface AppointmentDetailProps {
  appointment: Appointment;
  onClose: () => void;
}

export function AppointmentDetailView({ appointment, onClose }: AppointmentDetailProps) {
  const [service, setService] = useState<Service | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all related data in parallel
        const [serviceData, clientData, employeeData] = await Promise.all([
          getService(appointment.serviceId),
          getClient(appointment.clientId),
          getUser(appointment.employeeId)
        ]);
        
        setService(serviceData);
        setClient(clientData);
        setEmployee(employeeData);
      } catch (error) {
        console.error('Error fetching appointment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointment]);
  
  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(appointment.id, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };
  
  // Status button with color styling
  const StatusButton = ({ status: buttonStatus, label }: { status: AppointmentStatus; label: string }) => (
    <Button
      variant={buttonStatus === status ? 'default' : 'outline'}
      onClick={() => handleStatusChange(buttonStatus)}
      className={`text-xs ${buttonStatus === status ? 'bg-blue-600' : ''}`}
    >
      {label}
    </Button>
  );
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading appointment details...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Appointment Information</h3>
            <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-3">
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {appointment.date} • {appointment.startTime} - {appointment.endTime}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <StatusButton status="Pending" label="Pending" />
                  <StatusButton status="Confirmed" label="Confirmed" />
                  <StatusButton status="Arrived" label="Arrived" />
                  <StatusButton status="No-Show" label="No-Show" />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Service</h3>
            {service && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-3">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-500">
                    {service.duration} min • ${service.price}
                  </p>
                </div>
                
                {service.description && (
                  <div>
                    <p className="text-sm text-gray-700">{service.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Client</h3>
            {client && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-3">
                <div>
                  <p className="font-medium">{client.name}</p>
                  {client.email && <p className="text-sm">{client.email}</p>}
                  {client.phone && <p className="text-sm">{client.phone}</p>}
                </div>
                
                {client.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm text-gray-700">{client.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Staff</h3>
            {employee && (
              <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-3">
                <div className="flex items-center gap-3">
                  {employee.avatar && (
                    <img 
                      src={employee.avatar} 
                      alt={employee.name} 
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{employee.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t pt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}