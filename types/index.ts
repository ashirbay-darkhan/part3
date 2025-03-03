export type User = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
};

export type BookingLink = {
  id: string;
  name: string;
  type: 'General' | 'Employee' | 'Main';
  url: string;
  employeeId?: string;
};

export type Service = {
  id: string;
  name: string;
  duration: number; // в минутах
  price: number;
  description?: string;
};

export type AppointmentStatus = 'Pending' | 'Arrived' | 'No-Show' | 'Confirmed';

export type Appointment = {
  id: string;
  clientId: string;
  employeeId: string;
  serviceId: string;
  date: string; // ISO формат
  startTime: string; // '10:00'
  endTime: string; // '11:00'
  duration: number; // в минутах
  status: AppointmentStatus;
  comment?: string;
  price: number;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  lastVisit?: string; // ISO формат
  notes?: string;
};

// Business type
export type Business = {
  id: string;
  name: string;
  ownerId: string; // Reference to the user who owns the business
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
};

// Extended user type
export type BusinessUser = User & {
  businessId: string;
  businessName: string;
  email: string;
  role: 'admin' | 'staff';
  isVerified: boolean;
};

// Extend existing types with business ownership
export type BusinessService = Service & {
  businessId: string;
};

export type BusinessBookingLink = BookingLink & {
  businessId: string;
};

export type BusinessAppointment = Appointment & {
  businessId: string;
};

export type BusinessClient = Client & {
  businessId: string;
};