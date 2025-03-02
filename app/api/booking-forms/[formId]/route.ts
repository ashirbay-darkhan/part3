import { NextRequest, NextResponse } from 'next/server';
import { getBookingLinks, getServices, getUsers } from '@/lib/api';

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
    
    // Find link by formId
    const link = links.find(l => l.url.includes(formId));
    
    if (!link) {
      return NextResponse.json(
        { error: 'Booking form not found' },
        { status: 404 }
      );
    }
    
    // Determine which staff members or all
    let availableServices = services;
    let availableEmployees = users;
    
    // If it's a link for a specific employee, filter
    if (link.type === 'Employee' && link.employeeId) {
      availableEmployees = users.filter(user => user.id === link.employeeId);
    }
    
    // Compile form data
    const formData = {
      formId,
      formName: link.name,
      formType: link.type,
      companyName: "Demo Business",
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
    
    // In a real app, you would save the booking to your database
    // For now, we'll just return a success response
    
    return NextResponse.json(
      { success: true, message: 'Booking created successfully', bookingId: Math.random().toString(36).substring(2, 10) },
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