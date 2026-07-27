# 🛡️ SentinelX - Security Operations Center Platform

A production-ready SOC platform built with modern web technologies. Designed for security analysts to monitor, detect, and respond to security threats in real-time.

## 🚀 Live Demo

**[Try the Demo](https://your-demo-url.com/demo)**

### Demo Credentials
- **Admin**: admin@sentinelx.local / Admin123!
- **Analyst**: analyst@sentinelx.local / Analyst123!
- **Viewer**: viewer@sentinelx.local / Viewer123!

## ✨ Features

### Core Security Features
- **Real-time Monitoring**: Live security event tracking
- **Alert Management**: Investigate, assign, and resolve alerts
- **Incident Response**: Full incident lifecycle management
- **Threat Hunting**: Advanced search and investigation tools
- **Detection Rules**: Customizable rule engine with MITRE ATT&CK mapping
- **Agent Management**: Monitor security agents across your infrastructure

### Technical Features
- **JWT Authentication** with role-based access control
- **Real-time Dashboards** with interactive charts
- **Dark SOC-style Interface** optimized for security operations
- **Responsive Design** works on desktop and tablets
- **Audit Logging** for security compliance

## 🏗️ Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful API with role-based access

### Frontend
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS with dark theme
- **Charts**: Recharts for data visualization
- **State Management**: React Context API

### Security
- **Roles**: Admin, Security Analyst, Viewer
- **Authorization**: Middleware-based role checking
- **Data Protection**: Input validation, CORS, Helmet.js
- **Audit Logging**: Complete audit trail of actions

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| DevOps | Docker, Docker Compose |
| Agent | Python (Lightweight) |
| Testing | Jest, Supertest |

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Alerts Management
![Alerts](screenshots/alerts.png)

### Incident Response
![Incidents](screenshots/incidents.png)

### Threat Hunting
![Threat Hunting](screenshots/threat-hunting.png)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/sentinelx.git
cd sentinelx

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the database
docker-compose up -d postgres

# Run database migrations
cd backend
npx prisma db push
npx prisma db seed

# Start the backend
npm run dev:backend

# In a new terminal, start the frontend
npm run dev:frontend