# SPICE - Premium Dating App

A sophisticated, full-featured dating application built with React, TypeScript, and Supabase. Designed for adults seeking meaningful connections with support for both single and couple profiles.

## 🌟 Features

### Core Features
- ✅ **User Authentication** - Secure signup/login with email verification
- ✅ **Profile Management** - Rich profiles with photos, bio, interests
- ✅ **Smart Discovery** - Swipe-based matching with filters
- ✅ **Real-time Messaging** - Instant chat with matches
- ✅ **Couple Profiles** - Support for couples seeking connections
- ✅ **Location-based Matching** - Distance filtering
- ✅ **Interest Matching** - Find people with shared interests
- ✅ **Safety Features** - Block and report functionality

### Technical Features
- 🔐 Row Level Security (RLS) for data protection
- 🚀 Real-time updates with Supabase Realtime
- 📱 Mobile-first responsive design
- 🎨 Modern UI with Tailwind CSS
- 🔄 Automatic match creation
- 📸 Photo upload and management
- 🎯 Advanced filtering system

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Query
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier works)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/TheMagicMannn/Spiceapp.git
cd Spiceapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase
Follow the detailed instructions in [SETUP_GUIDE.md](./SETUP_GUIDE.md)

Quick summary:
1. Create a Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Create a `photos` storage bucket
4. Copy your project credentials

### 4. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5000` to see the app!

## 📁 Project Structure

```
Spiceapp/
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configs
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main app component
│   └── public/             # Static assets
├── server/                 # Express server (optional)
├── shared/                 # Shared types and schemas
├── supabase-schema.sql     # Database schema
├── SETUP_GUIDE.md          # Detailed setup instructions
└── package.json
```

## 🎯 Key Components

### Authentication Flow
1. User signs up with email/password
2. Email verification sent
3. User completes profile setup
4. User can start swiping

### Matching Algorithm
1. User swipes right (like) or left (pass)
2. If both users like each other, a match is created
3. Match notification shown
4. Users can start messaging

### Real-time Features
- Instant message delivery
- Live match notifications
- Online status indicators

## 🔒 Security

- **Row Level Security (RLS)**: All database tables protected
- **Authentication**: Supabase Auth with JWT tokens
- **Data Validation**: Client and server-side validation
- **Age Verification**: 18+ requirement enforced
- **Privacy Controls**: Block and report features
- **Secure Storage**: Photos stored in Supabase Storage

## 📱 Responsive Design

The app is fully responsive and works on:
- 📱 Mobile devices (iOS/Android)
- 💻 Tablets
- 🖥️ Desktop browsers

## 🎨 Design System

Based on the SPICE design guidelines:
- **Colors**: Dark theme with pink/crimson accents
- **Typography**: Inter font family
- **Components**: Radix UI primitives
- **Animations**: Framer Motion

## 🧪 Testing

```bash
# Run type checking
npm run check

# Build for production
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS
- Google Cloud

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Complete setup instructions
- [Design Guidelines](./design_guidelines.md) - UI/UX guidelines
- [Database Schema](./supabase-schema.sql) - Database structure

## 🤝 Contributing

This is a private project, but suggestions and feedback are welcome!

## 📄 License

This project is for educational and personal use.

## ⚠️ Important Notes

### Legal Compliance
When deploying a dating application, ensure compliance with:
- Age verification laws (18+ requirement)
- Data protection regulations (GDPR, CCPA, etc.)
- Content moderation requirements
- Terms of service and privacy policy

### Safety Features
The app includes:
- User blocking
- Report functionality
- Profile verification system
- Content moderation hooks

### Production Checklist
Before going live:
- [ ] Set up proper email service
- [ ] Configure domain and SSL
- [ ] Set up monitoring and analytics
- [ ] Implement content moderation
- [ ] Add terms of service and privacy policy
- [ ] Set up customer support
- [ ] Test all features thoroughly
- [ ] Configure backup strategy

## 🆘 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Check existing issues in the repository

## 🎉 Acknowledgments

Built with:
- [Supabase](https://supabase.com) - Backend infrastructure
- [React](https://react.dev) - UI framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Radix UI](https://radix-ui.com) - UI components
- [Vite](https://vitejs.dev) - Build tool

---

Made with ❤️ for meaningful connections

