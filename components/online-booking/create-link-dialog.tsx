'use client';

import { useState, useEffect } from 'react';
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
import { getUsers } from '@/lib/api';

interface CreateLinkDialogProps {
  type: 'General' | 'Employee';
  onCreateLink: (link: Omit<BookingLink, 'id'>) => void;
  onCancel: () => void;
}

export function CreateLinkDialog({ type, onCreateLink, onCancel }: CreateLinkDialogProps) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (type === 'Employee') {
        try {
          setIsLoading(true);
          const data = await getUsers();
          setUsers(data);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchUsers();
  }, [type]);
  
  const generateRandomUrl = () => `n${Math.floor(Math.random() * 1000000)}.alteg.io`;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLink: Omit<BookingLink, 'id'> = {
      name: name || (type === 'Employee' ? `Employee Link` : `General Link`),
      type,
      url: generateRandomUrl(),
      ...(type === 'Employee' && { employeeId }),
    };
    
    onCreateLink(newLink);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === 'Employee' ? "Employee name" : "Link name"}
        />
      </div>
      
      {type === 'Employee' && (
        <div className="space-y-2">
          <Label htmlFor="employee">Employee</Label>
          <Select 
            value={employeeId} 
            onValueChange={setEmployeeId}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select employee"} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={type === 'Employee' && !employeeId}>Create Link</Button>
      </div>
    </form>
  );
}