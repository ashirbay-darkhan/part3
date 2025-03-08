'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaffTable } from '@/components/staff/staff-table';
import { StaffForm } from '@/components/staff/staff-form';
import { useAuth } from '@/lib/auth/authContext';
import { BusinessUser } from '@/types';
import { 
  getBusinessStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff,
  CreateStaffParams,
  UpdateStaffParams 
} from '@/lib/api/staff-service';
import { useToast } from '@/components/ui/use-toast';

export default function StaffPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staffMembers, setStaffMembers] = useState<BusinessUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<BusinessUser | null>(null);

  // Load staff on component mount
  useEffect(() => {
    if (user?.businessId) {
      loadStaff();
    }
  }, [user?.businessId]);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const data = await getBusinessStaff(user?.businessId || '');
      setStaffMembers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load staff members. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffMembers.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStaff = () => {
    setCurrentStaff(null);
    setIsFormOpen(true);
  };

  const handleEditStaff = (staff: BusinessUser) => {
    setCurrentStaff(staff);
    setIsFormOpen(true);
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaff(id);
      // Refresh the staff list
      loadStaff();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete staff member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (currentStaff) {
        // Update existing staff
        const updateParams: UpdateStaffParams = {
          id: currentStaff.id,
          name: data.name,
          email: data.email,
          serviceIds: data.serviceIds,
        };
        
        await updateStaff(updateParams);
      } else {
        // Create new staff
        const createParams: CreateStaffParams = {
          name: data.name,
          email: data.email,
          serviceIds: data.serviceIds,
          businessId: user?.businessId || '',
          businessName: user?.businessName || '',
        };
        
        await createStaff(createParams);
      }
      
      // Refresh staff list and close the form
      loadStaff();
      setIsFormOpen(false);
      setCurrentStaff(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${currentStaff ? 'update' : 'create'} staff member. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
        <Button onClick={handleAddStaff}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search staff..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading staff members...</p>
        </div>
      ) : (
        <StaffTable 
          staffMembers={filteredStaff} 
          onDelete={handleDeleteStaff}
          onEdit={handleEditStaff}
        />
      )}

      <StaffForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={currentStaff}
      />
    </div>
  );
}