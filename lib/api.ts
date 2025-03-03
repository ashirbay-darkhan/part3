import { User, BookingLink, Service, Appointment, Client, AppointmentStatus } from '@/types';

const API_URL = 'http://localhost:3001';

// Users
export const getUsers = () => fetchAPI<User[]>('users');
export const getUser = (id: string) => fetchAPI<User>(`users/${id}`);
export const createUser = (user: Omit<User, 'id'>) => 
  fetchAPI<User>('users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
export const updateUser = (id: string, user: Partial<User>) => 
  fetchAPI<User>(`users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
export const deleteUser = (id: string) => 
  fetchAPI<{}>(`users/${id}`, { method: 'DELETE' });

// Booking Links
export const getBookingLinks = () => fetchAPI<BookingLink[]>('bookingLinks');
export const getBookingLink = (id: string) => fetchAPI<BookingLink>(`bookingLinks/${id}`);
export const createBookingLink = (link: Omit<BookingLink, 'id'>) => 
  fetchAPI<BookingLink>('bookingLinks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(link)
  });
export const updateBookingLink = (id: string, link: Partial<BookingLink>) => 
  fetchAPI<BookingLink>(`bookingLinks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(link)
  });
export const deleteBookingLink = (id: string) => 
  fetchAPI<{}>(`bookingLinks/${id}`, { method: 'DELETE' });

// Services
export const getServices = () => fetchAPI<Service[]>('services');
export const getService = (id: string) => fetchAPI<Service>(`services/${id}`);
export const createService = (service: Omit<Service, 'id'>) => 
  fetchAPI<Service>('services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });
export const updateService = (id: string, service: Partial<Service>) => 
  fetchAPI<Service>(`services/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });
export const deleteService = (id: string) => 
  fetchAPI<{}>(`services/${id}`, { method: 'DELETE' });

// Appointments
export const getAppointments = () => fetchAPI<Appointment[]>('appointments');
export const getAppointment = (id: string) => fetchAPI<Appointment>(`appointments/${id}`);
export const createAppointment = (appointment: Omit<Appointment, 'id'>) => 
  fetchAPI<Appointment>('appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment)
  });
export const updateAppointment = (id: string, appointment: Partial<Appointment>) => 
  fetchAPI<Appointment>(`appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment)
  });
export const updateAppointmentStatus = (id: string, status: AppointmentStatus) => 
  fetchAPI<Appointment>(`appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
export const deleteAppointment = (id: string) => 
  fetchAPI<{}>(`appointments/${id}`, { method: 'DELETE' });

// Clients
export const getClients = () => fetchAPI<Client[]>('clients');
export const getClient = (id: string) => fetchAPI<Client>(`clients/${id}`);
export const createClient = (client: Omit<Client, 'id'>) => 
  fetchAPI<Client>('clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  });
export const updateClient = (id: string, client: Partial<Client>) => 
  fetchAPI<Client>(`clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  });
export const deleteClient = (id: string) => 
  fetchAPI<{}>(`clients/${id}`, { method: 'DELETE' });

// Helper function for getting status details (color and text)
export function getStatusDetails(status: AppointmentStatus) {
  switch (status) {
    case 'Pending':
      return { color: 'bg-yellow-500', text: 'Pending' };
    case 'Arrived':
      return { color: 'bg-green-500', text: 'Arrived' };
    case 'No-Show':
      return { color: 'bg-red-500', text: 'No-Show' };
    case 'Confirmed':
      return { color: 'bg-blue-500', text: 'Confirmed' };
    default:
      return { color: 'bg-gray-500', text: 'Unknown' };
  }
}

// Get the auth token
const getAuthToken = () => localStorage.getItem('auth_token');

// Function to get business ID
const getBusinessId = () => {
  try {
    const user = localStorage.getItem('currentUser');
    if (!user) return null;
    return JSON.parse(user).businessId;
  } catch (error) {
    console.error('Error getting business ID:', error);
    return null;
  }
};

// Updated fetchAPI to include businessId in routes
async function fetchAPI<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}/${endpoint}`;
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

// Business-specific API functions
export const getBusinessServices = async () => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<Service[]>(`services?businessId=${businessId}`);
};

export const createBusinessService = async (service: Omit<Service, 'id' | 'businessId'>) => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<Service>('services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...service, businessId })
  });
};

export const getBusinessBookingLinks = async () => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<BookingLink[]>(`bookingLinks?businessId=${businessId}`);
};

export const createBusinessBookingLink = async (link: Omit<BookingLink, 'id' | 'businessId'>) => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<BookingLink>('bookingLinks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...link, businessId })
  });
};

export const getBusinessAppointments = async () => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<Appointment[]>(`appointments?businessId=${businessId}`);
};

export const getBusinessClients = async () => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<Client[]>(`clients?businessId=${businessId}`);
};

export const getBusinessStaff = async () => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<User[]>(`users?businessId=${businessId}&role=staff`);
};
