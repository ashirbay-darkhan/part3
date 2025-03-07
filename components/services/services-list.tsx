'use client';

import { useState } from 'react';
import {
  Clock,
  DollarSign,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServicesListProps {
  services: Service[];
  isLoading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function ServicesList({ services, isLoading, onEdit, onDelete }: ServicesListProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Filter services by search term
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    service.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort services based on sortBy value
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'duration':
        return a.duration - b.duration;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-3"></div>
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-3"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sortedServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {services.length === 0
              ? "You haven't added any services yet."
              : "No services match your search criteria."}
          </p>
          {search && (
            <Button variant="outline" onClick={() => setSearch('')}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map((service) => (
            <Card key={service.id} className="overflow-hidden border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(service)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => onDelete(service)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {service.category && (
                  <Badge variant="secondary" className="mt-1">
                    {service.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                  {service.description || 'No description provided'}
                </p>
                <div className="flex justify-between mt-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center font-medium">
                    <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>{service.price.toLocaleString()} ₸</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8"
                  onClick={() => onEdit(service)}
                >
                  <Pencil className="mr-2 h-3 w-3" />
                  Edit Service
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}