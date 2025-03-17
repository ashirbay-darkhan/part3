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
import { getBusinessServices, getBusinessServiceCategories } from '@/lib/api';
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
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refetching

  // Replace your existing services fetch useEffect with this improved version
  useEffect(() => {
    const fetchServices = async () => {
      setIsServicesLoading(true);
      try {
        console.log('[ServicesPage] Fetching services, refreshKey:', refreshKey);
        
        // Try direct fetch first for freshest data
        const directData = await fetchServicesDirectly();
        
        if (directData.length > 0) {
          console.log('[ServicesPage] Using directly fetched services:', directData);
          setServices(directData);
        } else {
          // Fall back to regular API if direct fetch returns no data
          console.log('[ServicesPage] Direct fetch returned no data, trying API');
          const apiData = await getBusinessServices();
          console.log('[ServicesPage] Fetched services from API:', apiData);
          setServices(apiData);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsServicesLoading(false);
      }
    };

    // Get URL query parameters to detect if page was loaded with a timestamp
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const hasTimestamp = urlParams?.has('t');
    
    // If there's a timestamp in the URL, clean it up by removing query params
    if (hasTimestamp && typeof window !== 'undefined') {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    fetchServices();
  }, [refreshKey]); // Refetch when refreshKey changes

  // Fetch categories data
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const data = await getBusinessServiceCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [refreshKey]); // Refetch when refreshKey changes

  // Replace your existing refreshData function with this one
const refreshData = async () => {
  console.log('[ServicesPage] Refreshing data');
  
  // Show loading state and clear existing data
  setIsServicesLoading(true);
  setServices([]);
  
  // Show refresh toast
  const toastId = toast.loading('Refreshing data...', {
    position: 'bottom-right'
  });
  
  try {
    // First try the direct fetch method for immediate fresh data
    const freshServices = await fetchServicesDirectly();
    
    // Update with fresh data
    setServices(freshServices);
    setIsServicesLoading(false);
    
    // Update toast
    toast.success('Data refreshed successfully', {
      id: toastId,
      duration: 2000
    });
    
    // Force re-fetch by updating the refresh key (as backup)
    setRefreshKey(prevKey => prevKey + 1);
  } catch (error) {
    console.error('[ServicesPage] Error refreshing data:', error);
    
    // Fall back to the regular method if direct fetch fails
    const fallbackId = toast.loading('Trying alternative refresh method...', {
      position: 'bottom-right'
    });
    
    // Force re-fetch by updating the refresh key
    setRefreshKey(prevKey => prevKey + 1);
    
    // Update toast
    setTimeout(() => {
      toast.success('Data refresh complete', {
        id: fallbackId,
        duration: 2000
      });
    }, 1000);
  }
};

  // Add a manual refresh button to the page header
  const handleManualRefresh = () => {
    console.log('[ServicesPage] Manual refresh triggered');
    refreshData();
  };

  // Dialog handlers for services
  const handleCreateService = () => {
    setIsCreateServiceOpen(true);
  };

  const handleServiceCreated = () => {
    console.log('[ServicesPage] Service created, refreshing');
    refreshData();
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditServiceOpen(true);
  };

  // Add this function to your services/page.tsx file
// This ensures we get the freshest data directly from db.json

const fetchServicesDirectly = async (): Promise<Service[]> => {
  try {
    console.log('[ServicesPage] Directly fetching services from db.json');
    
    // Get the business ID from localStorage
    const businessId = localStorage.getItem('business_id');
    if (!businessId) {
      console.error('[ServicesPage] No business ID found in localStorage');
      return [];
    }
    
    // Direct fetch with cache busting
    const response = await fetch(`http://localhost:3001/services?_=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status}`);
    }
    
    // Parse all services
    const allServices = await response.json();
    console.log('[ServicesPage] All services from direct fetch:', allServices);
    
    // Filter for this business
    const businessServices = allServices.filter((service: any) => 
      service.businessId && service.businessId.toString() === businessId.toString()
    );
    
    console.log('[ServicesPage] Filtered services for business:', businessServices);
    return businessServices;
  } catch (error) {
    console.error('[ServicesPage] Direct fetch error:', error);
    toast.error('Failed to refresh services data');
    return [];
  }
};

  // Replace your handleServiceUpdated function with this enhanced version
  const handleServiceUpdated = async (updatedService: Service) => {
    console.log('[ServicesPage] Service updated with data:', updatedService);
    
    // Clear the selected service
    setSelectedService(null);
    
    // Show a loading toast
    const toastId = toast.loading('Updating service list...', {
      position: 'bottom-right'
    });
    
    try {
      // Wait for a short time to ensure DB has been updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get fresh data directly from db.json
      const freshServices = await fetchServicesDirectly();
      
      // Update the state with fresh data
      setServices([]); // Clear first
      setTimeout(() => {
        setServices(freshServices);
        
        // Update toast
        toast.success('Service updated successfully', {
          id: toastId,
          duration: 2000
        });
      }, 50);
    } catch (error) {
      console.error('[ServicesPage] Error refreshing after update:', error);
      
      // Fall back to simple UI update if fetch fails
      if (updatedService && updatedService.id) {
        const updatedServices = services.map(service => 
          service.id === updatedService.id ? { ...updatedService } : { ...service }
        );
        
        setServices([]); // Clear first
        setTimeout(() => {
          setServices(updatedServices);
          
          // Update toast
          toast.success('Service updated in UI (fallback mode)', {
            id: toastId,
            duration: 2000
          });
        }, 50);
      } else {
        // Force full refresh as last resort
        toast.error('Falling back to full refresh', {
          id: toastId
        });
        setTimeout(() => refreshData(), 100);
      }
    }
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setIsDeleteServiceOpen(true);
  };

  const handleServiceDeleted = () => {
    console.log('[ServicesPage] Service deleted, refreshing');
    refreshData();
  };

  // Dialog handlers for categories
  const handleCreateCategory = () => {
    setIsCreateCategoryOpen(true);
  };

  const handleCategoryCreated = () => {
    console.log('[ServicesPage] Category created, refreshing');
    refreshData();
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsEditCategoryOpen(true);
  };

  const handleCategoryUpdated = () => {
    console.log('[ServicesPage] Category updated, refreshing');
    refreshData();
  };

  const handleDeleteCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsDeleteCategoryOpen(true);
  };

  const handleCategoryDeleted = () => {
    console.log('[ServicesPage] Category deleted, refreshing');
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
              onClick={refreshData}
              title="Refresh data"
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