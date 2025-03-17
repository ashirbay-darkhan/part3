'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Tag, Menu } from 'lucide-react';
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

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      setIsServicesLoading(true);
      try {
        console.log('[ServicesPage] Fetching services, refreshKey:', refreshKey);
        const data = await getBusinessServices();
        console.log('[ServicesPage] Fetched services:', data);
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsServicesLoading(false);
      }
    };

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

  // Refresh data helper function that can be called from anywhere
  const refreshData = () => {
    console.log('[ServicesPage] Refreshing data');
    
    // Clear existing data first to avoid stale UI
    setServices([]);
    
    // Force re-fetch by updating the refresh key
    setRefreshKey(prevKey => prevKey + 1);
    
    // Show refresh toast
    toast.success('Refreshing data...', {
      duration: 1000,
      position: 'bottom-right'
    });
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

  const handleServiceUpdated = () => {
    console.log('[ServicesPage] Service updated, refreshing');
    
    // Force immediate UI update by patching the local service data
    if (selectedService) {
      console.log('[ServicesPage] Patching local service data before refresh');
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === selectedService.id ? {...selectedService} : service
        )
      );
    }
    
    // Then trigger a full data refresh
    setTimeout(() => {
      refreshData();
    }, 100);
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