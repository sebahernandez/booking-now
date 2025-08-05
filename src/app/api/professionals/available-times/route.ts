import { NextRequest, NextResponse } from 'next/server';
import { format, parseISO, getDay } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const professionalId = searchParams.get('professionalId');
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const targetDate = parseISO(date);
    const dayOfWeek = getDay(targetDate);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Mock schedule - in real app, fetch from database
    const mockSchedule = {
      monday: { isWorking: true, timeSlots: [{ startTime: "09:00", endTime: "12:00" }, { startTime: "14:00", endTime: "18:00" }] },
      tuesday: { isWorking: true, timeSlots: [{ startTime: "09:00", endTime: "12:00" }, { startTime: "14:00", endTime: "18:00" }] },
      wednesday: { isWorking: true, timeSlots: [{ startTime: "09:00", endTime: "12:00" }, { startTime: "14:00", endTime: "18:00" }] },
      thursday: { isWorking: true, timeSlots: [{ startTime: "09:00", endTime: "12:00" }, { startTime: "14:00", endTime: "18:00" }] },
      friday: { isWorking: true, timeSlots: [{ startTime: "09:00", endTime: "12:00" }, { startTime: "14:00", endTime: "17:00" }] },
      saturday: { isWorking: false, timeSlots: [] },
      sunday: { isWorking: false, timeSlots: [] }
    };

    const dayName = dayNames[dayOfWeek] as keyof typeof mockSchedule;

    // Get professional's actual schedule if specific professional is selected
    let professionalSchedule = mockSchedule;
    if (professionalId && professionalId !== 'any') {
      try {
        // Try to fetch real availability from database
        const availabilityResponse = await fetch(`${request.nextUrl.origin}/api/professionals/availability/${professionalId}`);
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json();
          if (availabilityData.weeklySchedule) {
            professionalSchedule = availabilityData.weeklySchedule;
          }
        }
      } catch {
        // Fall back to mock data
      }
    }

    // Fetch existing bookings for the date and professional
    const bookedTimes = await fetchExistingBookings(targetDate, professionalId, serviceId);

    const daySchedule = professionalSchedule[dayName];
    
    if (!daySchedule.isWorking) {
      return NextResponse.json([]);
    }

    // Generate ALL time slots in 30-minute intervals with availability status
    const timeSlots: Array<{time: string, isAvailable: boolean, reason?: string}> = [];
    
    daySchedule.timeSlots.forEach(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0]);
      const startMinute = parseInt(slot.startTime.split(':')[1]);
      const endHour = parseInt(slot.endTime.split(':')[0]);
      const endMinute = parseInt(slot.endTime.split(':')[1]);
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        const isBooked = bookedTimes.includes(timeString);
        timeSlots.push({
          time: timeString,
          isAvailable: !isBooked,
          reason: isBooked ? 'Reservado' : undefined
        });
        
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour++;
          currentMinute -= 60;
        }
      }
    });

    return NextResponse.json(timeSlots);
  } catch (error) {
    console.error('Error fetching available times:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available times' },
      { status: 500 }
    );
  }
}

async function fetchExistingBookings(date: Date, professionalId?: string | null, serviceId?: string | null): Promise<string[]> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause: Record<string, unknown> = {
      startDateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
    };

    // If a specific professional is selected, filter by that professional
    if (professionalId && professionalId !== 'any') {
      whereClause.professionalId = professionalId;
    }

    // If no specific professional, check all professionals that can provide this service
    if (serviceId && (!professionalId || professionalId === 'any')) {
      whereClause.serviceId = serviceId;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        startDateTime: true,
        endDateTime: true,
        service: {
          select: {
            duration: true,
          },
        },
      },
    });

    // Convert booking times to time strings
    const bookedTimes: string[] = [];
    
    bookings.forEach(booking => {
      const startTime = format(booking.startDateTime, 'HH:mm');
      
      // Block the exact start time of the booking
      bookedTimes.push(startTime);
      
      // Block all 30-minute slots that would overlap with this booking
      // For example, if booking is 10:00-11:00, block 09:30, 10:00, 10:30
      const startHour = booking.startDateTime.getHours();
      const startMinute = booking.startDateTime.getMinutes();
      const endHour = booking.endDateTime.getHours();
      const endMinute = booking.endDateTime.getMinutes();
      
      // Block 30 minutes before the booking (potential overlap)
      let checkHour = startHour;
      let checkMinute = startMinute - 30;
      
      if (checkMinute < 0) {
        checkHour--;
        checkMinute += 60;
      }
      
      if (checkHour >= 0) {
        const prevSlot = `${checkHour.toString().padStart(2, '0')}:${checkMinute.toString().padStart(2, '0')}`;
        if (!bookedTimes.includes(prevSlot)) {
          bookedTimes.push(prevSlot);
        }
      }
      
      // Block all 30-minute intervals during the booking
      let currentHour = startHour;
      let currentMinute = startMinute + 30;
      
      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        if (currentMinute >= 60) {
          currentHour++;
          currentMinute -= 60;
        }
        
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        if (!bookedTimes.includes(timeSlot)) {
          bookedTimes.push(timeSlot);
        }
        
        currentMinute += 30;
      }
    });

    return bookedTimes;
  } catch (error) {
    console.error('Error fetching existing bookings:', error);
    return [];
  }
}