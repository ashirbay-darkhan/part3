'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  Edit2Icon, 
  MoreHorizontal, 
  PhoneIcon, 
  History, 
  MessageSquare,
  CheckCircle,
  XCircle,
  UserIcon,
  Repeat,
  Clipboard,
  Bell,
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { format } from 'date-fns';
import { Appointment, AppointmentStatus, Client, Service } from '@/types';
import { 
  getClient, 
  getService, 
  updateAppointment, 
  updateAppointmentStatus,
  deleteAppointment
} from '@/lib/api';
import { Avatar } from '@/components/ui/avatar-fallback';
import { cn } from '@/lib/utils';

interface AppointmentDetailProps {
  appointment: Appointment;
  onClose: () => void;
}

export function AppointmentDetailView({ appointment, onClose }: AppointmentDetailProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState(appointment.comment || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isForAnotherVisitor, setIsForAnotherVisitor] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Section expand states
  const [expandedSections, setExpandedSections] = useState({
    services: true,
    clientInfo: false,
    appointmentData: false,
    statistics: false
  });

  // Toggle section expand/collapse
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch appointment details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch client and service data in parallel
        const [clientData, serviceData] = await Promise.all([
          getClient(appointment.clientId),
          getService(appointment.serviceId)
        ]);
        
        setClient(clientData);
        setService(serviceData);
        setComment(appointment.comment || '');
      } catch (error) {
        console.error('Error fetching appointment details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointment]);

  // Handle status change
  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      setStatus(newStatus);
      await updateAppointmentStatus(appointment.id, newStatus);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  // Handle comment change and save
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      await updateAppointment(appointment.id, {
        comment,
        status
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle appointment deletion
  const handleDeleteAppointment = async () => {
    try {
      setIsDeleting(true);
      await deleteAppointment(appointment.id);
      onClose();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setIsDeleting(false);
    }
  };

  // Format appointment date
  const appointmentDate = appointment.date ? new Date(appointment.date) : new Date();
  const formattedDate = format(appointmentDate, 'dd MMMM');
  const formattedTime = `${appointment.startTime}-${appointment.endTime}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading appointment details...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Status bar at top */}
      <div className="p-4 flex items-center justify-between border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button
            variant={status === 'Pending' ? 'default' : 'outline'}
            size="sm"
            className={status === 'Pending' ? 'bg-gray-800' : 'bg-white'}
            onClick={() => handleStatusChange('Pending')}
          >
            <ClockIcon className="w-4 h-4 mr-1" /> Pending
          </Button>
          
          <Button
            variant={status === 'Arrived' ? 'default' : 'outline'}
            size="sm"
            className={status === 'Arrived' ? 'bg-green-600' : 'bg-white'}
            onClick={() => handleStatusChange('Arrived')}
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Arrived
          </Button>
          
          <Button
            variant={status === 'No-Show' ? 'default' : 'outline'}
            size="sm"
            className={status === 'No-Show' ? 'bg-red-600' : 'bg-white'}
            onClick={() => handleStatusChange('No-Show')}
          >
            <XCircle className="w-4 h-4 mr-1" /> No-Show
          </Button>
          
          <Button
            variant={status === 'Confirmed' ? 'default' : 'outline'}
            size="sm"
            className={status === 'Confirmed' ? 'bg-blue-600' : 'bg-white'}
            onClick={() => handleStatusChange('Confirmed')}
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Confirmed
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500">
          <XCircle className="w-4 h-4" />
        </Button>
      </div>

      {/* Main content with scrollable area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Client and appointment info */}
        <div className="flex items-center mb-4">
          <Avatar 
            name={client?.name || 'Notion clone'} 
            className="w-10 h-10 mr-3" 
          />
          <div>
            <h2 className="font-medium text-lg">{client?.name || 'Notion clone'}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <PhoneIcon className="w-3.5 h-3.5 mr-1.5" />
              {client?.phone || '+7474748939'}
            </div>
          </div>
        </div>

        {/* Date and time */}
        <div className="mb-4">
          <div className="flex items-center text-gray-700 mb-0.5">
            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">{appointment.date || '2025-03-12'}</span>
          </div>
          <p className="text-gray-500 text-sm ml-6">
            {appointment.startTime || '09:30'} - {appointment.endTime || '10:30'} · 60 min
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-1 text-gray-600 pl-0.5 hover:bg-gray-50"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2Icon className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
        
        {/* Edit form - conditionally displayed */}
        {isEditing && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input 
                  type="date"
                  value={appointment.date}
                  className="w-full p-2 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Duration</label>
                <select className="w-full p-2 text-sm border rounded-md">
                  <option>1 h.</option>
                  <option>1.5 h.</option>
                  <option>2 h.</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                <input 
                  type="time"
                  value={appointment.startTime}
                  className="w-full p-2 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Time</label>
                <input 
                  type="time"
                  value={appointment.endTime}
                  className="w-full p-2 text-sm border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        {/* Service Section */}
        <Collapsible 
          open={expandedSections.services} 
          onOpenChange={() => toggleSection('services')}
          className="mb-4"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm">
            <span>Service</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              expandedSections.services ? "transform rotate-180" : ""
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="border border-gray-200 rounded-md p-4 bg-white">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800">{service?.name || 'Haircut'}</h4>
                <p className="text-gray-800 font-medium">{service?.price || '3000'} ₺</p>
              </div>
              <p className="text-gray-500 text-sm mt-1">1 hour with {client?.name || 'asdasd'}</p>
            </div>
            
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-sm text-gray-600">Amount to pay</span>
              <div className="flex items-center">
                <span className="font-medium mr-2">{service?.price || '3000'} ₺</span>
                <Button variant="outline" size="sm" className="h-7 text-xs">Pay</Button>
              </div>
            </div>

            {/* Popular services */}
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <span className="text-sm">Services</span>
                <Input 
                  placeholder="Search" 
                  className="ml-2 h-7 text-xs" 
                />
              </div>
              
              <p className="text-xs text-gray-500 mb-2">Popular services: Lorem ipsum</p>
              
              <div className="border border-gray-200 rounded-md p-3 mb-2 bg-white">
                <h5 className="font-medium text-sm">{service?.name || 'haircut'}</h5>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{service?.price || '3000'} ₺</span>
                  <span>1 h.</span>
                </div>
              </div>
              
              <p className="text-xs font-medium mt-3 mb-1">All services</p>
              <div className="border border-gray-200 rounded-md p-3 flex items-center justify-between bg-white">
                <span className="text-sm">women's haircut</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Comments Section */}
        <div className="mb-4">
          <h3 className="font-medium text-sm mb-2">Comments</h3>
          <Textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full resize-none h-24 border-gray-200 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1 italic">Comments are saved automatically</p>
        </div>

        {/* Statistics Section */}
        <Collapsible 
          open={expandedSections.statistics} 
          onOpenChange={() => toggleSection('statistics')}
          className="mb-4"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm">
            <span>Statistics</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              expandedSections.statistics ? "transform rotate-180" : ""
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Last visit</p>
                <p>{client?.lastVisit ? format(new Date(client.lastVisit), 'dd.MM HH:mm') : '11.03 17:04'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total visits</p>
                <p>{client?.totalVisits || '0'}</p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Appointment Data Section */}
        <Collapsible 
          open={expandedSections.appointmentData} 
          onOpenChange={() => toggleSection('appointmentData')}
          className="mb-4"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm">
            <span>Appointment data</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              expandedSections.appointmentData ? "transform rotate-180" : ""
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-500">Date of creation</p>
              <p>13.03 07:17</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Source</p>
              <p>"Company form" new widget</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p>Mobile phone</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Website</p>
              <a href="#" className="text-blue-500 hover:underline">app.alteg.io/</a>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tools Section */}
        <div className="mb-4">
          <h3 className="font-medium text-sm mb-2">Tools</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex flex-col items-center">
                <History className="w-4 h-4 text-gray-500 mb-1" />
                <span className="text-xs">Visit history</span>
              </div>
            </div>
            <div className="text-center p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex flex-col items-center">
                <Repeat className="w-4 h-4 text-gray-500 mb-1" />
                <span className="text-xs">Repeat</span>
              </div>
            </div>
            <div className="text-center p-2 bg-white border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex flex-col items-center">
                <Bell className="w-4 h-4 text-gray-500 mb-1" />
                <span className="text-xs">Notifications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Other Visitor Checkbox */}
        <div className="flex items-center mb-4">
          <Checkbox 
            id="anotherVisitor" 
            checked={isForAnotherVisitor}
            onCheckedChange={(checked) => setIsForAnotherVisitor(!!checked)}
            className="mr-2"
          />
          <label htmlFor="anotherVisitor" className="text-sm">
            Appointment for another visitor
          </label>
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="p-4 border-t mt-auto flex justify-between items-center bg-gray-50">
        <Button 
          variant="outline" 
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleDeleteAppointment}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete appointment'}
        </Button>
        
        {isEditing ? (
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        ) : (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </div>
  );
}