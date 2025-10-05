# Escape Room Game - Assignment 2

A coding challenge escape room game built with Next.js, TypeScript, and Prisma.

## Features Completed

### ✅ Core Game Features
- **Escape Room Game Logic**: 4 challenging coding stages
- **Timer System**: Customizable timer (1-120 minutes)
- **Stage Progression**: Format code, debug code, generate numbers, convert data
- **Visual Design**: Animated background with different themes for each game state
- **Save Functionality**: Save game progress to database

### ✅ Database Integration
- **Prisma ORM**: PostgreSQL database with comprehensive schema
- **CRUD APIs**: Complete REST API for game sessions, stages, and leaderboard
- **Data Persistence**: Game progress, user code, and statistics tracking
- **Leaderboard System**: Track high scores and completion times

### ✅ Testing
- **Unit Tests**: Game logic and state management tests
- **API Tests**: Complete API integration testing
- **Test Coverage**: 70%+ coverage threshold
- **3 Test Examples**: Multiple test scenarios for each feature

### ✅ Dockerization
- **Dockerfile**: Multi-stage build for production
- **Docker Compose**: Complete stack with PostgreSQL and Redis
- **Environment Configuration**: Production-ready setup

## Quick Start

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL
   ```

3. **Set up Database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm test
   npm run test:coverage
   ```

### Docker Setup

1. **Build and Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the Application**
   - Application: http://localhost:3000
   - Escape Room: http://localhost:3000/escape-rooms

## Game Stages

### Stage 1: Format Code
- **Challenge**: Fix Python code indentation and formatting
- **Skills**: Code formatting, Python syntax
- **Difficulty**: Easy (100 points)

### Stage 2: Debug Code
- **Challenge**: Find and fix bugs in code
- **Skills**: Debugging, logical thinking
- **Difficulty**: Medium (150 points)

### Stage 3: Generate Numbers
- **Challenge**: Write code to generate number sequences
- **Skills**: Loops, algorithms
- **Difficulty**: Easy (100 points)

### Stage 4: Data Conversion
- **Challenge**: Convert CSV data to JSON format
- **Skills**: Data processing, string manipulation
- **Difficulty**: Hard (200 points)

### Stage 5: Algorithm Implementation
- **Challenge**: Implement binary search algorithm
- **Skills**: Algorithms, data structures
- **Difficulty**: Hard (250 points)

## API Endpoints

### Game Sessions
- `GET /api/escape-room/sessions` - Get all sessions
- `POST /api/escape-room/sessions` - Create new session
- `GET /api/escape-room/sessions/[id]` - Get specific session
- `PUT /api/escape-room/sessions/[id]` - Update session
- `DELETE /api/escape-room/sessions/[id]` - Delete session

### Leaderboard
- `GET /api/escape-room/leaderboard` - Get leaderboard
- `POST /api/escape-room/leaderboard` - Add to leaderboard

### Stages
- `GET /api/escape-room/stages` - Get all stages
- `POST /api/escape-room/stages` - Create new stage

## Database Schema

### GameSession
- Tracks individual game sessions
- Stores progress, timer state, and completion status

### StageProgress
- Tracks progress through individual stages
- Records attempts, hints used, and completion time

### GameEvent
- Logs all game events for analytics
- Tracks user interactions and game flow

### EscapeRoomStage
- Stores stage definitions and solutions
- Configurable difficulty and points

### Leaderboard
- Tracks high scores and completion times
- Supports different game modes

## Testing

The project includes comprehensive testing:

### Unit Tests (`__tests__/escapeRoom.test.ts`)
- Game state management
- Timer logic
- Stage progression
- Code validation examples

### API Tests (`__tests__/escapeRoomAPI.test.ts`)
- Game session CRUD operations
- Leaderboard functionality
- Error handling
- Network error scenarios

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker Deployment
```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret key for sessions
- `REDIS_URL`: Redis connection string (optional)

## Next Steps (Remaining Assignment Requirements)

### 🚧 Pending Features
- [ ] Cloud deployment (AWS/Azure/GCP)
- [ ] AWS Lambda function for dynamic HTML generation
- [ ] Application monitoring and instrumentation
- [ ] User testing and ethical survey
- [ ] Sound effects and enhanced UI

### 🎯 Assignment Progress
- ✅ Escape Room implementation
- ✅ Database integration with Prisma
- ✅ CRUD APIs
- ✅ Save functionality
- ✅ Automated testing (2 test suites with 3+ examples each)
- ✅ Dockerization
- 🚧 Cloud deployment
- 🚧 Lambda function
- 🚧 Instrumentation
- 🚧 User testing

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest, Testing Library
- **Containerization**: Docker, Docker Compose
- **State Management**: React hooks, custom hooks
- **API**: Next.js API routes, RESTful design

## Architecture

The application follows a clean architecture pattern:

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── (root)/            # Pages
├── components/            # React components
│   └── escape-room/       # Game-specific components
├── hooks/                 # Custom React hooks
├── service/               # Business logic services
├── types/                 # TypeScript type definitions
├── prisma/                # Database schema and migrations
└── __tests__/             # Test files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is part of a university assignment and is for educational purposes.
