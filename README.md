# StudyBuddy

A full-stack study management platform built with React, Node.js, Express, and MongoDB.

## Features

- **Task Management** : Create, edit, delete, and complete tasks with priority levels (Urgent/High/Medium/Low), tags, due dates, and multi-criteria filtering/sorting with persistent preferences.
- **Study Resources** : Collect and organize study materials (links, videos, documents) with tagging and search. Card and table view modes.
- **Reminders** : Set time-based reminders with background job scheduling via Agenda.js. Reminders fire at the exact due time and appear as in-app notifications.
- **Discussion Forum** : Post discussion threads, tag them by topic, and collaborate via threaded comments. Discussion creators can moderate comments and toggle thread status (Open/Closed).
- **AI Study Assistant** : Chat interface powered by Google Gemini 1.5 Flash. Maintains conversation history across messages. Custom message renderer for structured AI responses.
- **Authentication** : Email/password registration with 6-digit email verification, Google OAuth 2.0, and password reset with self-invalidating tokens.
- **Push Notifications** : Web Push API integration with VAPID keys, service worker registration, and subscription persistence (notification delivery is infrastructure-ready).

## Tech Stack

### Frontend

- React 18 + Vite
- React Router v6
- Tailwind CSS (neobrutalism design system)
- Context API (AuthContext, NotificationContext)
- Lucide React icons

### Backend

- Node.js + Express
- MongoDB + Mongoose ODM
- Agenda.js (background job scheduling)
- Passport.js (Google OAuth 2.0)
- Nodemailer (transactional emails via Gmail SMTP)
- JSON Web Tokens (authentication)
- bcrypt.js (password hashing)
- web-push (VAPID / Web Push API)
- Google Generative AI SDK (Gemini 1.5 Flash)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project (for OAuth + Gemini API key)
- Gmail account with App Password (for email sending)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Email
GMAIL_APP_PASSWORD=your_gmail_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Web Push (generate with web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your@email.com

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

Start the server:

```bash
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

## API Overview

| Area        | Endpoints                                                          |
| ----------- | ------------------------------------------------------------------ |
| Auth        | Register, verify email, login, forgot/reset password, Google OAuth |
| Tasks       | CRUD with ownership checks, priority/tag filtering                 |
| Resources   | Create, read, delete (no update)                                   |
| Reminders   | CRUD with Agenda.js job scheduling/cancellation                    |
| Study Plans | CRUD (backend only, no frontend UI)                                |
| Discussions | CRUD with status toggle, creator-only moderation                   |
| Comments    | CRUD with owner + discussion creator delete permissions            |
| AI Chat     | Gemini 1.5 Flash with conversation history                         |
| Push        | Save Web Push subscription                                         |

## Architecture

```
frontend/src/
├── App.jsx              # Root layout, routing, navbar, sidebar, notifications
├── main.jsx             # Entry: BrowserRouter > AuthProvider > NotificationProvider
├── index.css            # Tailwind directives
├── context/
│   ├── AuthContext.jsx   # JWT decode, login/logout, loading gate
│   └── NotificationContext.jsx  # Toast system, reminder polling
└── components/
    ├── HomePage.jsx
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── VerifyPage.jsx
    ├── ForgotPasswordPage.jsx
    ├── ResetPasswordPage.jsx
    ├── GoogleAuthCallbackPage.jsx
    ├── TasksPage.jsx
    ├── StudyResourceCollector.jsx
    ├── ReminderPage.jsx
    ├── DiscussionForum.jsx
    ├── DiscussionDetails.jsx
    ├── AIStudyPage.jsx
    └── Notification.jsx

backend/
├── server.js            # Express app, all routes, DB connection
├── config/
│   └── passport-setup.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── user.js
│   ├── task.js
│   ├── Resources.js
│   ├── reminder.js
│   ├── studyPlan.js
│   ├── discussion.js
│   └── comment.js
├── services/
│   └── emailServices.js
└── jobs/
    └── jobManager.js
```

## Known Limitations

- JWT stored in localStorage (vulnerable to XSS; httpOnly cookies would be more secure)
- CORS is unrestricted (`cors()` with no origin config)
- `/api/chat-gemini` endpoint has no authentication middleware
- Push notification delivery is not yet implemented (infrastructure is in place)
- No pagination on list endpoints
- No frontend route protection (no redirect for unauthenticated users)
- StudyPlan API exists but has no frontend UI
- Email templates contain placeholder app names from earlier projects

## License

This project was built as a portfolio project for learning and demonstration purposes.
