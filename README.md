# ⚡ TechVault — Full-Stack Electronics E-Commerce Platform

<div align="center">

### 🌐 **[Live Demo](https://gotechvault.vercel.app)** &nbsp;|&nbsp; 🔌 **[API Health](https://techvault-19lu.onrender.com/api/health)** &nbsp;|&nbsp; 📦 **[GitHub Repo](https://github.com/Jabirmahmud0/techvault)**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo)](https://turbo.build/)

A **production-grade** electronics e-commerce platform with multi-role authentication, Stripe payments, seller/admin dashboards, and a modern responsive UI — built as a Turborepo monorepo.

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Author](#-author)

---

## 🎯 Overview

**TechVault** is a full-featured e-commerce platform for electronics, demonstrating modern full-stack development practices. It supports three user roles — **Customer**, **Seller**, and **Admin** — with complete shopping flows, payment processing, and management dashboards.

### Why This Project Stands Out

- ✅ **Full Stripe integration** — Checkout sessions + webhook signature verification
- ✅ **Custom JWT auth system** — Access/refresh token rotation with httpOnly cookies
- ✅ **Google OAuth 2.0** — One-click sign-in with `@react-oauth/google`
- ✅ **Email OTP verification** — Secure registration flow via Nodemailer
- ✅ **Multi-role RBAC** — Admin, Seller, and Customer with route-level protection
- ✅ **Type-safe end-to-end** — Zod validation on all API boundaries
- ✅ **Monorepo architecture** — Turborepo with shared `@repo/db`, `@repo/types` packages
- ✅ **Production deployed** — Vercel (frontend) + Render (API) + Neon (database)

---

## 🔧 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | App Router, React Server Components, SSR/SSG |
| **React 19** | UI library with concurrent features |
| **TypeScript 5.9** | Full type safety across the codebase |
| **Tailwind CSS** | Utility-first responsive styling |
| **Shadcn/UI + Radix UI** | Accessible, composable component library |
| **Framer Motion** | Page transitions, micro-animations, gestures |
| **TanStack Query** | Server state management, cache, optimistic updates |
| **Zustand** | Client state (auth, cart, wishlist) with localStorage persist |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express.js** | REST API server with middleware chain |
| **TypeScript** | Type-safe controllers, services, and routes |
| **PostgreSQL (Neon)** | Serverless relational database |
| **Drizzle ORM** | Type-safe SQL queries, migrations, schema management |
| **Zod** | Request/response validation on all endpoints |
| **JWT (jsonwebtoken)** | Access + refresh token authentication |
| **bcrypt** | Password hashing |
| **Stripe** | Payment processing + webhook handling |
| **Nodemailer** | OTP emails, order confirmations (Gmail SMTP) |
| **Cloudinary + Multer** | Image uploads, transformations, CDN delivery |

### Infrastructure & DevOps
| Technology | Purpose |
|------------|---------|
| **Turborepo** | Monorepo build orchestration with caching |
| **npm Workspaces** | Shared packages (`@repo/db`, `@repo/types`, `@repo/typescript-config`) |
| **Vercel** | Frontend deployment with auto-deploy on push |
| **Render** | Backend API hosting |
| **Neon** | Serverless PostgreSQL with auto-scaling |
| **Vitest** | Unit testing framework |

---

## ✨ Key Features

### 🔒 Authentication & Authorization
- Custom JWT auth with access (15min) + refresh (7d) token rotation
- Google OAuth 2.0 single sign-on
- Email OTP verification for new registrations
- Role-based access control (Customer, Seller, Admin)
- Persistent sessions with httpOnly cookie refresh tokens
- Auto session sync across tabs via Zustand persist middleware

### 🛒 Shopping Experience
- Product catalog with search, filtering, sorting, and pagination
- Category-based browsing with dynamic routes
- Product detail pages with image galleries
- Product reviews and star ratings with real-time aggregation
- Wishlist management with persistence
- Shopping cart with quantity management
- Fully responsive design with dark/light theme toggle

### 💳 Checkout & Payments
- Stripe Checkout integration (secure hosted payment page)
- Stripe Webhook handling with HMAC signature verification
- Automated order creation on successful payment
- Order confirmation emails via Nodemailer (Gmail SMTP)

### 📦 Order Management
- Real-time order tracking (Pending → Paid → Shipped → Delivered)
- Order history with detailed order views
- Shipping address management

### 📊 Seller Dashboard
- Seller registration and profile management
- Product CRUD with image upload via Cloudinary
- Order management for seller's products
- Sales analytics and revenue tracking

### ⚙️ Admin Dashboard
- Platform-wide statistics (total users, orders, revenue)
- User management and role assignment
- Product moderation
- Order management with status updates
- Coupon/discount code management
- Admin settings panel

### 🎨 UI/UX & Performance
- Fully responsive (mobile, tablet, desktop)
- Dark/light theme with smooth transitions
- Page transitions and micro-animations (Framer Motion)
- Scroll progress indicator
- Glassmorphism and modern design aesthetics
- Optimistic UI updates via React Query cache
- Skeleton loading states throughout

---

## 🏗️ Architecture

### System Design

```mermaid
graph TB
    subgraph Client["☁️ Vercel"]
        NextJS["Next.js 16 App<br/>(SSR/SSG/ISR)"]
    end
    
    subgraph API["🚀 Render"]
        Express["Express.js API"]
        MW["Middleware<br/>(Auth, Validate, CORS)"]
        Controllers["Controllers"]
        Services["Service Layer"]
    end
    
    subgraph Data["💾 Data Layer"]
        DB[("🐘 Neon Postgres<br/>(Serverless)")]
        CDN["☁️ Cloudinary<br/>(Images)"]
    end
    
    subgraph External["🌍 External Services"]
        Stripe["💳 Stripe<br/>(Payments + Webhooks)"]
        Gmail["📧 Gmail SMTP<br/>(OTP + Order Emails)"]
        Google["🔑 Google OAuth"]
    end
    
    NextJS --> MW
    MW --> Controllers
    Controllers --> Services
    Services --> DB
    Services --> Stripe
    Services --> Gmail
    NextJS --> CDN
    NextJS --> Google
```

### Monorepo Structure

```
techvault/
├── apps/
│   ├── web/                    # Next.js 16 Frontend
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, Register, OTP Verification
│   │   │   ├── (shop)/         # Products, Categories, Cart, Checkout
│   │   │   ├── (dashboard)/    # Admin & Seller Dashboards
│   │   │   └── layout.tsx      # Root layout with providers
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn/UI base components
│   │   │   ├── product/        # ProductCard, Gallery, Reviews
│   │   │   ├── cart/           # CartSidebar, CartItem
│   │   │   ├── auth/           # GoogleLoginBtn, AuthSync, OTP
│   │   │   ├── admin/          # AdminProductsTable, OrdersTable
│   │   │   └── seller/         # SellerDashboard, ProductForm
│   │   └── lib/
│   │       ├── stores/         # Zustand: auth-store, cart-store, wishlist
│   │       ├── api.ts          # Typed fetch wrapper with auth headers
│   │       └── utils.ts        # Shared utilities
│   └── api/                    # Express.js Backend
│       └── src/
│           ├── modules/
│           │   ├── auth/       # Register, Login, OTP, Google OAuth, JWT
│           │   ├── products/   # CRUD, search, filtering, reviews
│           │   ├── cart/       # Add, update, remove items
│           │   ├── orders/     # Order management, status tracking
│           │   ├── checkout/   # Stripe sessions, webhooks
│           │   └── users/      # Profile management, settings
│           ├── config/         # env.ts, stripe.ts, db.ts
│           └── middleware/     # auth, validate, error handler
├── packages/
│   ├── db/                     # Drizzle schema, migrations, seed
│   ├── types/                  # Shared TypeScript interfaces
│   └── typescript-config/      # Base tsconfig presets
├── render.yaml                 # Render deployment config
├── turbo.json                  # Turborepo build pipeline
└── DEPLOYMENT.md               # Full deployment guide
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v22+ (LTS recommended)
- **PostgreSQL** (or [Neon](https://neon.tech) free account)
- **Stripe Account** for payment testing
- **Google Cloud** project for OAuth
- **Cloudinary** account for image hosting

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Jabirmahmud0/techvault.git
cd techvault

# 2. Install dependencies (Turborepo handles all workspaces)
npm install

# 3. Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit .env with your DATABASE_URL, JWT secrets, API keys, etc.

# 4. Push database schema
npm run db:push -w packages/db

# 5. Seed sample data
npm run db:seed -w packages/db

# 6. Start development servers
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

### Environment Variables

<details>
<summary><b>🔐 Backend (apps/api/.env)</b></summary>

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/dbname

# JWT
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@techvault.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

</details>

<details>
<summary><b>🌐 Frontend (Vercel Env Vars)</b></summary>

```env
NEXT_PUBLIC_API_URL=https://your-api-url.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

</details>

---

## 🌐 Deployment

| Service | Purpose | URL |
|---------|---------|-----|
| **Vercel** | Next.js frontend | [gotechvault.vercel.app](https://gotechvault.vercel.app) |
| **Render** | Express API server | [techvault-19lu.onrender.com](https://techvault-19lu.onrender.com/api/health) |
| **Neon** | PostgreSQL database | Serverless, auto-scaling |
| **Cloudinary** | Image CDN | Upload + transform + deliver |

For detailed deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register with email + OTP |
| `POST` | `/api/auth/verify-otp` | Verify email OTP code |
| `POST` | `/api/auth/login` | Login with credentials |
| `POST` | `/api/auth/google` | Google OAuth login |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products (search, filter, paginate) |
| `GET` | `/api/products/:slug` | Get product details |
| `POST` | `/api/products` | Create product (Seller/Admin) |
| `PUT` | `/api/products/:id` | Update product (Seller/Admin) |
| `DELETE` | `/api/products/:id` | Delete product (Seller/Admin) |

### Cart & Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cart` | Get user's cart |
| `POST` | `/api/cart` | Add item to cart |
| `PUT` | `/api/cart/:id` | Update cart item quantity |
| `DELETE` | `/api/cart/:id` | Remove cart item |
| `POST` | `/api/checkout/create-session` | Create Stripe checkout session |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | Get user's order history |
| `GET` | `/api/orders/:id` | Get order details |
| `PATCH` | `/api/orders/:id/status` | Update order status (Seller/Admin) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products/:id/reviews` | Get product reviews |
| `POST` | `/api/products/:id/reviews` | Submit a review |

---

## 👤 Author

<div align="center">

**Built by [Jabir Mahmud](https://jabirr.vercel.app/)**

[![Portfolio](https://img.shields.io/badge/Portfolio-jabirr.vercel.app-00D4AA?style=for-the-badge&logo=vercel)](https://jabirr.vercel.app/)
[![Email](https://img.shields.io/badge/Email-jaabirmahmud01@gmail.com-EA4335?style=for-the-badge&logo=gmail)](mailto:jaabirmahmud01@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-@Jabirmahmud0-181717?style=for-the-badge&logo=github)](https://github.com/Jabirmahmud0)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Jabir_Mahmud-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/jabirmahmud0/)

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Found this helpful? Give it a star!

**Built with ❤️ using Next.js, Express, and TypeScript**

[![Star on GitHub](https://img.shields.io/github/stars/Jabirmahmud0/techvault?style=social)](https://github.com/Jabirmahmud0/techvault)

</div>
