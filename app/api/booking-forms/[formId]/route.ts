import { NextRequest, NextResponse } from 'next/server';
import { getBookingLinks, getServices, getUsers } from '@/lib/api';
import { BusinessUser, BookingLink, Service } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    // Get formID from URL
    const formId = params.formId;
    
    // Fetch data from JSON Server
    const [links, services, users] = await Promise.all([
      getBookingLinks(),
      getServices(),
      getUsers()
    ]);
    
    // Find link by formId - ensure consistent comparison
    const link = links.find(l => l.id === formId || (l as any).url?.includes(formId));
    
    if (!link) {
      return NextResponse.json(
        { error: 'Booking form not found' },
        { status: 404 }
      );
    }
    
    // Determine which staff members or all
    // Ensure all IDs are strings in the services array
    const processedServices = services.map(service => ({
      ...service,
      id: service.id.toString(),
      businessId: service.businessId.toString()
    }));
    
    // Ensure all IDs are strings in the users array - treat as BusinessUser
    const processedUsers = users.map(user => {
      const businessUser = user as unknown as BusinessUser;
      return {
        ...businessUser,
        id: businessUser.id.toString(),
        serviceIds: Array.isArray(businessUser.serviceIds) 
          ? businessUser.serviceIds.map(id => id.toString()) 
          : [],
        businessId: businessUser.businessId ? businessUser.businessId.toString() : ''
      };
    });
    
    let availableServices = processedServices;
    let availableEmployees = processedUsers;
    
    // If it's a link for a specific employee, filter
    if (link.type === 'Employee' && link.employeeId) {
      const employeeIdString = link.employeeId.toString();
      availableEmployees = processedUsers.filter(user => user.id === employeeIdString);
    }
    
    // Compile form data
    const formData = {
      formId,
      formName: link.name,
      formType: link.type,
      companyName: "Demo Business",
      businessId: link.businessId ? link.businessId.toString() : '',
      availableServices,
      availableEmployees
    };
    
    return NextResponse.json(formData);
  } catch (error) {
    console.error('Error fetching booking form data:', error);
    return NextResponse.json(
      { error: 'Failed to load booking form' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = params.formId;
    const body = await request.json();
    
    // Ensure all IDs in the request body are strings
    if (body.serviceId) body.serviceId = body.serviceId.toString();
    if (body.employeeId) body.employeeId = body.employeeId.toString();
    if (body.businessId) body.businessId = body.businessId.toString();
    
    // Generate a string ID for the booking
    const bookingId = Date.now().toString();
    
    // In a real app, you would save the booking to your database
    // For now, we'll just return a success response with a proper string ID
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Booking created successfully', 
        bookingId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}