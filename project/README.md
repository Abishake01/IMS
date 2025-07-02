# Mobile Shop Inventory & Billing System

A comprehensive web-based inventory management and billing system designed specifically for mobile phone shops. Built with React, TypeScript, and Supabase.

## 🚀 Features

### Admin Features
- **Dashboard**: Real-time overview of sales, inventory, and business metrics
- **Inventory Management**: Complete CRUD operations for mobile phones and accessories
- **Sales History**: View and manage all sales transactions
- **Reports**: Detailed analytics with export functionality
  - Sales overview with charts and trends
  - Product performance reports
  - Service reports with detailed breakdowns
- **Low Stock Alerts**: Automatic notifications for items below minimum stock levels

### User Features
- **Billing System**: Create sales transactions with customer information
- **Service Management**: Record mobile repair and service requests
- **Real-time Inventory**: Access to current stock levels during billing

### Key Capabilities
- **Multi-role Authentication**: Admin and User access levels
- **Real-time Data**: Live updates across all modules
- **Export Functionality**: CSV export for all reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Offline Fallback**: Local data when database is unavailable

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional - works with local fallback data)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Abishake01/IMS.git
cd project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup 
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: The application works without Supabase configuration using local fallback data.
### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Built with ❤️ for mobile shop owners and managers**