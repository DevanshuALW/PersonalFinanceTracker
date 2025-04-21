# Personal Finance Tracker

A comprehensive web application for tracking personal finances, managing budgets, setting savings goals, and connecting to bank accounts.

## Features

- **Dashboard**: Get an overview of your financial situation with charts and summaries
- **Transaction Management**: Track income and expenses with categorization
- **Budget Management**: Set and monitor spending limits by category
- **Recurring Transactions**: Automate regular income and expense entries
- **Savings Goals**: Set and track progress towards financial goals
- **Bank Account Integration**: Connect to your bank accounts via Plaid API
- **Data Export**: Export your transaction data to CSV

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **API Integration**: Plaid API for bank account linking

## Deployment

This application is configured for deployment on Vercel.

### Prerequisites

- Node.js 16+
- PostgreSQL database (or Neon serverless Postgres)
- Plaid API credentials (optional)

### Environment Variables

Create a `.env` file based on the `.env.example` template:

```
# Database Configuration
DATABASE_URL=postgres://username:password@host:port/database

# Session Secret (generate a random string)
SESSION_SECRET=your-secret-key-here

# Plaid API Credentials (Optional - for bank account linking)
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret

# Port (Optional - defaults to 5000)
PORT=5000
```

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables in a `.env` file
4. Push the database schema:
   ```
   npm run db:push
   ```
5. Start the development server:
   ```
   npm run dev
   ```

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy!

## License

MIT
