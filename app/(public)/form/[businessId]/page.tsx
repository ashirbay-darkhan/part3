import { Metadata } from 'next';
import { BusinessBookingForm } from '@/components/booking/business-booking-form';
import { getBusinessById, getBusinessByLinkId } from '@/lib/api';

// Define types for the params
type PageParams = {
  businessId: string;
};

// Fetch business data on the server
export async function generateMetadata({ 
  params 
}: { 
  params: PageParams
}): Promise<Metadata> {
  try {
    // The ID could be either a business ID or a booking link ID
    const paramId = params.businessId;
    let businessId = paramId;
    
    // If it's a numeric ID with 7+ digits, it's a booking link ID and we'll use a default business for metadata
    if (/^\d{7,}$/.test(paramId)) {
      // For 7+ digit IDs, use a default business ID for metadata
      // This avoids unnecessary API calls that will fail
      businessId = '1';
    } else {
      // For non-numeric IDs, try to get the business ID
      const linkedBusinessId = await getBusinessByLinkId(paramId);
      if (linkedBusinessId) {
        businessId = linkedBusinessId;
      }
    }
    
    // Try to get the business metadata
    try {
      const business = await getBusinessById(businessId);
      return {
        title: business ? `Book with ${business.name}` : 'Book an Appointment',
        description: `Book your appointment with ${business?.name || 'our business'} online`,
      };
    } catch (error) {
      console.error("Error fetching business metadata:", error);
      // Fallback metadata
      return {
        title: 'Book an Appointment',
        description: 'Book your appointment online',
      };
    }
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: 'Book an Appointment',
      description: 'Book your appointment online',
    };
  }
}

export default async function BookingFormPage({ 
  params 
}: { 
  params: PageParams 
}) {
  // The ID could be either a business ID or a booking link ID
  const paramId = params.businessId;
  let businessId = paramId;
  
  // For server-rendered component: pass the ID as-is to the form component
  // Client-side hydration will handle the mapping properly once the client loads
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <BusinessBookingForm businessId={businessId} />
    </div>
  );
} 