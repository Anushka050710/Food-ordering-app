# 🍽️ FoodOrder — Role-Based Food Ordering App

Full-stack food ordering platform with RBAC + country-scoped access (Re-BAC).

## Tech Stack
- **Backend**: NestJS · GraphQL (code-first) · Prisma 7 · SQLite
- **Frontend**: Next.js 15 · TypeScript · Tailwind CSS · Apollo Client
- **Auth**: JWT · Passport · Role-Based + Country-Based Access Control

## Role Permissions

| Feature                  | Admin | Manager | Member |
|--------------------------|-------|---------|--------|
| View restaurants & menu  | ✅    | ✅      | ✅     |
| Create an order          | ✅    | ✅      | ✅     |
| Checkout & pay           | ✅    | ✅      | ❌     |
| Cancel an order          | ✅    | ✅      | ❌     |
| Add/Modify payment methods | ✅  | ❌      | ❌     |

## Country Isolation (Re-BAC)
Users only see restaurants and orders within their assigned country (India or America).

## Demo Accounts (password: `password123`)
| Email                  | Role    | Country |
|------------------------|---------|---------|
| admin@india.com        | Admin   | India   |
| manager@india.com      | Manager | India   |
| member@india.com       | Member  | India   |
| admin@america.com      | Admin   | America |
| manager@america.com    | Manager | America |
| member@america.com     | Member  | America |

## Running the App

### Backend (port 4000)
```bash
cd backend
npm run start:dev
```

### Frontend (port 3000)
```bash
cd frontend
npm run dev
```

Then open http://localhost:3000

## GraphQL Playground
Available at http://localhost:4000/graphql
