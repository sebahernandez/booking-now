# Booking System - Deployment Guide

## Overview

This is a modern booking system built with Next.js, TypeScript, ShadCN UI, and Prisma. It features a multi-step wizard interface for booking appointments with professionals.

## Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **ShadCN UI** for modern, accessible components
- **Tailwind CSS** for styling
- **React Hook Form** for form management

### Backend
- **Next.js API Routes** for serverless backend
- **Prisma ORM** for database management
- **PostgreSQL** (Supabase) for all environments

### Database Models
- **Users** - Clients and professionals
- **Services** - Available appointment types
- **Professionals** - Service providers
- **Bookings** - Scheduled appointments
- **Availability** - Professional schedules

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. **Database Setup**
   - Use [Vercel Postgres](https://vercel.com/storage/postgres) or any PostgreSQL provider
   - Set `DATABASE_URL` environment variable

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Database Migration**
   After deployment, run:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Railway

1. **Create Railway Project**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- Netlify
- Heroku
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string

### Optional
- `NEXTAUTH_SECRET` - For authentication (if implementing auth)
- `NEXTAUTH_URL` - Your application URL

## Database Schema

The application uses Prisma with the following main models:

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String?
  role  UserRole @default(CLIENT)
  // ... other fields
}

model Service {
  id          String @id @default(cuid())
  name        String
  description String?
  duration    Int    // in minutes
  price       Float
  // ... other fields
}

model Booking {
  id            String @id @default(cuid())
  clientId      String
  serviceId     String
  startDateTime DateTime
  endDateTime   DateTime
  status        BookingStatus @default(PENDING)
  // ... other fields
}
```

## Features

### ✅ Implemented
- Multi-step booking wizard
- Service selection with pricing
- Date and time selection
- Customer information form
- Professional assignment (optional)
- Database integration with Prisma
- Responsive design
- Form validation

### 🚧 Future Enhancements
- User authentication (NextAuth.js)
- Email notifications
- Professional dashboard
- Payment integration
- Calendar sync
- Internationalization (i18n)
- SMS reminders

## API Endpoints

- `GET /api/services` - List available services
- `GET /api/professionals?serviceId=...` - List professionals for a service
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - List all bookings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.