'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, isBefore, isAfter, isToday, parseISO } from 'date-fns';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  ChevronRight, 
  CreditCard, 
  Scissors, 
  Check,
  Calendar,
  ArrowLeft,
  PhoneIcon,
  MailIcon,
  LoaderIcon,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Service, User, Business, Appointment } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { getBusiness, getBusinessServices, getBusinessStaff, createAppointmentWithClient } from '@/lib/api';
import { Avatar } from '@/components/ui/avatar-fallback';

type BookingStep = 'service' | 'staff' | 'date' | 'time' | 'details' | 'confirmation';

interface BusinessBookingFormProps {
  businessId: string;
}

export function BusinessBookingForm({ businessId }: BusinessBookingFormProps) {
  const router = useRouter();
  
  // State for the multi-step form
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Business data
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  
  // Selected booking data
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Client details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch business data on component mount
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        // Check if businessId is a numeric ID with 7+ digits (random booking link ID)
        let actualBusinessId = businessId;
        if (/^\d{7,}$/.test(businessId)) {
          // Look for mapping in localStorage
          const storedMapping = localStorage.getItem(`link_id_to_business_${businessId}`);
          if (storedMapping) {
            actualBusinessId = storedMapping;
          } else {
            // Look for personal link mapping
            const allKeys = Object.keys(localStorage);
            let found = false;
            
            for (const key of allKeys) {
              if (key.startsWith('personal_link_')) {
                const storedLinkId = localStorage.getItem(key);
                if (storedLinkId === businessId) {
                  // Extract businessId from the key
                  actualBusinessId = key.replace('personal_link_', '');
                  found = true;
                  break;
                }
              }
            }
            
            if (!found) {
              console.warn('Could not find business ID for link ID:', businessId);
              setErrorMessage('Booking link not found. Please contact the business directly.');
              setIsLoading(false);
              return;
            }
          }
        }
        
        // Ensure businessId is a string
        actualBusinessId = actualBusinessId.toString();
        
        // Fetch business, services and staff
        const [businessData, servicesData, staffData] = await Promise.all([
          getBusiness(actualBusinessId),
          getBusinessServices(actualBusinessId),
          getBusinessStaff(actualBusinessId)
        ]);
        
        // Process data to ensure ID consistency
        const processedBusiness = {
          ...businessData,
          id: businessData.id.toString(),
          ownerId: businessData.ownerId.toString()
        };
        
        const processedServices = servicesData.map(service => ({
          ...service,
          id: service.id.toString(),
          businessId: service.businessId.toString()
        }));
        
        const processedStaff = staffData.map(staff => ({
          ...staff,
          id: staff.id.toString(),
          businessId: staff.businessId.toString(),
          serviceIds: Array.isArray(staff.serviceIds) 
            ? staff.serviceIds.map(id => id.toString()) 
            : []
        }));
        
        setBusiness(processedBusiness);
        setServices(processedServices);
        setStaff(processedStaff);
        
      } catch (error) {
        console.error('Error fetching business data:', error);
        setErrorMessage('Unable to load booking information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinessData();
  }, [businessId]);
  
  // Navigate to next step
  const handleNextStep = () => {
    // Validate current step data before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    // Move to next step based on current step
    const steps: BookingStep[] = ['service', 'staff', 'date', 'time', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };
  
  // Navigate to previous step
  const handlePreviousStep = () => {
    const steps: BookingStep[] = ['service', 'staff', 'date', 'time', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };
  
  // Validate data for current step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'service':
        if (!selectedService) {
          toast({
            title: "Please select a service",
            variant: "destructive"
          });
          return false;
        }
        return true;
        
      case 'staff':
        if (!selectedStaff) {
          toast({
            title: "Please select a staff member",
            variant: "destructive"
          });
          return false;
        }
        return true;
        
      case 'date':
        if (!selectedDate) {
          toast({
            title: "Please select a date",
            variant: "destructive"
          });
          return false;
        }
        return true;
        
      case 'time':
        if (!selectedTime) {
          toast({
            title: "Please select a time slot",
            variant: "destructive"
          });
          return false;
        }
        return true;
        
      case 'details':
        if (!clientName || !clientPhone) {
          toast({
            title: "Please fill in required fields",
            description: "Name and phone number are required",
            variant: "destructive"
          });
          return false;
        }
        // Simple phone validation
        if (!/^\+?[0-9\s-]{10,}$/.test(clientPhone.replace(/\s+/g, ''))) {
          toast({
            title: "Invalid phone number",
            description: "Please enter a valid phone number",
            variant: "destructive"
          });
          return false;
        }
        // Simple email validation if provided
        if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
          toast({
            title: "Invalid email address",
            description: "Please enter a valid email address",
            variant: "destructive"
          });
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };
  
  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };
  
  // Submit booking
  const handleSubmitBooking = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!selectedService || !selectedStaff || !selectedDate || !selectedTime ||
          !clientName || !clientPhone) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Create appointment data with string IDs
      const appointmentData = {
        clientId: 'temp-client-id', // Will be replaced by the API
        serviceId: selectedService.id.toString(),
        employeeId: selectedStaff.id.toString(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        endTime: calculateEndTime(selectedTime, selectedService.duration),
        duration: selectedService.duration,
        status: 'Pending' as const,
        price: selectedService.price,
        businessId: selectedService.businessId.toString(),
        comment: clientNotes || undefined
      };
      
      // Create client data with string businessId
      const clientData = {
        name: clientName,
        phone: clientPhone,
        email: clientEmail || '',
        notes: clientNotes || '',
        businessId: selectedService.businessId.toString()
      };
      
      // Create appointment with client
      await createAppointmentWithClient(appointmentData, clientData);
      
      // Show success message
      toast({
        title: "Booking confirmed!",
        description: "Your appointment has been scheduled. You will receive a confirmation shortly.",
        variant: "default"
      });
      
      // Move to confirmation step
      setCurrentStep('confirmation');
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking failed",
        description: (error as Error).message || "There was a problem creating your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate available time slots for selected date
  const getAvailableTimeSlots = (): string[] => {
    // This is a simplified implementation
    // In a real app, you would check staff availability and existing appointments
    const slots = [];
    
    // Business hours from 9 AM to 6 PM
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) { // Don't add 30 min slot for last hour
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Loading Booking Form</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // If error, show error state
  if (errorMessage) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>{errorMessage}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // If no services found
  if (services.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>{business?.name || 'Business'}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>No services available for booking at this time.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Business header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{business?.name || 'Book Appointment'}</h1>
        <p className="text-muted-foreground">Select your preferences to book an appointment</p>
      </div>
      
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {['service', 'staff', 'date', 'time', 'details'].map((step, index) => (
          <div 
            key={step} 
            className={cn(
              "flex flex-col items-center space-y-1",
              currentStep === step ? "opacity-100" : "opacity-50"
            )}
          >
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                currentStep === step ? "bg-primary text-primary-foreground" : 
                  index < ['service', 'staff', 'date', 'time', 'details'].indexOf(currentStep) 
                  ? "bg-primary/80 text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {index + 1}
            </div>
            <span className="text-xs capitalize hidden sm:block">{step}</span>
          </div>
        ))}
      </div>
      
      {/* Main form content */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {currentStep === 'service' && 'Select Service'}
            {currentStep === 'staff' && 'Choose Staff Member'}
            {currentStep === 'date' && 'Select Date'}
            {currentStep === 'time' && 'Choose Time Slot'}
            {currentStep === 'details' && 'Your Information'}
            {currentStep === 'confirmation' && 'Booking Confirmed!'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Service selection step */}
          {currentStep === 'service' && (
            <div className="grid gap-4">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className={cn(
                    "border rounded-md p-4 cursor-pointer transition-colors",
                    selectedService?.id === service.id 
                      ? "border-primary bg-primary/5" 
                      : "hover:border-primary/50"
                  )}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        {service.duration} min • ${service.price}
                      </div>
                      {service.description && (
                        <p className="text-sm mt-2">{service.description}</p>
                      )}
                    </div>
                    {selectedService?.id === service.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Staff selection step */}
          {currentStep === 'staff' && (
            <div className="grid gap-4 md:grid-cols-2">
              {staff
                .filter(person => 
                  // Only show staff that can provide the selected service
                  !selectedService?.id || 
                  (person.serviceIds && person.serviceIds.includes(selectedService.id))
                )
                .map((person) => (
                  <div 
                    key={person.id}
                    className={cn(
                      "border rounded-md p-4 cursor-pointer transition-colors",
                      selectedStaff?.id === person.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-primary/50"
                    )}
                    onClick={() => setSelectedStaff(person)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar 
                        src={person.avatar} 
                        name={person.name}
                        className="h-10 w-10" 
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{person.name}</h3>
                      </div>
                      {selectedStaff?.id === person.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              
              {staff.filter(person => 
                !selectedService?.id || 
                (person.serviceIds && person.serviceIds.includes(selectedService.id))
              ).length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No staff members available for the selected service.
                </div>
              )}
            </div>
          )}
          
          {/* Date selection step */}
          {currentStep === 'date' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-lg font-medium">Select appointment date</h3>
                
                {/* Direct calendar without popover */}
                <div className="border rounded-md p-2 shadow-sm bg-card">
                  {/* @ts-ignore - The type definitions for the calendar are inconsistent */}
                  <CalendarComponent
                    mode="single" 
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </div>

                {/* Display currently selected date if any */}
                {selectedDate && (
                  <div className="p-3 rounded-md bg-primary/5 text-center w-full">
                    <p>Selected date: <span className="font-medium">{format(selectedDate, "PPP")}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Time selection step */}
          {currentStep === 'time' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {getAvailableTimeSlots().map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={cn(
                    "aspect-square p-0 flex flex-col",
                    selectedTime === time ? "bg-primary text-primary-foreground" : ""
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  <span className="text-sm">{time}</span>
                </Button>
              ))}
            </div>
          )}
          
          {/* Client details step */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Your phone number"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email address"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any special requests or notes"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {/* Confirmation step */}
          {currentStep === 'confirmation' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 dark:bg-green-900 h-20 w-20 rounded-full flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-700 dark:text-green-300" />
                </div>
              </div>
              
              <h3 className="text-xl font-medium">Booking Confirmed!</h3>
              <p className="text-muted-foreground">Thank you for your booking. We're looking forward to seeing you!</p>
              
              {selectedDate && selectedTime && (
                <div className="mt-6 bg-secondary/50 p-4 rounded-md text-left">
                  <h4 className="font-medium mb-2">Appointment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>{selectedTime}</span>
                    </div>
                    <div className="flex gap-2">
                      <Scissors className="h-4 w-4" />
                      <span>{selectedService?.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>{selectedStaff?.name}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                className="mt-6"
                onClick={() => router.push('/')}
              >
                Return Home
              </Button>
            </div>
          )}
        </CardContent>
        
        {/* Navigation buttons */}
        {currentStep !== 'confirmation' && (
          <CardFooter className="flex justify-between">
            {currentStep !== 'service' ? (
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <div></div> // Empty div for layout spacing
            )}
            
            {currentStep !== 'details' ? (
              <Button onClick={handleNextStep} className="flex items-center">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmitBooking} 
                disabled={isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <LoaderIcon className="h-4 w-4 mr-1 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Book Appointment
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
      
      {/* Booking summary */}
      {currentStep !== 'confirmation' && (
        <Card className="w-full mt-6">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedService && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
            )}
            
            {selectedStaff && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staff:</span>
                <span className="font-medium">{selectedStaff.name}</span>
              </div>
            )}
            
            {selectedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{format(selectedDate, 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {selectedTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
            )}
            
            {selectedService && (
              <div className="flex justify-between pt-2 border-t mt-2">
                <span className="font-medium">Total:</span>
                <span className="font-medium">${selectedService.price}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 