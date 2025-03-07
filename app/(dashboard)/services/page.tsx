'use client';

import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServicesList } from '@/components/services/services-list';
import { CreateServiceDialog } from '@/components/services/create-service-dialog';
import { EditServiceDialog } from '@/components/services/edit-service-dialog';
import { DeleteServiceDialog } from '@/components/services/delete-service-dialog';
import { getBusinessServices } from '@/lib/api';
import { Service } from '@/types';
import { toast } from 'sonner';

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refetching

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const data = await getBusinessServices();
        setServices(data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [refreshKey]); // Refetch when refreshKey changes

  const handleCreateService = () => {
    setIsCreateOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  const handleSuccess = () => {
    // Increment refreshKey to trigger data refetch
    setRefreshKey(prev => prev + 1);
  };

  // Calculate service categories for tabs
  const categories = [...new Set(services.map(service => service.category || 'Uncategorized'))];

  // Filter services by active tab
  const filteredServices = activeTab === 'all' 
    ? services
    : services.filter(service => (service.category || 'Uncategorized') === activeTab);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services</h1>
            <div className="flex items-center text-sm text-slate-500 mt-1">
              <span>Manage your services and pricing</span>
            </div>
          </div>
          <Button onClick={handleCreateService} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Service</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Services</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <ServicesList 
            services={filteredServices} 
            isLoading={isLoading}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
          />
        </TabsContent>
      </Tabs>

      <CreateServiceDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onSuccess={handleSuccess}
      />

      {selectedService && (
        <>
          <EditServiceDialog 
            service={selectedService}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSuccess={handleSuccess}
          />

          <DeleteServiceDialog 
            service={selectedService}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
}