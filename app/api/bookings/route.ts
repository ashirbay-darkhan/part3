import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, createAppointment } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('businessId');
    const employeeId = searchParams.get('employeeId');
    const clientId = searchParams.get('clientId');
    const date = searchParams.get('date');
    
    // Fetch appointments from JSON Server
    let appointments = await getAppointments();
    
    // Ensure all IDs are strings
    appointments = appointments.map(appointment => ({
      ...appointment,
      id: appointment.id.toString(),
      clientId: appointment.clientId.toString(),
      employeeId: appointment.employeeId.toString(),
      serviceId: appointment.serviceId.toString(),
      businessId: appointment.businessId.toString()
    }));
    
    // Apply filters if provided
    if (businessId) {
      const businessIdString = businessId.toString();
      appointments = appointments.filter(a => a.businessId === businessIdString);
    }
    
    if (employeeId) {
      const employeeIdString = employeeId.toString();
      appointments = appointments.filter(a => a.employeeId === employeeIdString);
    }
    
    if (clientId) {
      const clientIdString = clientId.toString();
      appointments = appointments.filter(a => a.clientId === clientIdString);
    }
    
    if (date) {
      appointments = appointments.filter(a => a.date === date);
    }
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to load appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Ensure all IDs are strings
    if (body.clientId) body.clientId = body.clientId.toString();
    if (body.employeeId) body.employeeId = body.employeeId.toString();
    if (body.serviceId) body.serviceId = body.serviceId.toString();
    if (body.businessId) body.businessId = body.businessId.toString();
    
    // Generate a string ID for the appointment
    const appointmentId = Date.now().toString();
    body.id = appointmentId;
    
    // Create appointment
    const newAppointment = await createAppointment(body);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Appointment created successfully', 
        appointment: {
          ...newAppointment,
          id: newAppointment.id.toString(),
          clientId: newAppointment.clientId.toString(),
          employeeId: newAppointment.employeeId.toString(),
          serviceId: newAppointment.serviceId.toString(),
          businessId: newAppointment.businessId.toString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
} 