import { Metadata } from 'next';
import { WeekCalendarView } from '@/components/calendar/week-view';

export const metadata: Metadata = {
  title: 'Staff Calendar | B2B Booking Platform',
  description: 'View and manage appointments for your staff',
};

export default function StaffPage() {
  return (
    <div className="max-w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Staff Calendar</h1>
      </div>
      
      <WeekCalendarView />
    </div>
  );
}