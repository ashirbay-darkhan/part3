import { Metadata } from 'next';
import { BookingForm } from '@/components/booking/booking-form';
import { bookingLinks } from '@/lib/dummy-data';

export const metadata: Metadata = {
  title: 'Online Booking',
  description: 'Book your appointment online',
};

// Генерируем статические параметры для всех известных ссылок
export async function generateStaticParams() {
  return bookingLinks.map((link) => ({
    formId: link.url.split('.')[0],
  }));
}

export default function BookingFormPage({
  params,
}: {
  params: { formId: string };
}) {
  const { formId } = params;
  
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <BookingForm formId={formId} />
    </div>
  );
}