'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { BookingLinksList } from '@/components/online-booking/booking-links-list';
import { CreateLinkDialog } from '@/components/online-booking/create-link-dialog';
import { DeleteLinkDialog } from '@/components/online-booking/delete-link-dialog';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Copy, LinkIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/authContext';
import { getBusinessBookingLinks, createBusinessBookingLink, deleteBookingLink } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { BookingLink } from '@/types';

export default function BookingLinksPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState<BookingLink[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [linkTypeToCreate, setLinkTypeToCreate] = useState<'General' | 'Employee'>('General');
  const [linkToDelete, setLinkToDelete] = useState<BookingLink | null>(null);

  // Helper function to generate random 7-10 digit ID
  const generateRandomId = () => {
    const min = 1000000;  // 7 digits minimum
    const max = 9999999999;  // 10 digits maximum
    return Math.floor(min + Math.random() * (max - min)).toString();
  };

  // State for personal booking link ID
  const [personalLinkId, setPersonalLinkId] = useState<string>("");

  // Generate personal booking link ID on component mount
  useEffect(() => {
    if (user?.businessId && !personalLinkId) {
      // Check if a personal link already exists in localStorage
      const savedLinkId = localStorage.getItem(`personal_link_${user.businessId}`);
      if (savedLinkId) {
        setPersonalLinkId(savedLinkId);
      } else {
        // Generate a new ID and save it
        const newLinkId = generateRandomId();
        localStorage.setItem(`personal_link_${user.businessId}`, newLinkId);
        // Also store the reverse mapping from link ID to business ID
        localStorage.setItem(`link_id_to_business_${newLinkId}`, user.businessId || '');
        setPersonalLinkId(newLinkId);
      }
    }
  }, [user?.businessId, personalLinkId]);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoading(true);
        const data = await getBusinessBookingLinks();
        
        // Convert any old format IDs to new format
        const updatedLinks = data.map(link => {
          // If the ID is not already a 7+ digit number, generate a new one
          if (!/^\d{7,}$/.test(link.id)) {
            // Check if we already have a stored ID for this link
            const storedId = localStorage.getItem(`link_${link.id}`);
            if (storedId) {
              // Also make sure the reverse mapping is stored
              localStorage.setItem(`link_id_to_business_${storedId}`, link.businessId || user?.businessId || '');
              return { ...link, id: storedId };
            } else {
              // Generate a new ID and store it
              const newId = generateRandomId();
              localStorage.setItem(`link_${link.id}`, newId);
              // Also store the reverse mapping from link ID to business ID
              localStorage.setItem(`link_id_to_business_${newId}`, link.businessId || user?.businessId || '');
              return { ...link, id: newId };
            }
          }
          // Store the mapping for existing numeric IDs too
          localStorage.setItem(`link_id_to_business_${link.id}`, link.businessId || user?.businessId || '');
          return link;
        });
        
        setLinks(updatedLinks);
      } catch (error) {
        console.error('Error fetching booking links:', error);
        toast({
          title: 'Error',
          description: 'Failed to load booking links.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [user?.businessId]);

  const handleCreateLink = async (link: Omit<BookingLink, 'id'>) => {
    try {
      // Make sure the link has the business ID
      const linkWithBusinessId = {
        ...link,
        businessId: user?.businessId || ''
      };
      
      const newLink = await createBusinessBookingLink(linkWithBusinessId);
      setLinks(prev => [...prev, newLink] as BookingLink[]);
      toast({
        title: 'Success!',
        description: 'Booking link created successfully.',
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating booking link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking link.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLink = async (link: BookingLink) => {
    try {
      await deleteBookingLink(link.id);
      setLinks(prev => prev.filter(l => l.id !== link.id));
      toast({
        title: 'Success!',
        description: 'Booking link deleted successfully.',
      });
      setLinkToDelete(null);
    } catch (error) {
      console.error('Error deleting booking link:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete booking link.',
        variant: 'destructive',
      });
    }
  };

  // Helper function to copy link to clipboard
  const copyToClipboard = (linkId: string) => {
    const url = `${window.location.origin}/form/${linkId}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link copied!",
      description: "Booking link copied to clipboard"
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Booking Links</h1>
          <p className="text-muted-foreground">Manage your booking links and share them with clients</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => {
              setLinkTypeToCreate('General');
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create General Link
          </Button>
          <Button 
            onClick={() => {
              setLinkTypeToCreate('Employee');
              setIsCreateDialogOpen(true);
            }}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Staff Link
          </Button>
        </div>
      </div>

      {/* Personal business booking link */}
      {user?.businessId && personalLinkId && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Personal Booking Link</CardTitle>
            <CardDescription>
              Share this link with clients to let them book appointments directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
              <div className="flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">{`${window.location.origin}/form/${personalLinkId}`}</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(personalLinkId)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/form/${personalLinkId}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking links list */}
      <BookingLinksList
        links={links}
        isLoading={isLoading}
        onDelete={(link) => setLinkToDelete(link)}
      />

      {/* Create link dialog */}
      <CreateLinkDialog
        type={linkTypeToCreate}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateLink={handleCreateLink}
        onCancel={() => setIsCreateDialogOpen(false)}
      />

      {/* Delete link dialog */}
      {linkToDelete && (
        <DeleteLinkDialog
          open={!!linkToDelete}
          onOpenChange={() => setLinkToDelete(null)}
          onConfirm={() => linkToDelete && handleDeleteLink(linkToDelete)}
          linkName={linkToDelete.name || ''}
        />
      )}
    </div>
  );
} 