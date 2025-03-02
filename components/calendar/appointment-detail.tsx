'use client';

import { useState } from 'react';
import { Appointment } from '@/types';
import { services, clients, users } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Clock, X, ChevronDown, Pencil, MoreHorizontal } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AppointmentDetailViewProps {
  appointment: Appointment;
  onClose: () => void;
}

export function AppointmentDetailView({ appointment, onClose }: AppointmentDetailViewProps) {
  const [status, setStatus] = useState<Appointment['status']>(appointment.status);
  const [comment, setComment] = useState(appointment.comment || '');
  
  const service = services.find(s => s.id === appointment.serviceId);
  const client = clients.find(c => c.id === appointment.clientId);
  const employee = users.find(u => u.id === appointment.employeeId);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };
  
  const statusButtons = [
    { status: 'Pending', icon: <Clock className="h-4 w-4" />, label: 'Pending' },
    { status: 'Arrived', icon: <Plus className="h-4 w-4" />, label: 'Arrived' },
    { status: 'No-Show', icon: <X className="h-4 w-4" />, label: 'No-Show' },
    { status: 'Confirmed', icon: <Check className="h-4 w-4" />, label: 'Confirmed' },
  ];

  const handleStatusChange = (newStatus: Appointment['status']) => {
    setStatus(newStatus);
    toast.success(`Status changed to ${newStatus}`);
  };

  const handleSave = () => {
    toast.success('Appointment updated');
    onClose();
  };
  
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Left Column */}
      <div>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 mr-3">
            {employee?.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-full h-full rounded-full"
              />
            ) : (
              <span>{employee?.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{employee?.name}</h3>
            <p className="text-sm text-slate-500">{employee?.role}</p>
          </div>
        </div>
        
        <div className="bg-slate-100 rounded-lg p-3 mb-4">
          <div className="flex items-center text-sm mb-1">
            <span className="font-medium">{formatDate(appointment.date)}</span>
            <span className="mx-2">•</span>
            <span>{appointment.startTime}-{appointment.endTime}</span>
            <span className="mx-2">•</span>
            <span>{service?.duration} min</span>
          </div>
        </div>
        
        {/* Status buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusButtons.map((button) => (
            <Button
              key={button.status}
              variant={status === button.status ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => handleStatusChange(button.status as Appointment['status'])}
            >
              {button.icon}
              <span>{button.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Service details */}
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              {service?.name} <span className="mx-1">•</span> {service?.duration} min
            </span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
          <div className="flex items-center justify-between font-medium">
            <span>{service?.price.toLocaleString()} ₸</span>
          </div>
        </div>
        
        {/* Payment and amount */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span>Amount to pay</span>
            <span className="font-medium">{service?.price.toLocaleString()} ₸</span>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2">
              <span>Pay</span>
            </Button>
          </div>
        </div>
        
        {/* Pinned fields */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Pinned fields</h4>
          </div>
          <div className="mb-2">
            <Label className="text-sm text-slate-500 mb-1 block">Comment</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              placeholder="Add a comment..."
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button variant="outline" className="text-xs h-auto py-2">
            <div className="flex flex-col items-center">
              <span>Advanced</span>
              <span>fields</span>
            </div>
          </Button>
          <Button variant="outline" className="text-xs h-auto py-2">
            <div className="flex flex-col items-center">
              <span>Repeat</span>
              <span>appointment</span>
            </div>
          </Button>
          <Button variant="outline" className="text-xs h-auto py-2">
            <div className="flex flex-col items-center">
              <span>Appointment</span>
              <span>notifications</span>
            </div>
          </Button>
          <Button variant="outline" className="text-xs h-auto py-2">
            <div className="flex flex-col items-center">
              <span>Consumables</span>
              <span>write-off</span>
            </div>
          </Button>
        </div>
        
        <Button variant="outline" className="w-full flex justify-center items-center gap-2 text-xs mb-1">
          <span>Change history</span>
        </Button>
      </div>
      
      {/* Right Column */}
      <div className="border-l pl-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">
            <Button variant="ghost" size="sm" className="text-slate-500">
              Change appointment client
            </Button>
          </h4>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className="font-medium">{client?.name}</div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-slate-500 mb-1">{client?.phone}</div>
          <div className="text-sm text-slate-500 mb-3">{client?.email}</div>
          
          <Button variant="outline" className="w-full mb-3 bg-green-500 text-white hover:bg-green-600 gap-2">
            <span>CHAT ON WHATSAPP</span>
          </Button>
          
          <div className="flex justify-center mb-3">
            <Button variant="outline" className="w-full">
              <span>Visit history</span>
            </Button>
          </div>
          
          <div className="bg-blue-50 text-blue-800 rounded-lg p-2 text-center text-sm mb-4">
            New client
          </div>
        </div>
        
        {/* Client notes */}
        <div className="mb-6">
          <h4 className="font-medium text-sm mb-2">Notes about the client</h4>
          <div className="text-sm text-slate-500">
            {client?.notes || '-'}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-4">
            <Checkbox id="visitor" />
            <Label htmlFor="visitor" className="text-sm">
              Appointment for another visitor
            </Label>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="mb-6">
          <h4 className="font-medium text-sm mb-3">Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Last visit</div>
            <div className="text-right">{client?.lastVisit ? formatDate(client.lastVisit) : '-'}</div>
            <div>Total visits</div>
            <div className="text-right">{client?.totalVisits || 0}</div>
          </div>
        </div>
        
        {/* Appointment data */}
        <div className="mb-6">
          <h4 className="font-medium text-sm mb-3">Appointment data</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="grid grid-cols-2">
              <div>Date of creation</div>
              <div className="text-right">24.02 23:12</div>
            </div>
            <div className="grid grid-cols-2">
              <div>Source</div>
              <div className="text-right">"Company form" new widget</div>
            </div>
            <div className="grid grid-cols-2">
              <div>Type</div>
              <div className="text-right">Mobile phone</div>
            </div>
            <div className="grid grid-cols-2">
              <div>Website</div>
              <div className="text-right text-blue-500">app.alteg.io/</div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between">
          <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-2">
            <span>Delete appointment</span>
          </Button>
          <Button 
            variant="default" 
            className="bg-amber-400 hover:bg-amber-500 text-black gap-2"
            onClick={handleSave}
          >
            <span>Save appointment</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Временно добавляем компонент Plus
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}