import { Metadata } from 'next';
import { CalendarView } from '@/components/calendar/calendar-view';

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'View and manage your appointments',
};

export default function CalendarPage() {
  return (
    <div className="h-[calc(100vh-60px)] w-full overflow-hidden">
      <CalendarView />
    </div>
  );
} 