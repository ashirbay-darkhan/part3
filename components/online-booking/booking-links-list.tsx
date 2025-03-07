'use client';

import { Copy, ExternalLink, Trash2, Settings, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BookingLink } from '@/types';

interface BookingLinksListProps {
  links: BookingLink[];
  isLoading: boolean;
  onDelete: (link: BookingLink) => void;
}

export function BookingLinksList({ links, isLoading, onDelete }: BookingLinksListProps) {
  const getBadgeVariant = (type: BookingLink['type']) => {
    switch (type) {
      case 'Main':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'General':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'Employee':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(`https://${text}`);
    toast.success('Link copied to clipboard');
  };

  const openLinkInNewTab = (url: string) => {
    window.open(`https://${url}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-md p-4 border animate-pulse">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <Link2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-medium mb-2">No booking links yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Create your first booking link to share with your clients and start receiving online bookings.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 text-sm font-medium text-slate-500 mb-2 px-4">
        <div>Name</div>
        <div>Type</div>
        <div>Link</div>
      </div>
      
      <div className="space-y-2">
        {links.map((link) => (
          <div 
            key={link.id} 
            className="grid grid-cols-3 items-center border rounded-md p-4 text-sm bg-white dark:bg-gray-800"
          >
            <div>
              <div className="font-medium text-slate-900 dark:text-white">{link.name}</div>
              {link.type === 'Employee' && link.employeeName && (
                <div className="text-slate-500 text-xs">{link.employeeName}</div>
              )}
            </div>
            
            <div>
              <Badge className={getBadgeVariant(link.type)} variant="secondary">
                {link.type}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <a 
                  href={`https://${link.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline truncate max-w-[150px] sm:max-w-[200px]"
                >
                  {link.url}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(link.url)}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4 text-slate-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openLinkInNewTab(link.url)}
                  title="Open link"
                >
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 gap-1"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Set up</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(link)}
                  title="Delete link"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}