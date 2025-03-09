'use client';

import { useState, useEffect } from 'react';
import { Appointment, Service, Client, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Mail, 
  Phone, 
  History,
  Pencil,
  MoreHorizontal,
  Trash2,
  MessageCircle,
  X
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar-fallback';
import { getService, getClient, getUser, updateAppointmentStatus } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AppointmentDetailViewProps {
  appointment: Appointment;
  onClose: () => void;
}

export function AppointmentDetailView({ appointment, onClose }: AppointmentDetailViewProps) {
  const [status, setStatus] = useState<Appointment['status']>(appointment.status);
  const [service, setService] = useState<Service | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointment');
  const [notes, setNotes] = useState(appointment.comment || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointment.serviceId, appointment.clientId, appointment.employeeId]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const handleStatusChange = async (newStatus: Appointment['status']) => {
    if (newStatus === status) return;
    
    setStatus(newStatus);
    setHasChanges(true);
    
    toast({
      title: "Status updated",
      description: `Appointment status changed to ${newStatus}`
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Track if we made any changes
      let madeChanges = false;
      
      // Save status change to backend
      if (status !== appointment.status) {
        await updateAppointmentStatus(appointment.id, status);
        // Update the appointment object with new status to make it available
        // to other components
        appointment.status = status;
        madeChanges = true;
      }
      
      // Here you would also save notes and other changes
      // For example: if (notes !== appointment.comment) { await updateAppointmentNotes(appointment.id, notes); }
      
      toast({
        title: "Appointment updated",
        description: "Your changes have been saved successfully"
      });
      
      // Close the dialog after successful save
      setTimeout(() => {
        onClose();
        // This timeout gives toast time to appear before dialog closes
      }, 500);
    } catch (error) {
      console.error('Error saving appointment changes:', error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Content for each tab
  const tabContent = {
    appointment: (
      <div className="space-y-6">
        {/* Status buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium mb-2">Status</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries({
              'Pending': 'bg-yellow-500',
              'Arrived': 'bg-green-500',
              'No-Show': 'bg-red-500',
              'Confirmed': 'bg-blue-500'
            }).map(([key, color]) => (
              <Button
                key={key}
                variant={status === key ? "default" : "outline"}
                size="sm"
                className={cn(
                  status === key && color,
                  status === key && "relative",
                  status === key && "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-t-current after:border-x-transparent after:border-b-transparent",
                )}
                onClick={() => handleStatusChange(key as Appointment['status'])}
              >
                {key}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Service details section - Adding more content for the appointment tab */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-4">
          <h3 className="text-sm font-medium mb-3">Service Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Service Name</p>
              <p className="font-medium">{service?.name || 'Unknown Service'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Price</p>
              <p className="font-medium">${service?.price || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duration</p>
              <p className="font-medium">{service?.duration || '--'} minutes</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Category</p>
              <p className="font-medium">{service?.category || '--'}</p>
            </div>
          </div>
          {service?.description && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Description</p>
              <p className="text-sm">{service.description}</p>
            </div>
          )}
        </div>
        
        {/* Notes section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Notes</h3>
          <Textarea
            placeholder="Add notes about this appointment..."
            className="h-32 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    ),
    client: (
      <div className="space-y-4">
        {/* Client header with name and actions */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{client?.name || 'Unknown Client'}</h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Client contact info */}
            <div className="space-y-1">
              {client?.email && (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  <span>{client.email}</span>
                </div>
              )}
              {client?.phone && (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
            
            {/* WhatsApp button */}
            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              CHAT ON WHATSAPP
            </Button>
            
            {/* Visit history button */}
            <Button 
              variant="secondary" 
              className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white mt-2"
            >
              <History className="h-4 w-4 mr-2" />
              Visit History
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Client statistics */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Client Statistics</h3>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-sm text-slate-500 dark:text-slate-400">Last visit</div>
                <div className="text-sm text-right font-medium">
                  {client?.lastVisit ? formatDate(client.lastVisit) : 'Feb 25'}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Total visits</div>
                <div className="text-sm text-right font-medium">
                  {client?.totalVisits || 1}
                </div>
              </div>
            </div>
            
            {/* Client notes */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Client Notes</h4>
              <div className="text-sm p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                {client?.notes || '-'}
              </div>
            </div>
            
            {/* Appointment for another visitor */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="visitor" />
              <label htmlFor="visitor" className="text-sm">
                Appointment for another visitor
              </label>
            </div>
          </div>
        </div>
      </div>
    ),
    actions: (
      <div className="space-y-6">
        {/* Actions content */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-4">
            <h3 className="text-sm font-medium mb-3">Appointment Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                Create Recurring
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-4">
            <h3 className="text-sm font-medium mb-3">Advanced Options</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Advanced Fields
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Appointment History
              </Button>
            </div>
          </div>
        </div>
        
        {/* Appointment info */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-4">
          <h3 className="text-sm font-medium mb-3">Appointment Information</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-slate-500 dark:text-slate-400">Date Created</div>
            <div className="text-right">24 Feb 2023, 23:12</div>
            <div className="text-slate-500 dark:text-slate-400">Booking Source</div>
            <div className="text-right">Company Form</div>
            <div className="text-slate-500 dark:text-slate-400">Created By</div>
            <div className="text-right">Website</div>
            <div className="text-slate-500 dark:text-slate-400">Last Modified</div>
            <div className="text-right">24 Feb 2023, 23:15</div>
          </div>
        </div>
      </div>
    )
  };
  
  // Fixed CSS with properly defined hover state that works in both light and dark mode
  const tabButtonClasses = (isActive: boolean) => cn(
    "w-full py-3 px-4 text-left rounded mb-1 transition-colors text-sm",
    isActive 
      ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white" 
      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
  );

  return (
    <div className="flex h-[80vh] bg-slate-900 dark:bg-slate-900 bg-white text-slate-900 dark:text-white w-full">
      {/* Left Sidebar with tabs and header */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 bg-slate-100 dark:bg-slate-900">
        {/* Avatar and header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-2">
            <Avatar
              src={employee?.avatar}
              name={employee?.name || 'Staff'}
              className="w-10 h-10"
            />
            <div className="flex-1">
              <h2 className="text-base font-medium truncate text-slate-900 dark:text-white">{service?.name || 'Appointment'}</h2>
              <Badge className="bg-blue-500 text-white mt-1">
                {status}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1.5" />
              <span>Mar 5</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1.5" />
              <span>{appointment.startTime} - {appointment.endTime}</span>
            </div>
            <div className="flex items-center">
              <UserIcon className="h-3 w-3 mr-1.5" />
              <span>{employee?.name || 'Unknown staff'}</span>
            </div>
          </div>
        </div>
        
        {/* Vertical Tab Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-1">
            {['appointment', 'client', 'actions'].map((tab) => (
              <button
                key={tab}
                className={tabButtonClasses(activeTab === tab)}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Footer with Delete button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <Button variant="destructive" className="w-full gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">{activeTab}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tabContent[activeTab as keyof typeof tabContent]}
        </div>
      </div>
    </div>
  );
}