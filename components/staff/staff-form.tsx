'use client';

import React, { useState, useEffect } from 'react';
import { BusinessUser, Service } from '@/types';
import { useAuth } from '@/lib/auth/authContext';
import { getBusinessServices } from '@/lib/api/staff-service';

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: BusinessUser | null;
}

export function StaffForm({ isOpen, onClose, onSubmit, initialData }: StaffFormProps) {
  // Basic form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const { user } = useAuth();

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      // Reset form with initial data or empty values
      setName(initialData?.name || '');
      setEmail(initialData?.email || '');
      setAvatar(initialData?.avatar || '');
      setSelectedServices(initialData?.serviceIds || []);
      
      // Load services only once when dialog opens
      if (user?.businessId && services.length === 0) {
        loadServices(user.businessId);
      }
    }
  }, [isOpen, initialData]);
  
  // Load services
  const loadServices = async (businessId: string) => {
    try {
      const data = await getBusinessServices(businessId);
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  // Generate avatar URL
  const generateAvatar = () => {
    if (!name) return;
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    setAvatar(url);
  };

  // Toggle service selection
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSubmit({
        name,
        email,
        avatar,
        serviceIds: selectedServices
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save staff member');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {initialData ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          {initialData 
            ? 'Update staff member details below.' 
            : 'Fill in the details below to create a new staff member.'}
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* Name field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="John Doe"
              required
            />
          </div>
          
          {/* Email field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="john@example.com"
              required
            />
          </div>
          
          {/* Avatar field */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Profile Picture</label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex flex-col items-center">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={name || "Staff"} 
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Staff')}`;
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
                    {name ? name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 w-full">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mb-2"
                  placeholder="https://example.com/avatar.jpg"
                />
                <button
                  type="button"
                  onClick={generateAvatar}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100"
                >
                  Generate random avatar
                </button>
              </div>
            </div>
          </div>
          
          {/* Services selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Services</label>
            <p className="text-sm text-gray-500 mb-3">
              Select which services this staff member can provide
            </p>
            
            <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto bg-gray-50">
              {services.length === 0 ? (
                <p className="text-gray-500 text-sm p-2">No services available.</p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        className={`p-3 rounded-md cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-100 border-blue-300 border' 
                            : 'hover:bg-gray-100 border border-transparent'
                        }`}
                        onClick={() => toggleService(service.id)}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleService(service.id)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">
                              {service.price ? `$${service.price}` : ''} 
                              {service.duration ? ` • ${service.duration} min` : ''}
                              {service.category ? ` • ${service.category}` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Form buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading 
                ? (initialData ? 'Updating...' : 'Creating...') 
                : (initialData ? 'Update Staff' : 'Create Staff')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 