# ParkMaster - Smart Parking Management System

A modern parking management system built with React, TypeScript, and Supabase. Features include real-time parking spot search, booking management, profile management, and secure payments.

## Features

- 🚗 Real-time parking spot search with map integration
- 💰 Indian Rupee (INR) pricing
- 📍 Location-based search with manual location toggle
- 🔒 Secure authentication with email/phone verification
- 💳 UPI and credit card payment integration
- 👤 Multi-profile management
- ✨ Smooth page transitions and animations
- 📱 Responsive design for all devices

## Tech Stack

- Frontend: React + TypeScript
- Styling: Tailwind CSS
- Animation: Framer Motion
- Maps: Leaflet
- Database: Supabase
- Payment: Razorpay
- Form Validation: Zod + React Hook Form

## Setup Instructions

1. Clone the repository:
```bash
git clone <your-repo-url>
cd parkmaster
```

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Copy the SQL from `src/lib/supabase-schema.sql` and run it in the Supabase SQL editor
   - Get your project URL and anon key

4. Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

5. Run the development server:
```bash
npm run dev
```

## Database Connection

The project uses Supabase as the database. Here's how it's connected:

1. The database connection is already configured in `src/lib/supabaseClient.ts`
2. Tables and security policies are defined in `src/lib/supabase-schema.sql`
3. Main tables:
   - `profiles`: User profiles
   - `parking_spots`: Available parking locations
   - `bookings`: Parking reservations
   - `vehicles`: User's vehicles

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
