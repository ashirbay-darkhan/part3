'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookingLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getUsers, createBusinessBookingLink } from '@/lib/api';

// Define form schema
const linkFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  employeeId: z.string().optional(),
});

type LinkFormValues = z.infer<typeof linkFormSchema>;

interface CreateLinkDialogProps {
  type: 'General' | 'Employee';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLink: (link: Omit<BookingLink, 'id'>) => void;
  onCancel: () => void;
}

export function CreateLinkDialog({ 
  type, 
  open, 
  onOpenChange, 
  onCreateLink, 
  onCancel 
}: CreateLinkDialogProps) {
  const [users, setUsers] = useState<Array<{id: string; name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      name: '',
      employeeId: undefined,
    },
  });
  
  const selectedEmployeeId = watch('employeeId');

  // Fetch users for employee selection
  useEffect(() => {
    if (type === 'Employee' && open) {
      setIsFetchingUsers(true);
      getUsers()
        .then(data => {
          setUsers(data.map(user => ({ id: user.id, name: user.name })));
        })
        .catch(error => {
          console.error('Error fetching users:', error);
        })
        .finally(() => {
          setIsFetchingUsers(false);
        });
    }
  }, [type, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const generateRandomUrl = () => {
    // Generate a random string for the URL
    const randomNum = Math.floor(Math.random() * 1000000);
    return `n${randomNum}.alteg.io`;
  };

  const onSubmit = async (data: LinkFormValues) => {
    setIsLoading(true);
    
    try {
      // Create new link object
      const newLink: Omit<BookingLink, 'id'> = {
        name: data.name,
        type,
        url: generateRandomUrl(),
      };
      
      // Add employeeId for Employee type links
      if (type === 'Employee' && data.employeeId) {
        newLink.employeeId = data.employeeId;
        
        // Add employeeName for display purposes
        const selectedEmployee = users.find(user => user.id === data.employeeId);
        if (selectedEmployee) {
          newLink.employeeName = selectedEmployee.name;
        }
      }
      
      // Create the link
      await createBusinessBookingLink(newLink);
      
      // Close dialog and notify parent
      onCreateLink(newLink);
    } catch (error) {
      console.error('Error creating link:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create {type} Link</DialogTitle>
          <DialogDescription>
            {type === 'General' 
              ? 'Create a booking link for your entire business.'
              : 'Create a booking link for a specific staff member.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Link Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder={type === 'Employee' ? "Staff Booking Link" : "Online Booking"}
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          {type === 'Employee' && (
            <div className="space-y-2">
              <Label htmlFor="employee">Employee <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => setValue('employeeId', value)}
                disabled={isLoading || isFetchingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isFetchingUsers ? "Loading..." : "Select an employee"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {type === 'Employee' && !selectedEmployeeId && (
                <p className="text-xs text-amber-500">Please select an employee for this link.</p>
              )}
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (type === 'Employee' && !selectedEmployeeId)}
            >
              {isLoading ? 'Creating...' : 'Create Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}