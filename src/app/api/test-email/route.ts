import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { bookingData } = await request.json();
    
    if (!bookingData) {
      return NextResponse.json(
        { error: 'Booking data is required' },
        { status: 400 }
      );
    }

    // Convert date string to Date object if needed
    if (typeof bookingData.date === 'string') {
      bookingData.date = new Date(bookingData.date);
    }

    console.log('🧪 Testing email with booking data:', {
      id: bookingData.id,
      clientEmail: bookingData.clientEmail,
      serviceName: bookingData.service.name,
      date: bookingData.date
    });

    const result = await sendBookingConfirmationEmail(bookingData);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailResult: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}