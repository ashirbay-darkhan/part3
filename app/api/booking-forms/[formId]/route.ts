import { NextRequest, NextResponse } from 'next/server';
import { bookingLinks, services, users } from '@/lib/dummy-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  // Получаем формID из URL
  const formId = params.formId;
  
  // Находим ссылку по formId
  const link = bookingLinks.find(l => l.url.includes(formId));
  
  if (!link) {
    return NextResponse.json(
      { error: 'Booking form not found' },
      { status: 404 }
    );
  }
  
  // Определяем, для какого сотрудника или для всех
  let availableServices = services;
  let availableEmployees = users;
  
  // Если это ссылка для конкретного сотрудника, фильтруем
  if (link.type === 'Employee' && link.employeeId) {
    availableEmployees = users.filter(user => user.id === link.employeeId);
  }
  
  // Собираем данные формы
  const formData = {
    formId,
    formName: link.name,
    formType: link.type,
    companyName: "Demo Business",
    availableServices,
    availableEmployees
  };
  
  return NextResponse.json(formData);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = params.formId;
    const body = await request.json();
    
    // В реальном приложении здесь была бы валидация и сохранение в базу данных
    
    return NextResponse.json(
      { success: true, message: 'Booking created successfully', bookingId: Math.random().toString(36).substring(2, 10) },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}