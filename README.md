# CoderWeb

A comprehensive Next.js application for managing code snippets and practicing coding challenges through interactive escape rooms.

## ⚙️ Features

### Tab Management
- Create, edit, and organize code snippets with rich text editing
- Persistent navigation state across browser sessions
- Bulk operations for managing multiple tabs
- HTML export functionality for sharing and documentation

### Escape Room Challenges
- Interactive coding puzzles with multiple difficulty levels
- Real-time code validation and hint system
- Leaderboard with scoring and timing
- Progressive difficulty with starter code and solutions

### User Experience
- Responsive design for desktop and mobile devices
- Dark and light theme support with system preference detection
- Video tutorials and help system
- Toast notifications for user feedback

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **ShadCN UI** - Modern Compenet-based UI Libarary

### Backend & Database
- **Prisma** - Database ORM and migrations
- **SQLite** - Local database for development
- **Next.js API Routes** - Serverless API endpoints

### Development & Testing
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Docker** - Containerization
- **Nginx** - Reverse proxy (production)

## 📦 Installation

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/lesa-hettiarachchi/coder-web.git
   cd coder-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed-questions
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Using Docker Compose

1. **Build and start services**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - HTTP: [http://localhost:80](http://localhost:80)
   - HTTPS: [https://localhost:443](https://localhost:443) (with SSL setup)

### Docker Configuration
- Multi-stage build for optimized production image
- Health checks and automatic restarts
- Volume mounts for persistent data

## 🧪 Testing

### PlayWright Tests
```bash
# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run in headed mode
npx playwright test --headed
```

Download JMeter and run JMeter tests store in ```bash/corder-web/jmeter``` directory. (please use your delpoyed url instead of baseurl)

### Test Coverage
- Tab management workflows
- Escape room game functionality
- Responsive design testing
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Mobile device testing

## 📁 Project Structure

```
coder-web/
├── app/                    # Next.js App Router
│   ├── (root)/            # Main application pages
│   │   ├── page.tsx       # Home page
│   │   ├── escape-rooms/  # Escape room challenges
│   │   ├── add-tab/       # Tab creation
│   │   └── edit-tab/      # Tab editing
│   └── api/               # API routes
│       ├── tabs/          # Tab management APIs
│       └── escape-room/   # Game APIs
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── home/             # Home page components
│   ├── escape-room/      # Game components
│   └── header/           # Navigation components
├── hooks/                # Custom React hooks
├── service/              # Business logic services
├── types/                # TypeScript definitions
├── prisma/               # Database schema and migrations
├── tests/                # Playwright test suites
├── jmeter/               # Performance testing
└── lambda/               # AWS Lambda functions
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run seed-questions   # Seed escape room questions

# Testing
npx playwright test         # Run Playwright tests
npx playwright test --ui      # Run tests with UI
npx playwright test --headed  # Run tests in headed mode
```

## 🗄️ Database Schema

### Core Models
- **Tab** - Code snippet storage
- **EscapeRoomStage** - Challenge definitions
- **GameSession** - Player game state
- **Leaderboard** - High scores and rankings
- **StageProgress** - Individual stage completion tracking

### Key Features
- SQLite for development and small deployments
- Prisma ORM for type-safe database operations
- Automatic migrations and schema validation
- Optimized queries with proper indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is done as academic project for CSE3CWA.

