# ParkMaster Deployment Guide

This guide will help you deploy the ParkMaster application using Node.js v22.11.0.

## Prerequisites

- Node.js v22.11.0
- npm (comes with Node.js)
- A production server (e.g., DigitalOcean, AWS, or Heroku)

## Environment Setup

1. Create a `.env.production` file with your production credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_EMAIL_USER=your_gmail_address
VITE_EMAIL_PASSWORD=your_gmail_app_password
VITE_SMS_ACCOUNT_SID=your_twilio_account_sid
VITE_SMS_AUTH_TOKEN=your_twilio_auth_token
VITE_SMS_FROM_NUMBER=your_twilio_phone_number
PORT=5000
```

## Deployment Steps

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The application will be available at `http://localhost:5000` (or your configured PORT).

## Production Features

- **Security**: Using Helmet middleware for enhanced security
- **Performance**: Compression enabled for faster load times
- **SPA Support**: Configured for React Router
- **Static Files**: Serving optimized build from `dist` directory

## Integrations

Make sure these services are properly configured:

1. **Supabase Database**
   - Verify RLS policies are in place
   - Check database connections

2. **Razorpay Payments**
   - Confirm webhook configurations
   - Test UPI and credit card processing

3. **Email & SMS**
   - Verify Gmail SMTP settings
   - Check Twilio credentials

## Health Checks

Monitor these aspects after deployment:

1. **Server Status**
   - CPU usage
   - Memory consumption
   - Response times

2. **Database**
   - Connection pool
   - Query performance
   - Backup status

3. **External Services**
   - Payment gateway status
   - Email delivery rates
   - SMS delivery status

## Troubleshooting

Common issues and solutions:

1. **Server Issues**
   ```bash
   # Check server logs
   pm2 logs

   # Restart server
   pm2 restart server
   ```

2. **Database Connection**
   - Check Supabase connection string
   - Verify network access

3. **Payment Integration**
   - Verify Razorpay API keys
   - Check webhook endpoints

## Production Best Practices

1. **Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Configure performance monitoring
   - Enable automated alerts

2. **Security**
   - Regular security audits
   - Keep dependencies updated
   - Monitor access logs

3. **Backup**
   - Regular database backups
   - Configuration backups
   - Document recovery procedures

## Scaling

To handle increased load:

1. **Horizontal Scaling**
   - Load balancer configuration
   - Multiple server instances
   - Session management

2. **Caching**
   - Browser caching
   - API response caching
   - Static asset optimization

## Support

For issues or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation
