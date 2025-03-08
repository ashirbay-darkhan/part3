import { BusinessUser, Service } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateStaffParams {
  name: string;
  email: string;
  password?: string;
  serviceIds: string[]; // IDs of services this staff can provide
  businessId: string;
  businessName: string;
}

export interface UpdateStaffParams {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  serviceIds?: string[]; // IDs of services this staff can provide
  isVerified?: boolean;
}

export async function getBusinessStaff(businessId: string): Promise<BusinessUser[]> {
  try {
    const response = await fetch(`${API_URL}/users?businessId=${businessId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff members');
    }
    
    const staff: BusinessUser[] = await response.json();
    return staff.map(staffMember => {
      // Ensure staff has serviceIds property
      if (!staffMember.serviceIds) {
        return {
          ...staffMember,
          serviceIds: [],
        };
      }
      return staffMember;
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
}

export async function getStaffById(id: string): Promise<BusinessUser> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff member');
    }
    
    const staff: BusinessUser = await response.json();
    
    // Ensure staff has serviceIds property
    if (!staff.serviceIds) {
      return {
        ...staff,
        serviceIds: [],
      };
    }
    
    return staff;
  } catch (error) {
    console.error('Error fetching staff member:', error);
    throw error;
  }
}

export async function createStaff(staffData: CreateStaffParams): Promise<BusinessUser> {
  try {
    // For a new staff member, generate a default password if not provided
    const dataToSend = {
      ...staffData,
      password: staffData.password || 'password123', // Default password if none provided
      id: Date.now().toString(), // Generate a unique ID
      isVerified: true, // Set initially verified
      serviceIds: staffData.serviceIds || []
    };

    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create staff member');
    }
    
    const createdStaff: BusinessUser = await response.json();
    return createdStaff;
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw error;
  }
}

export async function updateStaff(params: UpdateStaffParams): Promise<BusinessUser> {
  try {
    // First get the existing staff to avoid overwriting data
    const existingStaff = await getStaffById(params.id);
    
    // Update the staff with new data
    const updateData = {
      ...existingStaff,
      ...params,
    };
    
    // Remove empty password if it was not provided
    if (!params.password) {
      delete updateData.password;
    }
    
    const response = await fetch(`${API_URL}/users/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update staff member');
    }
    
    const updatedStaff: BusinessUser = await response.json();
    return updatedStaff;
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
}

export async function deleteStaff(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete staff member');
    }
  } catch (error) {
    console.error('Error deleting staff member:', error);
    throw error;
  }
}

// Get all available services for a business
export async function getBusinessServices(businessId: string): Promise<Service[]> {
  try {
    const response = await fetch(`${API_URL}/services?businessId=${businessId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    
    const services = await response.json();
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}