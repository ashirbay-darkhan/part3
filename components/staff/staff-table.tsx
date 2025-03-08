'use client';

import { useState, useEffect } from 'react';
import { BusinessUser, Service } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/authContext';
import { getBusinessServices } from '@/lib/api/staff-service';

interface StaffTableProps {
  staffMembers: BusinessUser[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (staff: BusinessUser) => void;
}

export function StaffTable({ staffMembers, onDelete, onEdit }: StaffTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [services, setServices] = useState<Record<string, Service>>({});
  
  // Load services
  useEffect(() => {
    const fetchServices = async () => {
      if (user?.businessId) {
        try {
          const servicesData = await getBusinessServices(user.businessId);
          // Create a map of service IDs to services
          const servicesMap = servicesData.reduce((acc, service) => {
            acc[service.id] = service;
            return acc;
          }, {} as Record<string, Service>);
          setServices(servicesMap);
        } catch (error) {
          console.error('Failed to load services:', error);
        }
      }
    };
    
    fetchServices();
  }, [user?.businessId]);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await onDelete(id);
      toast({
        title: "Staff member deleted",
        description: "The staff member has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setStaffToDelete(null);
    }
  };

  // Get service name by ID
  const getServiceName = (serviceId: string) => {
    return services[serviceId]?.name || 'Unknown Service';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            staffMembers.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {staff.serviceIds && staff.serviceIds.length > 0 ? (
                      staff.serviceIds.map((serviceId) => (
                        <Badge key={serviceId} variant="outline" className="text-xs">
                          {getServiceName(serviceId)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No services</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={staff.isVerified ? 'default' : 'secondary'}>
                    {staff.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onEdit(staff)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => setStaffToDelete(staff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {staff.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(staff.id);
                            }}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 