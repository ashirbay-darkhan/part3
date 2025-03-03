import { User, BookingLink, Service, Appointment, Client, AppointmentStatus } from '@/types';

const API_URL = 'http://localhost:3001';

// Track server availability to avoid repeated failed requests
let isServerAvailable = true;
let serverCheckTimeout: NodeJS.Timeout | null = null;

// Comprehensive fallback data for when API is unavailable
const FALLBACK_DATA = {
  users: [
    {
      id: '1',
      name: 'Bobby Pin',
      email: 'admin@example.com',
      role: 'admin',
      businessId: '1',
      businessName: "Bobby's Salon",
      isVerified: true
    },
    {
      id: '2',
      name: 'Lorem Ipsum',
      email: 'staff@example.com',
      role: 'staff',
      businessId: '1',
      businessName: "Bobby's Salon",
      isVerified: true
    }
  ],
  businesses: [
    {
      id: '1',
      name: "Bobby's Salon",
      ownerId: '1',
      email: 'admin@example.com'
    }
  ],
  services: [
    {
      id: '1',
      name: 'Haircut',
      duration: 60,
      price: 2000,
      description: 'Classic haircut',
      businessId: '1'
    },
    {
      id: '2',
      name: 'Hair coloring',
      duration: 120,
      price: 5000,
      description: 'Full hair coloring',
      businessId: '1'
    },
    {
      id: '3',
      name: 'Styling',
      duration: 30,
      price: 1500,
      description: 'Hair styling',
      businessId: '1'
    }
  ],
  bookingLinks: [
    {
      id: '1',
      name: 'Company form',
      type: 'Main',
      url: 'n774813.alteg.io',
      businessId: '1'
    },
    {
      id: '2',
      name: 'Online Booking',
      type: 'General',
      url: 'n804474.alteg.io',
      businessId: '1'
    },
    {
      id: '3',
      name: 'Bobby Pin',
      type: 'Employee',
      url: 'n826237.alteg.io',
      employeeId: '1',
      businessId: '1'
    }
  ],
  appointments: [
    {
      id: '1',
      clientId: '1',
      employeeId: '2',
      serviceId: '1',
      date: '2025-03-03',
      startTime: '12:00',
      endTime: '13:00',
      duration: 60,
      status: 'Pending' as AppointmentStatus,
      price: 2000,
      comment: 'First visit',
      businessId: '1'
    },
    {
      id: '2',
      clientId: '2',
      employeeId: '1',
      serviceId: '2',
      date: '2025-03-03',
      startTime: '15:00',
      endTime: '17:00',
      duration: 120,
      status: 'Confirmed' as AppointmentStatus,
      price: 5000,
      businessId: '1'
    }
  ],
  clients: [
    {
      id: '1',
      name: 'John Doe',
      phone: '+7 123 123-13-23',
      email: 'john@example.com',
      totalVisits: 1,
      lastVisit: '2025-02-25T12:00:00',
      notes: 'New client',
      businessId: '1'
    },
    {
      id: '2',
      name: 'Jane Smith',
      phone: '+7 987 654-32-10',
      email: 'jane@example.com',
      totalVisits: 5,
      lastVisit: '2025-02-20T14:30:00',
      notes: 'Prefers natural dyes',
      businessId: '1'
    }
  ]
};

// Function to get all instances of an entity from fallback data
function getFallbackData<T>(entityName: keyof typeof FALLBACK_DATA, filter?: Record<string, any>): T[] {
  const data = FALLBACK_DATA[entityName] as any[];
  
  if (!filter) {
    return data as T[];
  }
  
  // Apply filtering logic similar to JSON Server
  return data.filter(item => {
    for (const [key, value] of Object.entries(filter)) {
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  }) as T[];
}

// Function to get a single entity from fallback data
function getFallbackItem<T>(entityName: keyof typeof FALLBACK_DATA, id: string): T | null {
  const items = FALLBACK_DATA[entityName] as any[];
  return items.find(item => item.id === id) as T || null;
}

// Function to create new entity in fallback data
function createFallbackItem<T>(entityName: keyof typeof FALLBACK_DATA, item: any): T {
  const newItem = {
    id: `mock-${Date.now()}`,
    ...item
  };
  (FALLBACK_DATA[entityName] as any[]).push(newItem);
  return newItem as T;
}

// Function to update entity in fallback data
function updateFallbackItem<T>(entityName: keyof typeof FALLBACK_DATA, id: string, updates: any): T | null {
  const items = FALLBACK_DATA[entityName] as any[];
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates };
  return items[index] as T;
}

// Function to delete entity from fallback data
function deleteFallbackItem(entityName: keyof typeof FALLBACK_DATA, id: string): boolean {
  const items = FALLBACK_DATA[entityName] as any[];
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  items.splice(index, 1);
  return true;
}

// Check if the server is available
async function checkServerAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/users?_limit=1`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1000) // 1 second timeout
    });
    
    isServerAvailable = response.ok;
    return isServerAvailable;
  } catch (error) {
    console.log('Server appears to be down, using fallback data');
    isServerAvailable = false;
    
    // Schedule a re-check in 30 seconds
    if (!serverCheckTimeout) {
      serverCheckTimeout = setTimeout(() => {
        checkServerAvailability();
        serverCheckTimeout = null;
      }, 30000);
    }
    
    return false;
  }
}

// Enhanced fetchAPI function with fallback
async function fetchAPI<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  // Parse entity type and filters from endpoint
  const [entityName, ...rest] = endpoint.split('?')[0].split('/');
  const id = rest.length > 0 ? rest[0] : null;
  
  // Parse query parameters
  const queryParams: Record<string, any> = {};
  if (endpoint.includes('?')) {
    const queryString = endpoint.split('?')[1];
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      queryParams[key] = value;
    });
  }
  
  // Use fallback immediately if server is known to be down
  if (!isServerAvailable) {
    console.log(`Using fallback for ${endpoint} (server down)`);
    return handleFallback<T>(entityName, id, options, queryParams);
  }
  
  try {
    const url = `${API_URL}/${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    console.log(`Attempting to fetch from ${endpoint}`);
    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    
    // On first error, check if server is available
    if (isServerAvailable) {
      await checkServerAvailability();
    }
    
    // Fallback to mock data
    console.log(`Using fallback for ${endpoint}`);
    return handleFallback<T>(entityName, id, options, queryParams);
  }
}

// Handle fallback based on HTTP method and entity
function handleFallback<T>(
  entityName: string, 
  id: string | null, 
  options?: RequestInit,
  queryParams?: Record<string, any>
): T {
  // Make sure entity exists in our fallback data
  const entityKey = entityName as keyof typeof FALLBACK_DATA;
  if (!FALLBACK_DATA[entityKey]) {
    console.error(`No fallback data for ${entityName}`);
    return [] as unknown as T;
  }
  
  const method = options?.method || 'GET';
  
  // Handle different HTTP methods
  switch (method) {
    case 'GET':
      if (id) {
        return getFallbackItem<T>(entityKey, id) as T;
      } else {
        return getFallbackData<T>(entityKey, queryParams) as T;
      }
    
    case 'POST':
      const newItem = JSON.parse(options?.body as string || '{}');
      return createFallbackItem<T>(entityKey, newItem);
    
    case 'PATCH':
    case 'PUT':
      if (!id) throw new Error('ID required for update');
      const updates = JSON.parse(options?.body as string || '{}');
      return updateFallbackItem<T>(entityKey, id, updates) as T;
    
    case 'DELETE':
      if (!id) throw new Error('ID required for delete');
      deleteFallbackItem(entityKey, id);
      return {} as T;
    
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
}

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

export const getBusinessAppointments = async (businessId?: string) => {
  const bId = businessId || getBusinessId();
  if (!bId) throw new Error('No business ID found');
  
  return fetchAPI<Appointment[]>(`appointments?businessId=${bId}`);
};

export const getBusinessClients = async (businessId?: string) => {
  const bId = businessId || getBusinessId();
  if (!bId) throw new Error('No business ID found');
  
  return fetchAPI<Client[]>(`clients?businessId=${bId}`);
};

export const getBusinessStaff = async () => {
  const businessId = getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<User[]>(`users?businessId=${businessId}&role=staff`);
};

// Initialize server availability check
checkServerAvailability();