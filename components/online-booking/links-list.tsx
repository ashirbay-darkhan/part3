'use client';

import { useState, useEffect } from 'react';
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
import { BookingLink } from '@/types';
import { getBusinessBookingLinks, createBusinessBookingLink } from '@/lib/api';
import { useAuth } from '@/lib/auth/authContext';
import { toast } from 'sonner';

export function LinksListComponent() {
  const [links, setLinks] = useState<BookingLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'General' | 'Employee'>('General');
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getBusinessBookingLinks(user.businessId);
        setLinks(data);
      } catch (error) {
        console.error('Error fetching booking links:', error);
        toast.error('Failed to load booking links');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLinks();
  }, [user]);
  
  const handleCreateLink = async (newLink: Omit<BookingLink, 'id'>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const createdLink = await createBusinessBookingLink(user.businessId, newLink);
      setLinks((prev) => [...prev, createdLink]);
      setIsCreateDialogOpen(false);
      toast.success('Link created successfully');
    } catch (error) {
      console.error('Error creating booking link:', error);
      toast.error('Failed to create booking link');
    } finally {
      setIsLoading(false);
    }
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
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-3 items-center border rounded-md p-4 text-sm bg-white animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-48"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <LinkItemComponent key={link.id} link={link} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}