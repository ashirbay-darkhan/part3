'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

  // Group services by category
  const servicesByCategory = useMemo(() => {
    // Create a grouped object of services
    const grouped = services.reduce((acc, service) => {
      const category = service.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);

    // Sort categories alphabetically with "Uncategorized" at the end
    return Object.keys(grouped)
      .sort((a, b) => {
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
      })
      .map(category => ({
        name: category,
        services: grouped[category]
      }));
  }, [services]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-medium text-gray-900">
            {initialData ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="John Doe"
                required
              />
            </div>
            
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
          
          {/* Avatar field */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex items-center gap-4">
            <div className="flex-shrink-0">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={name || "Staff"} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Staff')}`;
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 text-xl font-medium shadow">
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="https://example.com/avatar.jpg"
                />
                <button
                  type="button"
                  onClick={generateAvatar}
                  className="flex-shrink-0 px-3 py-2 text-xs bg-white text-blue-600 rounded-md border border-blue-200 hover:bg-blue-50 transition-colors font-medium"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
          
          {/* Services selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Services Offered</label>
              <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                {selectedServices.length} selected
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="max-h-[320px] overflow-y-auto bg-gray-50">
                {services.length === 0 ? (
                  <div className="flex items-center justify-center p-4 text-center">
                    <p className="text-gray-500 text-sm">No services available.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {servicesByCategory.map((category) => (
                      <div key={category.name} className="pb-2">
                        <div className="px-3 py-2 bg-gray-100 sticky top-0 z-10 shadow-sm">
                          <h3 className="font-medium text-sm text-gray-700">{category.name}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 p-2">
                          {category.services.map((service) => {
                            const isSelected = selectedServices.includes(service.id);
                            return (
                              <div
                                key={service.id}
                                className={`p-2.5 rounded cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'bg-blue-50 border-blue-200 border shadow-sm' 
                                    : 'hover:bg-gray-100 border border-transparent'
                                }`}
                                onClick={() => toggleService(service.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleService(service.id)}
                                    className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <div className="truncate">
                                    <div className="font-medium text-sm text-gray-800 truncate">{service.name}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {service.price ? `₸ ${service.price.toLocaleString()}` : ''} 
                                      {service.duration ? ` • ${service.duration} min` : ''}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Form buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm"
              disabled={isLoading}
            >
              {isLoading 
                ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {initialData ? 'Updating...' : 'Creating...'}
                  </span>
                ) 
                : (initialData ? 'Update Staff' : 'Create Staff')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 