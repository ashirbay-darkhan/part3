'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BusinessUser, Service } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/authContext';
import { getBusinessServices } from '@/lib/api/staff-service';
import { Avatar } from '@/components/ui/avatar-fallback';

const staffFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  serviceIds: z.array(z.string()),
  avatar: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormValues) => Promise<void>;
  initialData?: BusinessUser | null;
}

export function StaffForm({ isOpen, onClose, onSubmit, initialData }: StaffFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  
  // Load services
  useEffect(() => {
    const fetchServices = async () => {
      if (user?.businessId) {
        try {
          const servicesData = await getBusinessServices(user.businessId);
          setServices(servicesData);
        } catch (error) {
          console.error('Failed to load services:', error);
        }
      }
    };
    
    fetchServices();
  }, [user?.businessId]);
  
  // Setup form with initial values
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: initialData 
      ? {
          name: initialData.name,
          email: initialData.email,
          serviceIds: initialData.serviceIds || [],
          avatar: initialData.avatar || '',
        }
      : {
          name: '',
          email: '',
          serviceIds: [],
          avatar: '',
        },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        serviceIds: initialData.serviceIds || [],
        avatar: initialData.avatar || '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        serviceIds: [],
        avatar: '',
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: StaffFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast({
        title: initialData ? 'Staff updated' : 'Staff created',
        description: initialData
          ? 'Staff member has been updated successfully.'
          : 'New staff member has been created successfully.',
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${initialData ? 'update' : 'create'} staff member. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Update staff member details below.' 
              : 'Fill in the details below to create a new staff member.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar 
                      src={field.value} 
                      name={form.getValues("name") || "Staff"} 
                      className="w-16 h-16" 
                    />
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/avatar.jpg" 
                        type="url" 
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Enter a URL for the staff member's profile picture
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Services</FormLabel>
              <p className="text-sm text-slate-500 mb-3">
                Select which services this staff member can provide
              </p>
              
              {services.length === 0 ? (
                <div className="text-sm text-slate-500">No services available. Add services in the Services page first.</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                  {services.map((service) => (
                    <FormField
                      key={service.id}
                      control={form.control}
                      name="serviceIds"
                      render={({ field }) => {
                        return (
                          <FormItem key={service.id} className="flex flex-row items-start space-x-3 space-y-0 mb-1">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(service.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, service.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== service.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <div className="grid gap-1.5 leading-none">
                              <FormLabel className="font-medium cursor-pointer text-base">
                                {service.name}
                              </FormLabel>
                              <p className="text-sm text-slate-500">
                                {service.price ? `$${service.price}` : ''} 
                                {service.duration ? ` • ${service.duration} min` : ''}
                                {service.category ? ` • ${service.category}` : ''}
                              </p>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 