'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Copy, Trash2, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingLink } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface BookingLinksListProps {
  links: BookingLink[];
  isLoading: boolean;
  onDelete: (link: BookingLink) => void;
}

export function BookingLinksList({ links, isLoading, onDelete }: BookingLinksListProps) {
  // Helper function to copy link to clipboard
  const copyToClipboard = (linkId: string) => {
    const url = `${window.location.origin}/form/${linkId}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link copied!",
      description: "Booking link copied to clipboard"
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-3">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Links</CardTitle>
          <CardDescription>Create and manage links for clients to book appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <LinkIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No booking links yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first booking link to share with clients
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Links</CardTitle>
        <CardDescription>Create and manage links for clients to book appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {links.map((link) => (
            <div 
              key={link.id} 
              className="flex items-center justify-between p-4 border rounded-md hover:bg-secondary/50 transition-colors"
            >
              <div className="flex flex-col space-y-1">
                <div className="font-medium">{link.name}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <LinkIcon className="h-3.5 w-3.5 mr-1" />
                  {`${window.location.origin}/form/${link.id}`}
                </div>
                {link.type === 'Employee' && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Staff member: {link.employeeName || 'Unknown'}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(link.id)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/form/${link.id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(link)}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}