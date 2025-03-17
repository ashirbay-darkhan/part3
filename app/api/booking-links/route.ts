import { NextRequest, NextResponse } from 'next/server';
import { getBookingLinks, createBookingLink } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('businessId');
    const employeeId = searchParams.get('employeeId');
    
    // Fetch booking links from JSON Server
    let links = await getBookingLinks();
    
    // Ensure all IDs are strings
    links = links.map(link => ({
      ...link,
      id: link.id.toString(),
      businessId: link.businessId ? link.businessId.toString() : '',
      employeeId: link.employeeId ? link.employeeId.toString() : undefined
    }));
    
    // Apply filters if provided
    if (businessId) {
      const businessIdString = businessId.toString();
      links = links.filter(link => link.businessId === businessIdString);
    }
    
    if (employeeId) {
      const employeeIdString = employeeId.toString();
      links = links.filter(link => link.employeeId === employeeIdString);
    }
    
    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching booking links:', error);
    return NextResponse.json(
      { error: 'Failed to load booking links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Ensure all IDs are strings
    if (body.businessId) body.businessId = body.businessId.toString();
    if (body.employeeId) body.employeeId = body.employeeId.toString();
    
    // Generate a string ID for the booking link
    const linkId = Date.now().toString();
    body.id = linkId;
    
    // Create a URL for the link
    if (!body.url) {
      body.url = `${linkId}`;
    }
    
    // Create booking link
    const newLink = await createBookingLink(body);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Booking link created successfully', 
        link: {
          ...newLink,
          id: newLink.id.toString(),
          businessId: newLink.businessId ? newLink.businessId.toString() : '',
          employeeId: newLink.employeeId ? newLink.employeeId.toString() : undefined
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking link:', error);
    return NextResponse.json(
      { error: 'Failed to create booking link' },
      { status: 500 }
    );
  }
} 