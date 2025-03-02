'use client';

import { useState } from 'react';
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
import { users } from '@/lib/dummy-data';

interface CreateLinkDialogProps {
  type: 'General' | 'Employee';
  onCreateLink: (link: BookingLink) => void;
  onCancel: () => void;
}

export function CreateLinkDialog({ type, onCreateLink, onCancel }: CreateLinkDialogProps) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  
  const generateRandomId = () => Math.random().toString(36).substring(2, 10);
  const generateRandomUrl = () => `n${Math.floor(Math.random() * 1000000)}.alteg.io`;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLink: BookingLink = {
      id: generateRandomId(),
      name: name || (type === 'Employee' ? `Employee ${generateRandomId()}` : `General ${generateRandomId()}`),
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
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
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
        <Button type="submit">Create Link</Button>
      </div>
    </form>
  );
}