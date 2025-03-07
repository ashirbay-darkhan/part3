'use client';

import { useState, useEffect } from 'react';
import { Info, Plus, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { BookingLinksList } from '@/components/online-booking/booking-links-list';
import { CreateLinkDialog } from '@/components/online-booking/create-link-dialog';
import { DeleteLinkDialog } from '@/components/online-booking/delete-link-dialog';
import { BookingLink } from '@/types';
import { getBusinessBookingLinks, deleteBookingLink } from '@/lib/api';

export default function OnlineBookingPage() {
  const [links, setLinks] = useState<BookingLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'General' | 'Employee'>('General');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<BookingLink | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch links data
  useEffect(() => {
    const fetchLinks = async () => {
      setIsLoading(true);
      try {
        const data = await getBusinessBookingLinks();
        // Filter out malformed links
        const validLinks = data.filter(link => 
          typeof link.name === 'string' && 
          typeof link.type === 'string' && 
          typeof link.url === 'string'
        );
        setLinks(validLinks);
      } catch (error) {
        console.error('Error fetching booking links:', error);
        toast.error('Failed to load booking links');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [refreshKey]);

  const handleCreateLink = async (newLink: Omit<BookingLink, 'id'>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Add a small delay
      setIsCreateDialogOpen(false);
      setRefreshKey(prev => prev + 1); // Trigger refresh
      toast.success('Link created successfully');
    } catch (error) {
      console.error('Error creating booking link:', error);
      toast.error('Failed to create booking link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = (link: BookingLink) => {
    setSelectedLink(link);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLink = async () => {
    if (!selectedLink) return;
    
    setIsLoading(true);
    try {
      await deleteBookingLink(selectedLink.id);
      setIsDeleteDialogOpen(false);
      setRefreshKey(prev => prev + 1); // Trigger refresh
      toast.success('Link deleted successfully');
    } catch (error) {
      console.error('Error deleting booking link:', error);
      toast.error('Failed to delete booking link');
    } finally {
      setIsLoading(false);
      setSelectedLink(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Online booking</h1>
        <div className="flex items-center text-sm text-slate-500 mt-1">
          <span>Online booking</span>
          <span className="mx-2">•</span>
          <span>Online booking links</span>
        </div>
      </div>
      
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setCreateType('General');
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              General link
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setCreateType('Employee');
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Employee link
            </Button>
          </div>

          <BookingLinksList 
            links={links} 
            isLoading={isLoading} 
            onDelete={handleDeleteLink} 
          />
        </CardContent>
      </Card>

      <CreateLinkDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        type={createType}
        onCreateLink={handleCreateLink}
        onCancel={() => setIsCreateDialogOpen(false)}
      />

      {selectedLink && (
        <DeleteLinkDialog 
          link={selectedLink}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteLink}
        />
      )}
    </div>
  );
}