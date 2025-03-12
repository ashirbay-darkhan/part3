'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingLink } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['General', 'Employee']),
  employeeId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  const [employees, setEmployees] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Alex Johnson' },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type,
      employeeId: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    const selectedEmployee = values.employeeId 
      ? employees.find(e => e.id === values.employeeId) 
      : null;

    const linkData: Omit<BookingLink, 'id'> = {
      name: values.name,
      type: values.type,
      employeeId: values.employeeId,
      employeeName: selectedEmployee?.name || '',
    };

    onCreateLink(linkData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create {type} Booking Link</DialogTitle>
          <DialogDescription>
            {type === 'General' 
              ? 'Create a general booking link for your business.'
              : 'Create a booking link for a specific staff member.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={type === 'General' ? "General booking" : "Staff booking"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Employee">Staff Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('type') === 'Employee' && (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Member</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Create Link</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}