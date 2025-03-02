'use client';

import { BookingLink } from '@/types';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface LinkItemProps {
  link: BookingLink;
}

export function LinkItemComponent({ link }: LinkItemProps) {
  const getBadgeVariant = (type: BookingLink['type']) => {
    switch (type) {
      case 'Main':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'General':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'Employee':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(`https://${text}`);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="grid grid-cols-3 items-center border rounded-md p-4 text-sm bg-white">
      <div>
        <div className="font-medium text-slate-900">{link.name}</div>
        {link.type === 'Employee' && (
          <div className="text-slate-500 text-xs">Bobby Pin</div>
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
            className="text-blue-500 hover:underline truncate max-w-[200px]"
          >
            {link.url}
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => copyToClipboard(link.url)}
          >
            <Copy className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            asChild
          >
            <a href={`https://${link.url}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 text-slate-500" />
            </a>
          </Button>
        </div>
        
        <Button className="ml-auto" variant="outline" size="sm">
          Set up
        </Button>
      </div>
    </div>
  );
}