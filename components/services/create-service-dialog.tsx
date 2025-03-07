'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { createBusinessService } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Define the form schema for service creation
const serviceFormSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  category: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

// Predefined category options
const categoryOptions = [
  'Haircut', 
  'Styling', 
  'Color', 
  'Treatment', 
  'Makeup', 
  'Skincare',
  'Nails',
  'Massage',
  'Other'
];

interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateServiceDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: CreateServiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: undefined,
    },
  });

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    
    try {
      await createBusinessService({
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        category: data.category,
      });
      
      toast.success('Service created successfully');
      reset(); // Reset form
      onOpenChange(false); // Close dialog
      
      // Call onSuccess after a short delay to ensure the dialog is closed
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
          <DialogDescription>
            Add a new service to your business offerings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="e.g., Men's Haircut"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your service..."
              className="min-h-[80px]"
              {...register('description')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) <span className="text-red-500">*</span></Label>
              <Input
                id="duration"
                type="number"
                placeholder="60"
                {...register('duration')}
              />
              {errors.duration && (
                <p className="text-xs text-red-500">{errors.duration.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (₸) <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                type="number"
                placeholder="2000"
                {...register('price')}
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}