# Demo Digital Notebook RN - App Context

## Project Overview
**Project Name:** demo-digital-notebook-rn  
**Version:** 1.2.0  
**Type:** React Native Mobile Application (Expo)  
**Created:** August 8, 2025  
**Last Updated:** January 14, 2025  
**Platform:** Cross-platform (iOS, Android, Web)  
**Repository:** raulnicolasagusto/demo-digital-notebook-rn (master branch)

## Technology Stack

### Core Framework
- **React Native:** 0.79.5
- **React:** 19.0.0  
- **Expo SDK:** ~53.0.20
- **TypeScript:** ~5.8.3

### Authentication & User Management
- **Clerk:** ^2.14.16 - Complete authentication solution
- **Expo Secure Store:** ^14.2.3 - Secure token storage
- **Expo Web Browser:** ~14.2.0 - OAuth browser sessions
- **Expo Auth Session:** ~6.2.1 - OAuth flow management
- **Expo Crypto:** ~14.1.5 - Cryptographic utilities

### Database & Backend
- **Supabase:** ^2.55.0 - PostgreSQL database with real-time features
- **Supabase JS Client:** Full integration for authentication and data operations
- **Row Level Security (RLS):** Database-level security policies
- **Third-Party Auth Integration:** Clerk + Supabase seamless integration

### Canvas & Drawing
- **React Native SVG:** ^15.8.1 - Vector graphics for drawing canvas
- **React Native Gesture Handler:** ^2.20.3 - Touch gesture recognition
- **React Native Reanimated:** ^3.16.3 - Smooth animations for drawing

### Navigation & Routing
- **Expo Router:** ~5.1.4 - File-based routing system
- **React Native Safe Area Context:** 5.4.0 - Safe area handling
- **React Native Screens:** ~4.11.1 - Native screen management
- **Expo Linking:** ~7.1.7 - Deep linking support
- **Expo Constants:** ~17.1.7 - App constants access

### Form Management & Validation
- **React Hook Form:** ^7.62.0 - Modern form library for React
- **Zod:** ^4.0.17 - TypeScript-first schema validation
- **@hookform/resolvers:** ^5.2.1 - React Hook Form resolvers for validation libraries

### UI & Styling
- **Lucide React Native:** ^0.468.0 - Modern icon library
- **Context API:** Theme management and state
- **React Native Safe Area Context:** Responsive layouts

### Web Support
- **React Native Web:** ^0.20.0 - Web platform support
- **React DOM:** 19.0.0 - DOM rendering for web

### Development Tools
- **Babel Core:** ^7.25.2
- **TypeScript Types for React:** ~19.0.10
- **Expo TypeScript Config:** Extended from expo/tsconfig.base

### Key Features Enabled
- **New Architecture:** Enabled (newArchEnabled: true)
- **Edge-to-Edge Android:** Enabled
- **TypeScript Strict Mode:** Enabled
- **Cross-Platform Support:** iOS, Android, Web
- **Schema-based Validation:** Zod integration with React Hook Form
- **File-based Routing:** Expo Router with protected routes
- **OAuth Authentication:** Google SSO integration
- **Deep Linking:** Custom scheme support
- **Real-time Database:** Supabase PostgreSQL with subscriptions
- **Vector Graphics:** SVG-based canvas drawing system

## Current App Status

### Implementation Status: ✅ Full-Stack Digital Notebook Application Complete
- [x] Expo project initialized with Expo Router
- [x] TypeScript configuration
- [x] Custom component library created
- [x] React Hook Form integration
- [x] Zod schema validation setup
- [x] **Clerk authentication integration**
- [x] **Email/Password authentication**
- [x] **Google OAuth authentication**
- [x] **Email verification system**
- [x] **Protected route system**
- [x] **Error handling in Spanish**
- [x] **User session management**
- [x] **Supabase database integration**
- [x] **Third-party authentication (Clerk + Supabase)**
- [x] **PostgreSQL database with Row Level Security**
- [x] **User synchronization between Clerk and Supabase**
- [x] **Digital canvas with SVG drawing**
- [x] **Multi-touch gesture recognition**
- [x] **Drawing tools (pen, eraser with gradual deletion)**
- [x] **Text elements with positioning and styling**
- [x] **Theme system (light/dark mode)**
- [x] **Responsive sidebar navigation**
- [x] **Database schema for notebooks and pages**
- [x] Asset configuration complete
- [x] Cross-platform build scripts ready

### Current Features

#### 1. **Authentication System (Clerk + Supabase Integration)**
- **Sign Up:** Email/password registration with validation
- **Sign In:** Email/password login with error handling
- **Email Verification:** 6-digit code verification system
- **Google OAuth:** Single sign-on with Google integration
- **Protected Routes:** Automatic redirect for unauthenticated users
- **Session Management:** Secure token storage and session handling
- **Third-Party Auth:** Seamless integration between Clerk and Supabase
- **User Synchronization:** Automatic user creation/update in Supabase database

#### 2. **Database Architecture (Supabase PostgreSQL)**
- **Users Table:** Clerk user synchronization with profiles
- **Notebooks Table:** User-owned notebook management
- **Notebook Pages Table:** Individual pages with JSONB canvas data
- **Row Level Security:** Database-level security policies
- **Real-time Features:** Live updates and synchronization
- **UUID Primary Keys:** Secure and scalable identifiers

#### 3. **Digital Canvas System**
- **SVG-Based Drawing:** Vector graphics for scalable artwork
- **Multi-touch Support:** Gesture recognition for drawing interactions
- **Drawing Tools:**
  - **Pen Tool:** Smooth stroke rendering with pressure sensitivity simulation
  - **Eraser Tool:** Gradual path deletion with intelligent segmentation
- **Text Elements:** Positioned text with drag-and-drop functionality
- **Canvas State Management:** Persistent drawing data in database
- **Responsive Design:** Adapts to different screen sizes

#### 4. **User Interface & Experience**
- **Theme System:** Light and dark mode with context-based switching
- **Responsive Sidebar:** Collapsible navigation for different screen sizes
- **Modern Icons:** Lucide icon library integration
- **Smooth Animations:** Reanimated for fluid user interactions
- **Safe Area Handling:** Proper insets for all device types
- **Cross-platform Consistency:** Native feel on iOS, Android, and Web

#### 5. **File-based Routing Structure**
```
src/app/
├── _layout.tsx             # Root layout with Clerk provider and theme
├── index.tsx              # Welcome/landing page
├── (auth)/                # Authentication group
│   ├── _layout.tsx        # Auth layout
│   ├── sign-in.tsx        # Login screen
│   ├── sign-up.tsx        # Registration screen
│   └── verify.tsx         # Email verification screen
├── (protected)/           # Protected routes group
│   ├── _layout.tsx        # Protected layout with auth guard
│   ├── index.tsx          # Home/notebook listing screen
│   └── notebook/          # Notebook routes
│       └── [id].tsx       # Individual notebook/canvas screen
└── contexts/              # React Context providers
    └── ThemeContext.tsx   # Theme management
```

#### 6. **Component Architecture**
- **CustomInput:** Form input with React Hook Form integration and error states
- **CustomButton:** Reusable button component with Pressable
- **SignInWith:** Google OAuth authentication component
- **Sidebar:** Responsive navigation with theme switching
- **Header:** Mobile-first header with menu controls
- **Canvas Components:** SVG-based drawing tools and elements
- **Theme Provider:** Context-based theme management
- **Supabase Integration:** Database client with authentication

## Project Structure
```
demo-digital-notebook-rn/
├── App.tsx                           # Legacy (replaced by expo-router)
├── index.ts                          # App registration entry point
├── package.json                      # Dependencies and scripts
├── app.json                         # Expo configuration with plugins
├── tsconfig.json                    # TypeScript configuration
├── app-base.md                      # This context file
├── .env                             # Environment variables (Supabase + Clerk)
├── src/                             # Source code directory
│   ├── app/                         # Expo Router file-based routing
│   │   ├── _layout.tsx              # Root navigation layout with providers
│   │   ├── index.tsx                # Landing page
│   │   ├── (auth)/                  # Authentication routes
│   │   │   ├── _layout.tsx          # Auth stack layout
│   │   │   ├── sign-in.tsx          # Login screen
│   │   │   ├── sign-up.tsx          # Registration screen
│   │   │   └── verify.tsx           # Email verification
│   │   ├── (protected)/             # Protected routes
│   │   │   ├── _layout.tsx          # Auth guard layout
│   │   │   ├── index.tsx            # Authenticated home/notebook listing
│   │   │   └── notebook/            # Notebook routes
│   │   │       └── [id].tsx         # Individual notebook canvas
│   │   └── contexts/                # React Context providers
│   │       └── ThemeContext.tsx     # Theme management system
│   ├── components/                  # Reusable components
│   │   ├── CustomInput.tsx          # Form input component
│   │   ├── CustomButton.tsx         # Button component
│   │   ├── SignInWith.tsx           # OAuth component
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   ├── Header.tsx               # Mobile header component
│   │   ├── Canvas.tsx               # Main drawing canvas
│   │   ├── DrawingTools.tsx         # Drawing tool controls
│   │   ├── TextElement.tsx          # Draggable text component
│   │   └── SupabaseTestComponent.tsx # Database integration test
│   ├── lib/                         # Libraries and utilities
│   │   └── supabase.ts              # Supabase client configuration
│   └── hooks/                       # Custom React hooks
│       └── useSupabaseAuth.ts       # Clerk-Supabase authentication hook
└── assets/                          # App assets
    ├── icon.png                     # App icon
    ├── adaptive-icon.png            # Android adaptive icon
    ├── splash-icon.png              # Splash screen
    └── favicon.png                  # Web favicon
```

## Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run in web browser

## Configuration Details

### Environment Variables (.env)
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_*****
EXPO_PUBLIC_SUPABASE_URL=https://*****.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ*****
EXPO_PUBLIC_CLERK_JWKS_URL=https://*****.clerk.accounts.dev/.well-known/jwks.json
EXPO_PUBLIC_CLERK_JWT_ISSUER_URL=https://*****.clerk.accounts.dev
```

### Database Schema (Supabase PostgreSQL)
```sql
-- Users table for Clerk synchronization
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notebooks table for user-owned collections
CREATE TABLE notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  cover_color TEXT DEFAULT '#6D28D9',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notebook pages with JSONB canvas data
CREATE TABLE notebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL DEFAULT 1,
  canvas_data JSONB DEFAULT '{"paths": [], "textElements": []}',
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notebook_id, page_number)
);

-- Row Level Security policies for multi-tenant access
-- Users can only access their own data
-- Integration with Clerk JWT authentication
```

### Expo Config (app.json)
- **Custom Scheme:** digitalNotebook (for OAuth redirects)
- **Orientation:** Portrait
- **UI Style:** Light mode
- **iOS:** Tablet support enabled
- **Android:** Adaptive icon, edge-to-edge UI
- **Web:** Metro bundler, custom favicon
- **Plugins:** expo-router, expo-web-browser

### TypeScript Config
- Extends Expo's base TypeScript configuration
- Strict mode enabled for better type safety
- Full IntelliSense support with path aliases (@/components)

### Third-Party Integrations
- **Clerk Dashboard:** Custom session token claims configured
- **Supabase Dashboard:** Third-party authentication enabled for Clerk
- **JWT Integration:** Seamless token passing between services
- **Row Level Security:** Database-level access control

### Authentication Flow (Clerk + Supabase)
```typescript
// Sign Up Flow
1. User registers with email/password via Clerk
2. Clerk validates and creates account
3. Email verification code sent
4. User enters 6-digit code
5. Account activated, session created
6. User automatically synced to Supabase database

// Sign In Flow
1. User enters credentials via Clerk
2. Clerk validates against database
3. Session created with custom claims (role: authenticated)
4. JWT token passed to Supabase for database access
5. Protected routes become accessible
6. User data synchronized between services

// OAuth Flow (Google)
1. User clicks "Sign in with Google"
2. Browser opens Google OAuth
3. User authorizes app
4. Clerk processes OAuth response
5. Session created automatically with JWT
6. User synced to Supabase database

// Database Integration Flow
1. Clerk JWT contains user.sub and role claims
2. Supabase validates JWT using Third-Party Auth
3. Row Level Security policies check auth.jwt() -> 'sub'
4. Database operations scoped to authenticated user
5. Real-time subscriptions filtered by user access
```

### Canvas Data Flow
```typescript
// Drawing State Management
1. User draws on SVG canvas
2. Path coordinates captured via gesture handlers
3. Drawing data stored in React state
4. Periodic auto-save to Supabase notebook_pages table
5. JSONB canvas_data field stores complete drawing state

// Data Structure
{
  "paths": [
    {
      "id": "path_uuid",
      "d": "M10,10 L20,20 L30,15",
      "stroke": "#000000",
      "strokeWidth": 2,
      "tool": "pen"
    }
  ],
  "textElements": [
    {
      "id": "text_uuid",
      "content": "Sample text",
      "x": 100,
      "y": 150,
      "fontSize": 16,
      "color": "#000000"
    }
  ]
}
```

## Dependencies Analysis

### Production Dependencies (28+ packages)
**Core Framework (4)**
- expo (~53.0.20), react (19.0.0), react-native (0.79.5), react-dom (19.0.0)

**Authentication (5)**
- @clerk/clerk-expo (^2.14.16), expo-secure-store (^14.2.3), expo-web-browser (~14.2.0), expo-auth-session (~6.2.1), expo-crypto (~14.1.5)

**Database & Backend (2)**
- @supabase/supabase-js (^2.55.0), Third-party authentication integration

**Canvas & Drawing (3)**
- react-native-svg (^15.8.1), react-native-gesture-handler (^2.20.3), react-native-reanimated (^3.16.3)

**Navigation (5)**
- expo-router (~5.1.4), react-native-safe-area-context (5.4.0), react-native-screens (~4.11.1), expo-linking (~7.1.7), expo-constants (~17.1.7)

**Forms & Validation (3)**
- react-hook-form (^7.62.0), zod (^4.0.17), @hookform/resolvers (^5.2.1)

**UI & Icons (3)**
- lucide-react-native (^0.468.0), expo-status-bar (~2.2.3), react-native-web (^0.20.0)

### Development Dependencies (3 packages)
- @babel/core (^7.25.2), @types/react (~19.0.10), typescript (~5.8.3)

## Component Architecture

### Authentication Components
- **SignInWith:** OAuth integration with Google using Clerk's SSO
- **Auth Layouts:** Nested routing with authentication guards
- **Protected Routes:** Automatic redirect for unauthenticated access
- **Supabase Integration:** Seamless user synchronization between services

### Canvas & Drawing Components
- **Canvas:** Main SVG-based drawing surface with gesture recognition
- **DrawingTools:** Pen and eraser tool selection with state management
- **TextElement:** Draggable text components with positioning
- **Path Management:** SVG path creation, manipulation, and deletion
- **Gesture Handlers:** Multi-touch support for drawing and interaction

### UI & Navigation Components
- **Sidebar:** Responsive navigation with theme switching and collapse
- **Header:** Mobile-first header with menu controls and branding
- **Theme Provider:** Context-based light/dark theme management
- **Responsive Design:** Adaptive layouts for mobile, tablet, and web

### Form Components
- **CustomInput:** Enhanced with Clerk error integration and Spanish translations
- **Validation:** Real-time validation with Zod schemas and Clerk API responses
- **Error Display:** Field-specific error messages with visual feedback

### Database Components
- **Supabase Client:** Authenticated database operations with JWT integration
- **Real-time Subscriptions:** Live updates for collaborative features
- **Row Level Security:** User-scoped data access and protection

## Security Implementation
- **Route Protection:** Authentication guards on sensitive routes
- **Token Security:** Secure storage with encryption
- **Password Policy:** Comprehensive validation (length, complexity, breaches)
- **Email Verification:** Required verification for account activation
- **OAuth Security:** Secure redirect handling with custom scheme

## Git History & Recent Commits
- **"clerk implemention"** - Initial Clerk authentication setup
- **"implemented verification email code for sign up"** - Email verification system
- **"Expo route installed"** - File-based routing implementation

## Next Development Steps
1. **Real-time Collaboration** - Multi-user editing with live cursors and changes
2. **Advanced Drawing Tools** - Shapes, colors, layers, and brush options
3. **Notebook Organization** - Folders, tags, search, and filtering
4. **Export Features** - PDF generation, image export, and sharing
5. **Offline Support** - Local storage with sync when reconnected
6. **Voice Notes** - Audio recording and transcription integration
7. **Handwriting Recognition** - Convert handwritten text to digital text
8. **Templates** - Pre-designed notebook templates and layouts
9. **Performance Optimization** - Large canvas handling and memory management
10. **Analytics & Insights** - Usage tracking and user behavior analysis
11. **Team Workspaces** - Shared notebooks and collaborative spaces
12. **Mobile Enhancements** - Platform-specific optimizations and features

---
*Last Updated: January 14, 2025*
*Repository: raulnicolasagusto/demo-digital-notebook-rn*
*Current Status: Production-Ready Full-Stack Digital Notebook Application*