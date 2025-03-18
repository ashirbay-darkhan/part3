import { User, BookingLink, Service, Appointment, Client, AppointmentStatus, BusinessUser, Business, ServiceCategory } from '@/types';

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

// Function to load fallback data from localStorage
function loadFallbackDataFromStorage() {
  try {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('fallback_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Merge with default FALLBACK_DATA structure to ensure all properties exist
        Object.keys(parsedData).forEach(key => {
          if (FALLBACK_DATA[key as keyof typeof FALLBACK_DATA]) {
            (FALLBACK_DATA as any)[key] = parsedData[key];
          }
        });
        console.log('Loaded fallback data from localStorage');
      }
    }
  } catch (error) {
    console.error('Error loading fallback data from localStorage:', error);
  }
}

// Function to save fallback data to localStorage
function saveFallbackDataToStorage() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fallback_data', JSON.stringify(FALLBACK_DATA));
    }
  } catch (error) {
    console.error('Error saving fallback data to localStorage:', error);
  }
}

// Load fallback data from localStorage on initialization
if (typeof window !== 'undefined') {
  loadFallbackDataFromStorage();
  
  // Set up event listener for beforeunload to ensure data is saved
  window.addEventListener('beforeunload', saveFallbackDataToStorage);
}

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
  saveFallbackDataToStorage(); // Save after creating
  return newItem as T;
}

// Function to update entity in fallback data
function updateFallbackItem<T>(entityName: keyof typeof FALLBACK_DATA, id: string, updates: any): T | null {
  const items = FALLBACK_DATA[entityName] as any[];
  const index = items.findIndex(item => item.id === id);
  if (index < 0) return null;
  
  items[index] = { ...items[index], ...updates };
  saveFallbackDataToStorage(); // Save after updating
  return items[index] as T;
}

// Function to delete entity in fallback data
function deleteFallbackItem(entityName: keyof typeof FALLBACK_DATA, id: string): boolean {
  const items = FALLBACK_DATA[entityName] as any[];
  const initialLength = items.length;
  
  // Filter out the item with the given ID
  FALLBACK_DATA[entityName] = items.filter(item => item.id !== id) as any;
  
  const succeeded = initialLength > (FALLBACK_DATA[entityName] as any[]).length;
  if (succeeded) {
    saveFallbackDataToStorage(); // Save after deleting
  }
  return succeeded;
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
    
    // Check if we're in a browser environment before accessing localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options?.headers || {})
    };
    
    console.log(`Attempting to fetch from ${endpoint}`);
    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
    // Check if we're in a browser environment before accessing localStorage
    if (typeof window === 'undefined') return null;
    
    // First try to get directly from business_id localStorage item
    const directBusinessId = localStorage.getItem('business_id');
    if (directBusinessId) {
      return directBusinessId;
    }
    
    // If not found, try to extract from the user object
    const user = localStorage.getItem('currentUser');
    if (!user) return null;
    
    const userData = JSON.parse(user);
    const businessId = userData.businessId;
    
    // If found in user object, store it directly for future use
    if (businessId) {
      localStorage.setItem('business_id', businessId.toString());
    }
    
    return businessId;
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
export const createBookingLink = async (link: Omit<BookingLink, 'id'>) => {
  try {
    // Try to use the real API first
    return await fetchAPI<BookingLink>('bookingLinks', {
      method: 'POST',
      body: JSON.stringify(link)
    });
  } catch (error) {
    console.error('Error creating booking link via API, using fallback:', error);
    
    // Generate a 7-10 digit random numeric ID
    const min = 1000000;  // 7 digits minimum
    const max = 9999999999;  // 10 digits maximum
    const randomId = Math.floor(min + Math.random() * (max - min)).toString();
    
    // Include businessId from the current user if not already provided
    const businessId = getBusinessId();
    const linkWithBusinessId = {
      ...link,
      businessId: link.businessId || businessId
    };
    
    // Create the link in fallback data with the properly formatted ID
    const newLink = createFallbackItem<BookingLink>('bookingLinks', {
      ...linkWithBusinessId,
      id: randomId
    });
    
    // Store the reverse mapping in localStorage for link resolution
    if (typeof window !== 'undefined' && businessId) {
      localStorage.setItem(`link_id_to_business_${randomId}`, businessId);
    }
    
    return newLink;
  }
};

export const updateBookingLink = async (id: string, updates: Partial<Omit<BookingLink, 'id' | 'businessId'>>) => {
  return fetchAPI<BookingLink>(`bookingLinks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
};

export const deleteBookingLink = async (id: string) => {
  try {
    // First try the normal API call
    return await fetchAPI<{}>(`bookingLinks/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error deleting booking link via API, using fallback:', error);
    
    // Use our fallback delete mechanism, which now saves to localStorage
    const result = deleteFallbackItem('bookingLinks', id);
    
    if (!result) {
      throw new Error(`Booking link with ID ${id} not found in fallback data`);
    }
    
    // Also clean up localStorage mappings
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`link_id_to_business_${id}`);
    }
    
    return {};
  }
};

// Services
export const getServices = () => fetchAPI<Service[]>('services');
export const getService = (id: string) => fetchAPI<Service>(`services/${id}`);
export const createService = (service: Omit<Service, 'id'>) => 
  fetchAPI<Service>('services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service)
  });
  
// Replace the existing updateService function in lib/api.ts with this enhanced version
export const updateService = async (id: string, service: Partial<Service>): Promise<Service> => {
  console.log('[updateService] Updating service with ID:', id, 'Data:', JSON.stringify(service));
  
  // Add timestamp to force cache invalidation
  const timestamp = Date.now();
  
  try {
    // Fetch current service first to ensure we have all data
    const currentService = await fetchAPI<Service>(`services/${id}?_=${timestamp}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    // Merge current service with updates
    const updatedData = {
      ...currentService,
      ...service,
      _timestamp: timestamp
    };
    
    console.log('[updateService] Merged data for update:', JSON.stringify(updatedData));
    
    // Send update request
    const updatedService = await fetchAPI<Service>(`services/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify(updatedData)
    });
    
    console.log('[updateService] Server response:', JSON.stringify(updatedService));
    return updatedService;
  } catch (error) {
    console.error('[updateService] Error updating service:', error);
    throw error;
  }
};

export const deleteService = (id: string) => 
  fetchAPI(`services/${id}`, { method: 'DELETE' });

// Appointments
export const getAppointments = () => fetchAPI<Appointment[]>('appointments');
export const getAppointment = (id: string) => fetchAPI<Appointment>(`appointments/${id}`);
export const createAppointment = (appointment: Omit<Appointment, 'id'>) => {
  // Ensure businessId is set
  const businessId = appointment.businessId || getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  return fetchAPI<Appointment>('appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...appointment,
      businessId
    })
  });
};
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
export const createClient = async (client: Omit<Client, 'id' | 'totalVisits' | 'lastVisit'>) => {
  const clientToCreate = {
    ...client,
    id: Math.random().toString(36).substring(2, 9), // Generate a string ID
    totalVisits: 0,
    lastVisit: new Date().toISOString(),
    businessId: client.businessId.toString() // Ensure businessId is a string
  };
  
  return fetchAPI<Client>('clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientToCreate)
  });
};
export const updateClient = (id: string, client: Partial<Client>) => 
  fetchAPI<Client>(`clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  });
export const deleteClient = (id: string) => 
  fetchAPI(`clients/${id}`, { method: 'DELETE' });

// Business-specific API functions
export const getBusinessServices = async (businessId?: string): Promise<Service[]> => {
  // Get the business ID
  const bId = businessId || getBusinessId();
  
  console.log('[getBusinessServices] Starting getBusinessServices with businessId:', bId);
  
  if (!bId) {
    console.error('[getBusinessServices] No business ID found');
    
    // Try to get the ID directly from localStorage and user data as fallback
    if (typeof window !== 'undefined') {
      const directId = localStorage.getItem('business_id');
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('[getBusinessServices] Debug - directId:', directId);
      console.log('[getBusinessServices] Debug - userData:', userData);
      
      if (userData.businessId) {
        // Force refresh the business ID in localStorage
        localStorage.setItem('business_id', userData.businessId.toString());
        console.log('[getBusinessServices] Updated business_id in localStorage to:', userData.businessId);
        return getBusinessServices(userData.businessId); // Retry with the correct ID
      }
    }
    
    throw new Error('No business ID found');
  }
  
  console.log(`[getBusinessServices] Fetching services for business ID: ${bId}`);
  
  try {
    // Add cache-busting timestamp to completely bypass browser cache
    const timestamp = Date.now();
    
    // Try first with the query parameter approach
    const response = await fetch(`${API_URL}/services?businessId=${bId}&_=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }
    
    const services = await response.json();
    
    // Check if we got filtered results - if not, we'll do manual filtering
    if (Array.isArray(services) && services.length > 0) {
      console.log(`[getBusinessServices] Found ${services.length} services from query param filter`);
      
      // Double-check businessId just to be sure
      const filteredServices = services.filter(service => 
        service.businessId && service.businessId.toString() === bId.toString()
      );
      
      if (filteredServices.length !== services.length) {
        console.warn(`[getBusinessServices] Query filtering returned inconsistent results, using manual filter instead`);
        return await getBusinessServicesManual(bId);
      }
      
      console.log(`[getBusinessServices] Returning ${filteredServices.length} services:`, filteredServices);
      return filteredServices;
    } else {
      console.log(`[getBusinessServices] No services found with query param, trying manual filtering`);
      return await getBusinessServicesManual(bId);
    }
  } catch (error) {
    console.error('[getBusinessServices] Error with query param approach:', error);
    return await getBusinessServicesManual(bId);
  }
};

// Helper function to manually fetch and filter services
const getBusinessServicesManual = async (businessId: string): Promise<Service[]> => {
  console.log(`[getBusinessServicesManual] Manually fetching all services for businessId: ${businessId}`);
  
  try {
    // Add cache-busting timestamp
    const timestamp = Date.now();
    
    // Fetch all services with cache busting
    const response = await fetch(`${API_URL}/services?_=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }
    
    const allServices = await response.json();
    console.log('[getBusinessServicesManual] All services:', allServices);
    
    if (!Array.isArray(allServices)) {
      console.error('[getBusinessServicesManual] Invalid response format, expected array');
      return [];
    }
    
    // Manually filter services to match the business ID
    const filteredServices = allServices.filter(service => 
      service.businessId && service.businessId.toString() === businessId.toString()
    );
    
    console.log(`[getBusinessServicesManual] Found ${filteredServices.length} services for business ID ${businessId}:`, filteredServices);
    
    return filteredServices;
  } catch (error) {
    console.error('[getBusinessServicesManual] Error fetching services:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

export const createBusinessService = async (serviceData: Partial<Service>): Promise<Service> => {
  console.log('[createBusinessService] Creating service with data:', serviceData);
  
  // Create a timestamp for cache busting
  const timestamp = Date.now();
  
  // Ensure we have a business ID
  const businessId = getBusinessId();
  
  // Create the complete service object
  const newService = {
    ...serviceData,
    businessId,
    _timestamp: timestamp
  };
  
  // Create the service
  const createdService = await fetchAPI<Service>('services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    body: JSON.stringify(newService)
  });
  
  return createdService;
};

export const getBusinessBookingLinks = async (businessId?: string) => {
  const bId = businessId || getBusinessId();
  if (!bId) throw new Error('No business ID found');
  
  try {
    // Get links from the API
    const links = await fetchAPI<BookingLink[]>(`bookingLinks?businessId=${bId}`);
    
    // Enhance links with user data if needed
    const enhancedLinks = await Promise.all(
      links.map(async (link) => {
        // Skip if not an employee link or if already has employeeName
        if (link.type !== 'Employee' || !link.employeeId || link.employeeName) {
          return link;
        }
        
        try {
          // Get employee details
          const user = await fetchAPI<User>(`users/${link.employeeId}`);
          return {
            ...link,
            employeeName: user.name
          };
        } catch (error) {
          console.warn(`Could not fetch details for employee ${link.employeeId}`);
          return link;
        }
      })
    );
    
    return enhancedLinks;
  } catch (error) {
    console.error('Error fetching booking links from API, using fallback:', error);
    
    try {
      // Load the latest fallback data
      loadFallbackDataFromStorage();
      
      // Filter links by businessId
      const fallbackLinks = (FALLBACK_DATA.bookingLinks as BookingLink[])
        .filter(link => link.businessId === bId);
      
      // Return enhanced links
      return await Promise.all(
        fallbackLinks.map(async (link) => {
          // Skip if not an employee link or if already has employeeName
          if (link.type !== 'Employee' || !link.employeeId || link.employeeName) {
            return link;
          }
          
          try {
            // Try to get employee details
            const employees = FALLBACK_DATA.users as User[];
            const employee = employees.find(user => user.id === link.employeeId);
            
            if (employee) {
              return {
                ...link,
                employeeName: employee.name
              };
            }
            
            return link;
          } catch (error) {
            console.warn(`Could not fetch details for employee ${link.employeeId}`);
            return link;
          }
        })
      );
    } catch (fallbackError) {
      console.error('Error with fallback booking links:', fallbackError);
      return [];
    }
  }
};

export const getBusinessAppointments = async (businessId?: string) => {
  const bId = businessId || getBusinessId();
  if (!bId) throw new Error('No business ID found');
  
  try {
    // First try to get appointments with businessId filter
    return await fetchAPI<Appointment[]>(`appointments?businessId=${bId}`);
  } catch (error) {
    console.error('Error fetching appointments with businessId, falling back:', error);
    
    try {
      // Fallback to filtering manually
      const appointments = await fetchAPI<Appointment[]>('appointments');
      return appointments.filter(appointment => appointment.businessId === bId);
    } catch (secondError) {
      console.error('Error in fallback appointment fetching:', secondError);
      return [];
    }
  }
};

export const getBusinessClients = async (businessId?: string) => {
  const bId = businessId || getBusinessId();
  if (!bId) throw new Error('No business ID found');
  
  return fetchAPI<Client[]>(`clients?businessId=${bId}`);
};

export const getBusinessStaff = async (businessId?: string) => {
  const bId = businessId || getBusinessId();
  if (!bId) throw new Error('No business ID found');
  
  try {
    // First try with the business staff endpoint - include both staff and admin roles
    return await fetchAPI<BusinessUser[]>(`users?businessId=${bId}`);
  } catch (error) {
    try {
      console.error('Error fetching business staff, trying fallback:', error);
      
      // Fallback: Get all users and filter by businessId
      const allUsers = await getUsers();
      // Filter and cast to BusinessUser since we're filtering for business users
      return allUsers.filter(user => 
        // Check for properties that indicate a BusinessUser
        'businessId' in user && 
        user.businessId === bId
      ) as BusinessUser[];
    } catch (secondError) {
      console.error('Error fetching business staff with fallback:', secondError);
      return []; // Return empty array instead of throwing
    }
  }
};

// Business API functions
export const getBusiness = (id: string) => fetchAPI<Business>(`businesses/${id}`);
export const getBusinessById = (id: string) => fetchAPI<Business>(`businesses/${id}`);

// Update createAppointment to handle client data
export const createAppointmentWithClient = async (
  appointmentData: Omit<Appointment, 'id'>, 
  clientData: Omit<Client, 'id' | 'totalVisits' | 'lastVisit'>
) => {
  // Ensure businessId is set
  const businessId = appointmentData.businessId || getBusinessId();
  if (!businessId) throw new Error('No business ID found');
  
  // First, check if client exists
  try {
    // Try to find client by phone and business ID
    const existingClients = await fetchAPI<Client[]>(
      `clients?phone=${encodeURIComponent(clientData.phone)}&businessId=${businessId}`
    );
    
    let clientId;
    
    if (existingClients.length > 0) {
      // Use existing client
      clientId = existingClients[0].id;
      
      // Update client information if needed
      await fetchAPI<Client>(`clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientData.name,
          email: clientData.email,
          notes: clientData.notes
        })
      });
    } else {
      // Create new client with business ID
      const newClient = await fetchAPI<Client>('clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clientData,
          businessId,
          totalVisits: 0,
          lastVisit: new Date().toISOString()
        })
      });
      
      clientId = newClient.id;
    }
    
    // Create appointment with client ID and business ID
    return await fetchAPI<Appointment>('appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...appointmentData,
        businessId,
        clientId
      })
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Service Categories API functions

export const getBusinessServiceCategories = async () => {
  try {
    const businessId = getBusinessId();
    
    // If no business ID is available, return the hardcoded categories as fallback
    if (!businessId) {
      console.warn('No business ID found for fetching categories, using hardcoded data');
      return defaultCategories();
    }
    
    // Get categories from API
    const response = await fetch(`${API_URL}/serviceCategories?businessId=${businessId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    
    const categories = await response.json();
    
    // If no categories found, return default ones
    if (!categories || categories.length === 0) {
      return defaultCategories();
    }
    
    return categories;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return defaultCategories();
  }
};

// Default categories as fallback
const defaultCategories = () => {
  return [
    {
      id: '1',
      name: 'Haircut',
      description: 'Hair cutting services',
      color: '#4f46e5',
    },
    {
      id: '2',
      name: 'Styling',
      description: 'Hair styling services',
      color: '#8b5cf6',
    },
    {
      id: '3',
      name: 'Color',
      description: 'Hair coloring services',
      color: '#ec4899',
    },
    {
      id: '4',
      name: 'Treatment',
      description: 'Hair treatment services',
      color: '#f59e0b',
    }
  ];
};

export const createServiceCategory = async (category: Omit<ServiceCategory, 'id' | 'businessId'>) => {
  try {
    // Get the business ID using the existing helper function
    const businessId = getBusinessId();
    
    if (!businessId) {
      console.error('No business ID found');
      throw new Error('Business ID not found');
    }
    
    // Add businessId to the category data
    const categoryData = {
      ...category,
      businessId: businessId.toString()
    };
    
    // Call the API to create the category
    const response = await fetch(`${API_URL}/serviceCategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(categoryData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }
    
    // Parse and return the created category
    return await response.json();
  } catch (error) {
    console.error('Error creating service category:', error);
    throw error;
  }
};

export const updateServiceCategory = async (id: string, category: Partial<Omit<ServiceCategory, 'id' | 'businessId'>>) => {
  try {
    // Call the API to update the category
    const response = await fetch(`${API_URL}/serviceCategories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(category)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`);
    }
    
    // Parse and return the updated category
    return await response.json();
  } catch (error) {
    console.error('Error updating service category:', error);
    throw error;
  }
};

export const deleteServiceCategory = async (id: string) => {
  try {
    // Call the API to delete the category
    const response = await fetch(`${API_URL}/serviceCategories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw error;
  }
};

// Initialize server availability check
checkServerAvailability();

export const getBusinessByLinkId = async (linkId: string): Promise<string | null> => {
  try {
    // Check if it's a generated numeric ID (7+ digits)
    if (/^\d{7,}$/.test(linkId)) {
      // For 7+ digit IDs (our randomly generated ones), we don't need to query the API
      // since we know these don't exist in the backend
      
      // First, check if we're in a browser environment for localStorage access
      if (typeof window !== 'undefined') {
        // Check for the direct mapping first (most reliable)
        const directMapping = localStorage.getItem(`link_id_to_business_${linkId}`);
        if (directMapping) {
          return directMapping;
        }
        
        // Check if this is a personal link ID stored in localStorage
        const allKeys = Object.keys(localStorage);
        
        // Look for personal_link_[businessId] entries
        for (const key of allKeys) {
          if (key.startsWith('personal_link_')) {
            const storedLinkId = localStorage.getItem(key);
            if (storedLinkId === linkId) {
              // Extract businessId from the key (personal_link_[businessId])
              return key.replace('personal_link_', '');
            }
          }
        }
      }
      
      // For server-side rendering or if no localStorage mapping found,
      // use a fallback business ID for demonstration purposes
      console.warn('Using default business ID 1 for random link ID (server-side or mapping not found)');
      return '1';
    }
    
    // For non-numeric or shorter IDs, try the API
    try {
      const bookingLink = await fetchAPI<BookingLink>(`bookingLinks/${linkId}`);
      return bookingLink?.businessId || null;
    } catch (error) {
      // If API fails, check if we're in browser environment
      if (typeof window !== 'undefined') {
        // Try localStorage as a fallback
        const directMapping = localStorage.getItem(`link_id_to_business_${linkId}`);
        if (directMapping) {
          return directMapping;
        }
      }
      
      console.error('Error fetching link from API:', error);
      // Default fallback
      return '1';
    }
  } catch (error) {
    console.error('Error finding business by link ID:', error);
    return '1';  // Default fallback
  }
};

export const createBusinessBookingLink = async (link: Omit<BookingLink, 'id'>) => {
  try {
    // Try to use the real API first
    return await fetchAPI<BookingLink>('bookingLinks', {
      method: 'POST',
      body: JSON.stringify(link)
    });
  } catch (error) {
    console.error('Error creating booking link via API, using fallback:', error);
    
    // Generate a 7-10 digit random numeric ID
    const min = 1000000;  // 7 digits minimum
    const max = 9999999999;  // 10 digits maximum
    const randomId = Math.floor(min + Math.random() * (max - min)).toString();
    
    // Include businessId from the current user if not already provided
    const businessId = getBusinessId();
    const linkWithBusinessId = {
      ...link,
      businessId: link.businessId || businessId
    };
    
    // Create the link in fallback data with the properly formatted ID
    const newLink = createFallbackItem<BookingLink>('bookingLinks', {
      ...linkWithBusinessId,
      id: randomId
    });
    
    // Store the reverse mapping in localStorage for link resolution
    if (typeof window !== 'undefined' && businessId) {
      localStorage.setItem(`link_id_to_business_${randomId}`, businessId);
    }
    
    return newLink;
  }
};