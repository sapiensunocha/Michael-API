WDC Backend
Node.js + Express backend for the World Disaster Center, integrated with Supabase and Stripe.
Setup

Install dependencies: npm install
Create .env with Supabase and Stripe keys
Run migrations: supabase db push
Start server: npm run start

Endpoints

POST /api/users/register: Register a user
POST /api/users/login: Login a user
POST /api/payments/create-session: Create Stripe checkout session

Deployment

Build Docker image: docker build -t wdc-backend .
Deploy to Heroku or Railway
