'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Appointment, Service, Client, User, AppointmentStatus } from '@/types';
import { getService, getClient, getUser, updateAppointmentStatus } from '@/lib/api';
import { 
  Calendar, 
  Edit, 
  ChevronDown,
  MessageSquare,
  X,
  Clock,
  Check,
  Minus,
  LayoutList,
  Repeat,
  Bell,
  Package,
  History,
  User as UserIcon,
  Phone,
  Trash2,
  Pencil
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Custom styles to create an 80% scale look at 100% zoom
const scaledStyles = {
  container: "text-sm", // Base text size reduced
  panel: "w-[240px]", // Side panels width reduced from 300px
  panelPadding: "p-4", // Reduced padding from p-6
  heading: "text-base font-medium", // Reduced from text-lg
  subheading: "text-xs font-medium", // Reduced from text-sm
  text: "text-xs", // Reduced normal text
  smallText: "text-[10px]", // Very small text
  button: "text-xs py-1 px-2", // Smaller buttons
  iconSize: "h-3.5 w-3.5", // Smaller icons
  largeIconSize: "h-4 w-4", // For primary icons
  card: "p-3 rounded-md", // Reduced card padding
  inputHeight: "h-8", // Smaller input heights
  statusButton: "text-xs py-0.5 px-2", // Smaller status buttons
  avatar: "w-8 h-8", // Smaller avatar size
  actionButton: "text-xs py-1.5", // Footer buttons
};

interface AppointmentDetailProps {
  appointment: Appointment;
  onClose: () => void;
}

// Client Info Panel Component
const ClientInfoPanel = ({ 
  client, 
  employee, 
  appointment, 
  isEditMode, 
  setIsEditMode, 
  comment, 
  setComment,
  editFormData,
  setEditFormData,
  handleSaveEdit 
}) => {
  
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  
  const clearTime = (field) => {
    setEditFormData(prev => ({ ...prev, [field]: '' }));
  };
  
  return (
    <div className={`${scaledStyles.panel} border-r border-gray-200 overflow-y-auto ${scaledStyles.panelPadding}`}>
      {isEditMode ? (
        /* Edit mode form */
        <div className="bg-gray-100 rounded-md p-3 mb-4">
          <div className="mb-3">
            <p className={`${scaledStyles.smallText} text-gray-500 mb-1`}>Employee</p>
            <div className="relative">
              <div className="relative w-full">
                <input 
                  type="text" 
                  value={editFormData.employee}
                  readOnly
                  className={`w-full p-1.5 pr-6 border border-gray-300 rounded-md bg-white text-gray-800 ${scaledStyles.text} ${scaledStyles.inputHeight}`}
                  aria-label="Select employee"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <p className={`${scaledStyles.smallText} text-gray-500 mb-1`}>Date</p>
            <div className="relative">
              <input 
                type="date" 
                value={editFormData.date}
                onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`w-full p-1.5 pr-6 border border-gray-300 rounded-md text-blue-600 ${scaledStyles.text} ${scaledStyles.inputHeight} appearance-none`} 
                aria-label="Appointment date"
              />
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="mb-3">
            <p className={`${scaledStyles.smallText} text-gray-500 mb-1`}>Time and duration</p>
            <div className="flex space-x-1.5">
              <div className="relative flex-1">
                <input 
                  type="time" 
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className={`w-full p-1.5 pr-6 border border-gray-300 rounded-md text-blue-600 ${scaledStyles.text} ${scaledStyles.inputHeight} appearance-none`} 
                  aria-label="Start time"
                />
                <button 
                  type="button"
                  onClick={() => clearTime('startTime')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear start time"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="relative flex-1">
                <input 
                  type="time" 
                  value={editFormData.endTime}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className={`w-full p-1.5 pr-6 border border-gray-300 rounded-md text-blue-600 ${scaledStyles.text} ${scaledStyles.inputHeight} appearance-none`} 
                  aria-label="End time"
                />
                <button 
                  type="button"
                  onClick={() => clearTime('endTime')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear end time"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="mt-1.5 relative">
              <div className="relative w-full">
                <input
                  type="text"
                  value={editFormData.duration}
                  readOnly
                  className={`w-full p-1.5 pr-6 border border-gray-300 rounded-md bg-white text-gray-800 ${scaledStyles.text} ${scaledStyles.inputHeight}`}
                  aria-label="Select duration"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button
              variant="ghost"
              size="sm"
              className={`${scaledStyles.button} text-gray-700 h-7`}
              onClick={() => setIsEditMode(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              className={`${scaledStyles.button} bg-blue-500 hover:bg-blue-600 text-white px-4 h-7`}
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        /* View mode card */
        <div className="bg-gray-100 rounded-md p-3 mb-4">
          <div className="flex items-start">
            <div className={`${scaledStyles.avatar} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2`}>
              <UserIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className={`font-medium ${scaledStyles.heading} text-gray-800`}>{client?.name || 'Client Name'}</h3>
              <p className={`${scaledStyles.smallText} text-gray-500`}>Client</p>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center mb-0.5">
              <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
              <span className={`font-medium ${scaledStyles.text}`}>{appointment.date || '2025-03-12'}</span>
            </div>
            <p className={`${scaledStyles.smallText} text-gray-500 ml-5`}>
              {appointment.startTime || '09:30'}-{appointment.endTime || '10:30'} · {editFormData.duration.split(' ')[0]}
            </p>
          </div>
          
          <div className="flex justify-center mt-3">
            <Button
              variant="ghost"
              size="sm"
              className={`${scaledStyles.button} text-gray-500 flex items-center h-6`}
              onClick={toggleEditMode}
              aria-label="Edit appointment"
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      )}

      <div>
        <h4 className={`${scaledStyles.smallText} uppercase text-gray-500 mb-1.5`}>Pinned fields</h4>
        <div className="border-t border-gray-200 pt-1.5">
          <p className={`${scaledStyles.smallText} text-gray-500 mb-1`}>Comment</p>
          <Textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comment..." 
            className={`w-full h-24 ${scaledStyles.text} mt-1 resize-none border-gray-200`}
            aria-label="Appointment comment"
          />
        </div>
      </div>
    </div>
  );
};

// Service Details Panel Component
const ServiceDetailsPanel = ({ 
  service, 
  employee, 
  status, 
  setStatus,
  appointment 
}) => {
  
  const handleStatusChange = async (newStatus) => {
    // Optimistic update
    const previousStatus = status;
    setStatus(newStatus);
    
    try {
      await updateAppointmentStatus(appointment.id, newStatus);
    } catch (error) {
      // Revert on failure
      setStatus(previousStatus);
      console.error('Error updating appointment status:', error);
    }
  };
  
  return (
    <div className="flex-1 border-r border-gray-200 overflow-y-auto">
      <div className={scaledStyles.panelPadding}>
        {/* Status buttons */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <Button 
            variant={status === 'Pending' ? 'default' : 'outline'} 
            size="sm" 
            className={`rounded-md h-7 ${scaledStyles.statusButton} ${status === 'Pending' ? 'bg-gray-700 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
            onClick={() => handleStatusChange('Pending')}
            aria-pressed={status === 'Pending'}
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Button>
          
          <Button 
            variant={status === 'Arrived' ? 'default' : 'outline'} 
            size="sm" 
            className={`rounded-md h-7 ${scaledStyles.statusButton} ${status === 'Arrived' ? 'bg-green-500 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
            onClick={() => handleStatusChange('Arrived')}
            aria-pressed={status === 'Arrived'}
          >
            <Check className="h-3 w-3 mr-1" />
            Arrived
          </Button>
          
          <Button 
            variant={status === 'No-Show' ? 'default' : 'outline'} 
            size="sm" 
            className={`rounded-md h-7 ${scaledStyles.statusButton} ${status === 'No-Show' ? 'bg-red-500 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
            onClick={() => handleStatusChange('No-Show')}
            aria-pressed={status === 'No-Show'}
          >
            <Minus className="h-3 w-3 mr-1" />
            No-Show
          </Button>
          
          <Button 
            variant={status === 'Confirmed' ? 'default' : 'outline'} 
            size="sm" 
            className={`rounded-md h-7 ${scaledStyles.statusButton} ${status === 'Confirmed' ? 'bg-blue-500 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
            onClick={() => handleStatusChange('Confirmed')}
            aria-pressed={status === 'Confirmed'}
          >
            <Check className="h-3 w-3 mr-1" />
            Confirmed
          </Button>
        </div>

        {/* Service card */}
        <div className="border border-gray-200 rounded-md p-3 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center">
              <span className={`text-gray-700 ${scaledStyles.text}`}>{employee?.name || 'Employee'} · {appointment.duration || '1 h.'}</span>
            </div>
            <div className="flex items-center">
              <span className={`text-base font-medium mr-0.5`}>{service?.price || '3000'}</span>
              <span className="text-base">₺</span>
              <button className="ml-2 text-gray-400" aria-label="Show service options">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className={`${scaledStyles.text} text-gray-700 font-medium`}>{service?.name || 'Haircut'}</div>
        </div>
        
        {/* Payment amount */}
        <div className="flex items-center justify-between mb-5">
          <span className={`text-gray-600 ${scaledStyles.text}`}>Amount to pay</span>
          <div className="flex items-center">
            <span className="font-medium mr-0.5">{service?.price || '3000'}</span>
            <span>₺</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-3 border-yellow-300 text-gray-700 rounded-full h-6 px-3 text-xs"
            >
              Pay
            </Button>
          </div>
        </div>
        
        {/* Services search */}
        <div className="mb-5">
          <div className="flex items-center border border-gray-300 rounded-md mb-3 h-8">
            <button className={`px-2.5 py-1.5 text-gray-700 font-medium flex items-center ${scaledStyles.text}`} aria-label="Filter services">
              Services
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
            <Input 
              placeholder="Search"
              className={`border-0 flex-1 h-full ${scaledStyles.text}`}
              aria-label="Search services"
            />
          </div>
          
          <p className={`${scaledStyles.smallText} text-gray-500 mb-2`}>Popular services: {employee?.name || 'Employee'}</p>
          
          {/* Service item */}
          <div className="border border-gray-200 rounded-md p-2.5 mb-3">
            <h3 className={`font-medium text-gray-800 ${scaledStyles.text}`}>{service?.name || 'Haircut'}</h3>
            <div className="flex justify-between mt-1">
              <p className={`text-gray-500 ${scaledStyles.text}`}>{service?.price || '3000'} ₺</p>
              <p className={`text-gray-500 ${scaledStyles.text}`}>1 h.</p>
            </div>
          </div>
          
          <h4 className={`${scaledStyles.text} font-medium mb-1.5`}>All services</h4>
          <div className="border border-gray-200 rounded-md p-2.5 flex items-center justify-between text-gray-600">
            <span className={scaledStyles.text}>women's haircut</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </div>
        
        {/* Statistics */}
        <div className="mb-4">
          <h3 className={`font-medium mb-1.5 ${scaledStyles.text}`}>Statistics</h3>
          <div className="flex justify-between mb-1">
            <span className={`text-gray-500 ${scaledStyles.smallText}`}>Total visits</span>
            <span className={scaledStyles.smallText}>1</span>
          </div>
        </div>
        
        {/* Appointment data */}
        <div>
          <h3 className={`font-medium mb-1.5 ${scaledStyles.text}`}>Appointment data</h3>
          <div className="flex justify-between mb-1">
            <span className={`text-gray-500 ${scaledStyles.smallText}`}>Date of creation</span>
            <span className={scaledStyles.smallText}>12.03 13:26</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className={`text-gray-500 ${scaledStyles.smallText}`}>Source</span>
            <span className={scaledStyles.smallText}>"Company form" new widget</span>
          </div>
        </div>
        
        {/* Visitor checkbox */}
        <div className="mt-4 flex items-center">
          <Checkbox id="visitor" className="h-3 w-3" />
          <label htmlFor="visitor" className={`ml-1.5 ${scaledStyles.text} text-gray-700`}>
            Appointment for another visitor
          </label>
        </div>
      </div>
    </div>
  );
};

// Client Actions Panel Component
const ClientActionsPanel = ({ client }) => {
  return (
    <div className={`${scaledStyles.panel}`}>
      <div className={scaledStyles.panelPadding}>
        <div className="mb-4">
          <h3 className={`flex items-center text-gray-700 font-medium mb-2 ${scaledStyles.text}`}>
            <ChevronDown className="h-3 w-3 mr-1.5 rotate-90" />
            Change appointment client
          </h3>
          
          <div className="mb-4">
            <p className={`${scaledStyles.smallText} text-gray-500 mb-1`}>Client Phone</p>
            <div className="flex items-center justify-between">
              <p className={`text-base font-medium`}>{client?.phone || '+77474894939'}</p>
              <div className="flex space-x-1">
                <button className="text-gray-400 hover:text-gray-600" aria-label="Edit phone">
                  <Pencil className="h-3 w-3" />
                </button>
                <button className="text-gray-400 hover:text-gray-600" aria-label="Show options">
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              className={`w-full bg-green-500 hover:bg-green-600 text-white h-10 text-sm`}
              aria-label="Chat on WhatsApp"
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              CHAT ON WHATSAPP
            </Button>
            
            <Button 
              variant="outline" 
              className={`w-full border-gray-200 text-gray-700 h-8 ${scaledStyles.text}`}
              aria-label="View visit history"
            >
              <History className="h-3 w-3 mr-1.5" />
              Visit history
            </Button>
            
            <Button
              variant="outline"
              className={`w-full border-gray-200 text-blue-600 h-8 ${scaledStyles.text}`}
              aria-label="Create new client"
            >
              New client
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className={`text-gray-700 font-medium mb-1.5 ${scaledStyles.text}`}>Notes about the client</h3>
          <p className={`text-gray-500 ${scaledStyles.text}`}>-</p>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const AppointmentSkeleton = () => {
  return (
    <div className={`h-full flex flex-col ${scaledStyles.container}`}>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className={`${scaledStyles.panel} border-r border-gray-200 ${scaledStyles.panelPadding}`}>
          <div className="bg-gray-100 rounded-md p-3 mb-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-md mb-3"></div>
            <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-1.5"></div>
            <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
          </div>
          <div className="h-24 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
        
        <div className="flex-1 border-r border-gray-200 p-4">
          <div className="flex gap-1.5 mb-5">
            <div className="h-7 bg-gray-200 rounded-md w-20 animate-pulse"></div>
            <div className="h-7 bg-gray-200 rounded-md w-20 animate-pulse"></div>
            <div className="h-7 bg-gray-200 rounded-md w-20 animate-pulse"></div>
          </div>
          
          <div className="border border-gray-200 rounded-md p-3 mb-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded-md w-full mb-1.5"></div>
            <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
          </div>
          
          <div className="h-7 bg-gray-100 rounded-md w-full mb-5 animate-pulse"></div>
          <div className="h-72 bg-gray-100 rounded-md w-full animate-pulse"></div>
        </div>
        
        <div className={`${scaledStyles.panel} ${scaledStyles.panelPadding}`}>
          <div className="h-52 bg-gray-100 rounded-md animate-pulse mb-4"></div>
          <div className="h-24 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="h-8 bg-gray-200 rounded-md w-full animate-pulse"></div>
      </div>
    </div>
  );
};

// Main component
export function AppointmentDetailView({ appointment, onClose }: AppointmentDetailProps) {
  const [service, setService] = useState<Service | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [comment, setComment] = useState(appointment.comment || '');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Consolidated edit form state
  const [editFormData, setEditFormData] = useState({
    employee: '',
    date: appointment.date || '2025-03-12',
    startTime: appointment.startTime || '09:30',
    endTime: appointment.endTime || '10:30',
    duration: '1 h.'
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all related data in parallel
        const [serviceData, clientData, employeeData] = await Promise.all([
          getService(appointment.serviceId),
          getClient(appointment.clientId),
          getUser(appointment.employeeId)
        ]);
        
        setService(serviceData);
        setClient(clientData);
        setEmployee(employeeData);
        setEditFormData(prev => ({
          ...prev,
          employee: employeeData?.name || 'asdasd'
        }));
      } catch (error) {
        console.error('Error fetching appointment data:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appointment]);
  
  const handleSaveEdit = () => {
    // Here you would typically update the appointment data via API
    console.log('Saving appointment with:', editFormData);
    
    setIsEditMode(false);
    // In a real implementation, you would update the appointment here
    // and refresh the data after successful update
  };
  
  if (isLoading) {
    return <AppointmentSkeleton />;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center h-full flex items-center justify-center">
        <p className="text-red-500 text-sm">Error loading appointment details. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className={`h-full flex flex-col overflow-hidden ${scaledStyles.container}`}>
      {/* Main content - 3 column layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left column - Client info */}
        <ClientInfoPanel 
          client={client}
          employee={employee}
          appointment={appointment}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          comment={comment}
          setComment={setComment}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          handleSaveEdit={handleSaveEdit}
        />
        
        {/* Middle column - Service details */}
        <ServiceDetailsPanel 
          service={service}
          employee={employee}
          status={status}
          setStatus={setStatus}
          appointment={appointment}
        />
        
        {/* Right column - Client actions */}
        <ClientActionsPanel client={client} />
      </div>
      
      {/* Button controls at bottom */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-gray-50 border-t border-gray-200">
        <Button variant="outline" className={`justify-center items-center border-gray-200 text-gray-700 h-7 ${scaledStyles.text}`}>
          <LayoutList className="h-3 w-3 mr-1.5" />
          <span>Advanced fields</span>
        </Button>
        
        <Button variant="outline" className={`justify-center items-center border-gray-200 text-gray-700 h-7 ${scaledStyles.text}`}>
          <Repeat className="h-3 w-3 mr-1.5" />
          <span>Repeat appointment</span>
        </Button>
        
        <Button variant="outline" className={`justify-center items-center border-gray-200 text-gray-700 h-7 ${scaledStyles.text}`}>
          <Bell className="h-3 w-3 mr-1.5" />
          <span>Appointment notifications</span>
        </Button>
        
        <Button variant="outline" className={`justify-center items-center border-gray-200 text-gray-700 h-7 ${scaledStyles.text}`}>
          <Package className="h-3 w-3 mr-1.5" />
          <span>Consumables write-off</span>
        </Button>
        
        <Button variant="outline" className={`justify-center items-center border-gray-200 text-gray-700 h-7 md:col-span-4 ${scaledStyles.text}`}>
          <History className="h-3 w-3 mr-1.5" />
          <span>Change history</span>
        </Button>
      </div>
      
      {/* Footer with action buttons */}
      <div className="flex justify-between items-center p-3 border-t border-gray-200">
        <Button 
          variant="outline" 
          className={`border-red-100 text-red-600 hover:bg-red-50 h-7 ${scaledStyles.text}`}
          aria-label="Delete appointment"
        >
          <Trash2 className="h-3 w-3 mr-1.5" />
          Delete appointment
        </Button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close appointment details"
          >
            <X className="h-4 w-4" />
          </button>
          
          <Button
            className={`bg-yellow-500 hover:bg-yellow-600 text-white h-7 ${scaledStyles.text}`}
            aria-label="Save appointment"
          >
            <Check className="h-3 w-3 mr-1.5" />
            Save appointment
          </Button>
        </div>
      </div>
    </div>
  );
}