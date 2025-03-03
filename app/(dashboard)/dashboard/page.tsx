'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  LineChart, 
  ShoppingBag, 
  ArrowRight,
  Activity,
  Clock
} from 'lucide-react';
import { getBusinessAppointments, getBusinessClients } from '@/lib/api';
import { Appointment, Client } from '@/types';
import { useAuth } from '@/lib/auth/authContext';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const [appointmentsData, clientsData] = await Promise.all([
          getBusinessAppointments(user.businessId),
          getBusinessClients(user.businessId)
        ]);
        setAppointments(appointmentsData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Get today's date and format it
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Count appointments for today
  const todayAppointments = appointments.filter(
    app => new Date(app.date).toDateString() === today.toDateString()
  );
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-pawly-dark-blue dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-gray-300">{formattedDate}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium animate-pulse bg-slate-200 h-4 w-24"></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse bg-slate-200 h-8 w-16 mb-2"></div>
                <p className="animate-pulse bg-slate-100 h-3 w-32"></p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="animate-pulse bg-slate-200 h-6 w-36"></CardTitle>
              <CardDescription className="animate-pulse bg-slate-100 h-4 w-64"></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="animate-pulse bg-slate-200 h-10 w-48"></div>
                  <div className="animate-pulse bg-slate-200 h-6 w-16"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pawly-dark-blue dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-gray-300">{formattedDate}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-slate-500">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-slate-500">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today Appointments
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-slate-500">
              {todayAppointments.length > 0 ? 'Next one at 15:00' : 'No appointments today'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₸ 7,000</div>
            <p className="text-xs text-slate-500">
              +18.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Your most recent appointment bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => {
                const apptClient = clients.find(c => c.id === appointment.clientId);
                const apptDate = new Date(appointment.date);
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {apptClient?.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{apptClient?.name}</p>
                        <p className="text-xs text-slate-500">
                          {apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {appointment.startTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ₸ {appointment.price}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/staff">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Commonly used functions and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col" asChild>
                <Link href="/dashboard/online-booking">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Manage Booking Links</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col" asChild>
                <Link href="/dashboard/staff">
                  <Users className="h-6 w-6 mb-2" />
                  <span>View Calendar</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col">
                <LineChart className="h-6 w-6 mb-2" />
                <span>Analytics</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col">
                <ShoppingBag className="h-6 w-6 mb-2" />
                <span>Inventory</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}