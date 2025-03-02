'use client';

import { useState } from 'react';
import { Plus, Info, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LinkItemComponent } from './link-item';
import { CreateLinkDialog } from './create-link-dialog';
import { bookingLinks } from '@/lib/dummy-data';
import { BookingLink } from '@/types';
import { toast } from 'sonner';

export function LinksListComponent() {
  const [links, setLinks] = useState<BookingLink[]>(bookingLinks);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'General' | 'Employee'>('General');
  
  const handleCreateLink = (newLink: BookingLink) => {
    setLinks((prev) => [...prev, newLink]);
    setIsCreateDialogOpen(false);
    toast.success('Link created successfully');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Links list</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80">
                    Here you can manage booking links that you can share with your clients.
                    General links are for the whole business, Employee links are specific to individual staff members.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <Dialog open={isCreateDialogOpen && createType === 'General'} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (open) setCreateType('General');
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                General link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create General Link</DialogTitle>
              </DialogHeader>
              <CreateLinkDialog 
                type="General" 
                onCreateLink={handleCreateLink} 
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen && createType === 'Employee'} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (open) setCreateType('Employee');
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Employee link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Employee Link</DialogTitle>
              </DialogHeader>
              <CreateLinkDialog 
                type="Employee" 
                onCreateLink={handleCreateLink} 
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 text-sm font-medium text-slate-500 mb-2 px-4">
          <div>Name</div>
          <div>Type</div>
          <div>Link</div>
        </div>
        
        <div className="space-y-2">
          {links.map((link) => (
            <LinkItemComponent key={link.id} link={link} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}