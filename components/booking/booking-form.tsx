'use client';

import { useState, useEffect } from 'react';
import { 
  useRouter, 
  useSearchParams 
} from 'next/navigation';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  ChevronRight, 
  CreditCard, 
  Scissors, 
  Check 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Service, User } from '@/types';
import { toast } from 'sonner';

interface FormData {
  formId: string;
  formName: string;
  formType: string;
  companyName: string;
  availableServices: Service[];
  availableEmployees: User[];
}

type BookingStep = 'service' | 'employee' | 'date' | 'time' | 'details' | 'confirmation';

interface BookingFormProps {
  formId: string;
}

export function BookingForm({ formId }: BookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  
  // Получение данных формы
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/booking-forms/${formId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load booking form data');
        }
        
        const data = await response.json();
        setFormData(data);
        
        // Если ссылка для конкретного сотрудника, предустанавливаем его
        if (data.formType === 'Employee' && data.availableEmployees.length === 1) {
          setSelectedEmployee(data.availableEmployees[0]);
        }
        
        // Проверяем URL параметры для предварительного выбора
        const serviceId = searchParams.get('service');
        const employeeId = searchParams.get('employee');
        
        if (serviceId) {
          const service = data.availableServices.find(s => s.id === serviceId);
          if (service) setSelectedService(service);
        }
        
        if (employeeId) {
          const employee = data.availableEmployees.find(e => e.id === employeeId);
          if (employee) setSelectedEmployee(employee);
        }
        
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError((err as Error).message || 'Failed to load booking form');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFormData();
  }, [formId, searchParams]);
  
  // Обработка переходов между шагами
  const goToNextStep = () => {
    switch (currentStep) {
      case 'service':
        setCurrentStep('employee');
        break;
      case 'employee':
        setCurrentStep('date');
        break;
      case 'date':
        setCurrentStep('time');
        break;
      case 'time':
        setCurrentStep('details');
        break;
      case 'details':
        setCurrentStep('confirmation');
        break;
      default:
        break;
    }
  };
  
  const goToPrevStep = () => {
    switch (currentStep) {
      case 'employee':
        setCurrentStep('service');
        break;
      case 'date':
        setCurrentStep('employee');
        break;
      case 'time':
        setCurrentStep('date');
        break;
      case 'details':
        setCurrentStep('time');
        break;
      case 'confirmation':
        setCurrentStep('details');
        break;
      default:
        break;
    }
  };
  
  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Подготавливаем данные для отправки
      const bookingData = {
        serviceId: selectedService?.id,
        employeeId: selectedEmployee?.id,
        date: selectedDate?.toISOString().split('T')[0],
        time: selectedTime,
        customer: customerDetails,
      };
      
      // Отправляем данные на сервер
      const response = await fetch(`/api/booking-forms/${formId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      // Обрабатываем успешный ответ
      const result = await response.json();
      toast.success('Booking confirmed!');
      
      // Переходим к шагу подтверждения
      goToNextStep();
      
    } catch (err) {
      console.error('Error creating booking:', err);
      toast.error((err as Error).message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Генерация доступных дат (следующие 7 дней)
  const getAvailableDates = () => {
    const dates = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Генерация доступных временных слотов
  const getAvailableTimeSlots = () => {
    const slots = [];
    const startHour = 10;
    const endHour = 19;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    
    return slots;
  };
  
  // Отображение состояния загрузки
  if (isLoading && !formData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Loading...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Отображение ошибки
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  // Если данные не загрузились
  if (!formData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Form Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">The booking form you're looking for doesn't exist.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="border-b pb-3">
        <div className="text-center">
          <CardTitle>{formData.companyName}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">{formData.formName}</p>
        </div>
        
        {/* Progress steps */}
        <div className="flex justify-between mt-6 px-6">
          {['service', 'employee', 'date', 'time', 'details', 'confirmation'].map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                  currentStep === step 
                    ? "bg-blue-500 text-white" 
                    : currentStep === 'confirmation' || (i < ['service', 'employee', 'date', 'time', 'details', 'confirmation'].indexOf(currentStep as string))
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 text-slate-500"
                )}
              >
                {currentStep === 'confirmation' || (i < ['service', 'employee', 'date', 'time', 'details', 'confirmation'].indexOf(currentStep as string)) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 5 && (
                <div 
                  className={cn(
                    "w-full h-1 mt-2",
                    (i < ['service', 'employee', 'date', 'time', 'details', 'confirmation'].indexOf(currentStep as string)) 
                      ? "bg-green-500" 
                      : "bg-slate-200"
                  )}
                ></div>
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          {/* Шаг 1: Выбор услуги */}
          {currentStep === 'service' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Service</h3>
              <div className="grid gap-3">
                {formData.availableServices.map((service) => (
                  <div 
                    key={service.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors",
                      selectedService?.id === service.id ? "border-blue-500 bg-blue-50" : ""
                    )}
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Scissors className="h-5 w-5 text-slate-500 mr-3" />
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-slate-500">{service.duration} min</div>
                        </div>
                      </div>
                      <div className="font-medium">{service.price.toLocaleString()} ₸</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Шаг 2: Выбор сотрудника */}
          {currentStep === 'employee' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Staff Member</h3>
              <div className="grid gap-3">
                {formData.availableEmployees.map((employee) => (
                  <div 
                    key={employee.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors",
                      selectedEmployee?.id === employee.id ? "border-blue-500 bg-blue-50" : ""
                    )}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3">
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="w-full h-full rounded-full"
                          />
                        ) : (
                          <span>{employee.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-slate-500">{employee.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Шаг 3: Выбор даты */}
          {currentStep === 'date' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Date</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {getAvailableDates().map((date, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors text-center",
                      selectedDate && selectedDate.toDateString() === date.toDateString() ? "border-blue-500 bg-blue-50" : ""
                    )}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="text-sm text-slate-500">{format(date, 'EEEE')}</div>
                    <div className="font-medium mt-1">{format(date, 'MMM d')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Шаг 4: Выбор времени */}
          {currentStep === 'time' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Time</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {getAvailableTimeSlots().map((time, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "border rounded-lg p-3 cursor-pointer hover:border-blue-500 transition-colors text-center",
                      selectedTime === time ? "border-blue-500 bg-blue-50" : ""
                    )}
                    onClick={() => setSelectedTime(time)}
                  >
                    <div className="font-medium">{time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Шаг 5: Детали клиента */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={customerDetails.notes}
                    onChange={(e) => setCustomerDetails({...customerDetails, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Шаг 6: Подтверждение */}
          {currentStep === 'confirmation' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium mt-4">Booking Confirmed!</h3>
                <p className="text-slate-500 mt-1">Your appointment has been scheduled</p>
              </div>
              
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center">
                  <Scissors className="h-5 w-5 text-slate-500 mr-3" />
                  <div>
                    <div className="text-sm text-slate-500">Service</div>
                    <div className="font-medium">{selectedService?.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-slate-500 mr-3" />
                  <div>
                    <div className="text-sm text-slate-500">Staff</div>
                    <div className="font-medium">{selectedEmployee?.name}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-slate-500 mr-3" />
                  <div>
                    <div className="text-sm text-slate-500">Date</div>
                    <div className="font-medium">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-slate-500 mr-3" />
                  <div>
                    <div className="text-sm text-slate-500">Time</div>
                    <div className="font-medium">{selectedTime}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-slate-500 mr-3" />
                  <div>
                    <div className="text-sm text-slate-500">Price</div>
                    <div className="font-medium">{selectedService?.price.toLocaleString()} ₸</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-slate-500">
                <p>A confirmation has been sent to your email.</p>
                <p>You can cancel or reschedule your appointment up to 24 hours in advance.</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          {currentStep !== 'service' && currentStep !== 'confirmation' && (
            <Button type="button" variant="outline" onClick={goToPrevStep}>
              Back
            </Button>
          )}
          
          {currentStep === 'service' && (
            <Button type="button" variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
          )}
          
          {currentStep === 'confirmation' ? (
            <Button 
              type="button" 
              className="ml-auto"
              onClick={() => router.push('/')}
            >
              Return to Homepage
            </Button>
          ) : (
            <Button 
              type={currentStep === 'details' ? 'submit' : 'button'} 
              className={currentStep === 'service' ? 'ml-auto' : ''}
              onClick={currentStep !== 'details' ? goToNextStep : undefined}
              disabled={
                (currentStep === 'service' && !selectedService) ||
                (currentStep === 'employee' && !selectedEmployee) ||
                (currentStep === 'date' && !selectedDate) ||
                (currentStep === 'time' && !selectedTime) ||
                (currentStep === 'details' && isLoading)
              }
            >
              {currentStep === 'details' ? (isLoading ? 'Processing...' : 'Complete Booking') : 'Continue'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}