import { Metadata } from 'next';
import OnlineBookingPage from '@/components/online-booking/online-booking-page';

export const metadata: Metadata = {
  title: 'Online Booking | B2B Booking Platform',
  description: 'Manage online booking links for your business',
};

export default function OnlineBookingRoute() {
  return <OnlineBookingPage />;
}