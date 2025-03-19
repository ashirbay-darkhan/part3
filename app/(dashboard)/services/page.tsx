'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Tag, Menu, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicesList } from '@/components/services/services-list';
import { CategoriesList } from '@/components/services/categories-list';
import { CreateServiceDialog } from '@/components/services/create-service-dialog';
import { EditServiceDialog } from '@/components/services/edit-service-dialog';
import { DeleteServiceDialog } from '@/components/services/delete-service-dialog';
import { CreateCategoryDialog } from '@/components/services/create-category-dialog';
import { EditCategoryDialog } from '@/components/services/edit-category-dialog';
import { DeleteCategoryDialog } from '@/components/services/delete-category-dialog';
import { getBusinessServices, getBusinessServiceCategories, getServices } from '@/lib/api';
import { Service, ServiceCategory } from '@/types';
import { toast } from 'sonner';
import { DebugPanel } from '@/components/debug-panel';

export default function ServicesPage() {
  // Main tabs for switching between services and categories
  const [mainTab, setMainTab] = useState('services');
  // Service tabs for filtering services by category
  const [serviceTab, setServiceTab] = useState('all');
  
  // Dialogs state
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  
  // Selected items
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  
  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  // Replace your existing services fetch useEffect with this improved version
  useEffect(() => {
    const fetchServices = async () => {
      setIsServicesLoading(true);
      try {
        // Try to get the business ID
        const businessId = localStorage.getItem('business_id');
        let servicesData = null;
        
        if (businessId) {
          // Try to get data from localStorage first
          const storageKey = `services_${businessId}`;
          const cachedServices = localStorage.getItem(storageKey);
          
          if (cachedServices) {
            // Use the cached data if available
            servicesData = JSON.parse(cachedServices);
          } else {
            // No cached data, fetch from API
            servicesData = await getBusinessServices();
            
            // Save to localStorage for future use
            localStorage.setItem(storageKey, JSON.stringify(servicesData));
          }
        } else {
          // No business ID, fall back to API
          servicesData = await getBusinessServices();
        }
        
        setServices(servicesData || []);
      } catch (error) {
        toast.error('Failed to load services');
        setServices([]);
      } finally {
        setIsServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Remove the problematic effect that causes infinite loop
  useEffect(() => {
    // Removed logging
  }, [services]);

  // Fetch categories data with localStorage caching, similar to services
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        // Try to get the business ID
        const businessId = localStorage.getItem('business_id');
        let categoriesData = null;
        
        if (businessId) {
          // Try to get data from localStorage first
          const storageKey = `categories_${businessId}`;
          const cachedCategories = localStorage.getItem(storageKey);
          
          if (cachedCategories) {
            // Use the cached data if available
            categoriesData = JSON.parse(cachedCategories);
          } else {
            // No cached data, fetch from API
            categoriesData = await getBusinessServiceCategories();
            
            // Save to localStorage for future use
            localStorage.setItem(storageKey, JSON.stringify(categoriesData));
          }
        } else {
          // No business ID, fall back to API
          categoriesData = await getBusinessServiceCategories();
        }
        
        setCategories(categoriesData || []);
      } catch (error) {
        toast.error('Failed to load categories');
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Enhanced refresh function that intelligently updates cache
  const refreshData = (forceFetch = false) => {
    if (forceFetch) {
      // Clear localStorage cache to ensure fresh data
      const businessId = localStorage.getItem('business_id');
      if (businessId) {
        localStorage.removeItem(`services_${businessId}`);
        localStorage.removeItem(`categories_${businessId}`);
        localStorage.removeItem(`api_cache_services_${businessId}`);
      }
      // Reload page to fetch fresh data
      window.location.reload();
    } else {
      // Just reload the page
      window.location.reload();
    }
  };

  // Update manual refresh to support force fetch option
  const handleManualRefresh = () => {
    refreshData(true); // Always force fetch when using the manual refresh button
  };

  // Dialog handlers for services
  const handleCreateService = () => {
    setIsCreateServiceOpen(true);
  };

  const handleServiceCreated = () => {
    refreshData();
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditServiceOpen(true);
  };

  const handleServiceUpdated = (updatedService: Service) => {
    // Clear the selected service
    setSelectedService(null);
    
    // Update local state immediately with the data we already have
    if (updatedService && updatedService.id) {
      // Replace the service in our list
      setServices(currentServices => {
        // Create the updated services list
        const updatedServices = currentServices.map(service => 
          service.id === updatedService.id ? updatedService : service
        );
        
        // Also update in localStorage to maintain state consistency
        try {
          // Get business ID
          const businessId = localStorage.getItem('business_id');
          if (businessId) {
            // Store updated services in localStorage
            const storageKey = `services_${businessId}`;
            localStorage.setItem(storageKey, JSON.stringify(updatedServices));
            
            // Also update any cached API data if it exists
            const apiCacheKey = `api_cache_services_${businessId}`;
            if (localStorage.getItem(apiCacheKey)) {
              localStorage.setItem(apiCacheKey, JSON.stringify(updatedServices));
            }
          }
        } catch (error) {
          // Error handling without logging
        }
        
        return updatedServices;
      });
      
      // Show success toast
      toast.success('Service updated', { duration: 2000 });
            
    } else {
      // Handle invalid service update
      toast.error('Failed to update service - invalid data received');
      refreshData(true); // Force refresh with fresh data to ensure UI is in sync with server
    }
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setIsDeleteServiceOpen(true);
  };

  const handleServiceDeleted = () => {
    refreshData();
  };

  // Dialog handlers for categories
  const handleCreateCategory = () => {
    setIsCreateCategoryOpen(true);
  };

  const handleCategoryCreated = () => {
    refreshData();
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleCategoryUpdated = () => {
    refreshData();
  };

  const handleDeleteCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  const handleCategoryDeleted = () => {
    refreshData();
  };

  // Calculate service categories for tabs
  const tabCategories = [
    'all', // Special value for "All Services"
    ...[...new Set(services.map(service => service.category || 'Uncategorized'))]
  ];

  // Filter services by active tab
  const filteredServices = serviceTab === 'all' 
    ? services
    : services.filter(service => (service.category || 'Uncategorized') === serviceTab);

  // Calculate service count by category
  const serviceCountByCategory = categories.reduce<Record<string, number>>((acc, category) => {
    acc[category.id] = services.filter(service => service.category === category.name).length;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services</h1>
              <div className="flex items-center text-sm text-slate-500 mt-1">
                <span>Manage your services and service categories</span>
              </div>
            </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => refreshData(true)}
              title="Refresh data (force fetch from server)"
              className="mr-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Tabs value={mainTab} onValueChange={setMainTab} className="hidden sm:flex">
              <TabsList>
                <TabsTrigger value="services" className="flex gap-1.5">
                  <Menu className="h-4 w-4" />
                  <span>Services</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex gap-1.5">
                  <Tag className="h-4 w-4" />
                  <span>Categories</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {mainTab === 'services' ? (
              <Button onClick={handleCreateService} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Add Service</span>
                <span className="sm:hidden">New</span>
              </Button>
            ) : (
              <Button onClick={handleCreateCategory} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Add Category</span>
                <span className="sm:hidden">New</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="block sm:hidden mb-6">
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="w-full">
            <TabsTrigger value="services" className="flex-1 flex gap-1.5 justify-center">
              <Menu className="h-4 w-4" />
              <span>Services</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1 flex gap-1.5 justify-center">
              <Tag className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Services Tab */}
      {mainTab === 'services' && (
        <Tabs defaultValue="all" value={serviceTab} onValueChange={setServiceTab}>
          <TabsList className="mb-4 flex overflow-x-auto pb-1 px-0 justify-start">
            <TabsTrigger value="all" className="rounded-md">All Services</TabsTrigger>
            {tabCategories
              .filter(cat => cat !== 'all')
              .map(category => (
                <TabsTrigger key={category} value={category} className="rounded-md">
                  {category}
                </TabsTrigger>
              ))}
          </TabsList>

          <TabsContent value={serviceTab} className="mt-0">
            <ServicesList 
              services={filteredServices} 
              isLoading={isServicesLoading}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Categories Tab */}
      {mainTab === 'categories' && (
        <CategoriesList 
          categories={categories}
          isLoading={isCategoriesLoading}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onCreateClick={handleCreateCategory}
          serviceCountByCategory={serviceCountByCategory}
        />
      )}

      {/* Services Dialogs */}
      <CreateServiceDialog 
        open={isCreateServiceOpen} 
        onOpenChange={setIsCreateServiceOpen}
        onSuccess={handleServiceCreated}
      />

      {selectedService && (
        <>
          <EditServiceDialog 
            service={selectedService}
            open={isEditServiceOpen}
            onOpenChange={setIsEditServiceOpen}
            onSuccess={handleServiceUpdated}
          />

          <DeleteServiceDialog 
            service={selectedService}
            open={isDeleteServiceOpen}
            onOpenChange={setIsDeleteServiceOpen}
            onSuccess={handleServiceDeleted}
          />
        </>
      )}

      {/* Categories Dialogs */}
      <CreateCategoryDialog
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
        onSuccess={handleCategoryCreated}
      />
      {selectedCategory && (
        <>
          <EditCategoryDialog
            open={isEditCategoryOpen}
            onOpenChange={setIsEditCategoryOpen}
            category={selectedCategory}
            onSuccess={handleCategoryUpdated}
          />
          <DeleteCategoryDialog
            open={isDeleteCategoryOpen}
            onOpenChange={setIsDeleteCategoryOpen}
            category={selectedCategory}
            onSuccess={handleCategoryDeleted}
          />
        </>
      )}

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
}