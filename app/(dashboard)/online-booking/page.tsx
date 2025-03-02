import { Metadata } from 'next';
import { LinksListComponent } from '@/components/online-booking/links-list';

export const metadata: Metadata = {
  title: 'Online Booking | B2B Booking Platform',
  description: 'Manage online booking links for your business',
};

export default function OnlineBookingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Online booking</h1>
        <div className="flex items-center text-sm text-slate-500 mt-1">
          <span>Online booking</span>
          <span className="mx-2">•</span>
          <span>Online booking links</span>
        </div>
      </div>
      
      <LinksListComponent />
    </div>
  );
}