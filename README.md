# 🚀 Chat Backend Architecture Guide

A comprehensive guide to understanding the chat backend system with AI bot integration, human agent handoff, and persistent queue management.

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Architecture](#-architecture)
- [Database Layer](#-database-layer)
- [Queue System](#-queue-system)
- [Service Layers](#-service-layers)
- [Socket.IO Events](#-socketio-events)
- [Data Flow](#-data-flow)
- [API Reference](#-api-reference)
- [Environment Setup](#-environment-setup)
- [Development Guide](#-development-guide)

---

## 🎯 System Overview

This is a **real-time chat backend** that handles:

- **AI-powered customer support** using OpenAI GPT
- **Seamless handoff to human agents** when needed
- **Priority-based queue system** for agent assignment
- **Persistent data storage** with PostgreSQL
- **Real-time communication** via Socket.IO
- **Scalable queue management** with Redis

### Key Features

✅ **Persistent Chat Sessions** - All conversations survive server restarts  
✅ **Priority Queue System** - High/Normal/Low priority customer routing  
✅ **AI Integration** - OpenAI GPT handles initial customer interactions  
✅ **Agent Dashboard** - Real-time agent management and assignment  
✅ **Type Safety** - Full TypeScript with database-generated types  
✅ **Monitoring** - Built-in analytics and debugging tools

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Socket.IO     │    │   Services      │
│   (React)       │◄──►│   Server        │◄──►│   Layer         │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌────────▼────────┐
                                               │  ChatService    │
                                               │  (Orchestrator) │
                                               └─────────────────┘
                                                        │
                                    ┌───────────────────┼───────────────────┐
                                    │                   │                   │
                               ┌────▼────┐       ┌─────▼─────┐      ┌─────▼─────┐
                               │Database │       │   Queue   │      │  OpenAI   │
                               │Service  │       │  Service  │      │  Service  │
                               └─────────┘       └───────────┘      └───────────┘
                                    │                   │
                               ┌────▼────┐       ┌─────▼─────┐
                               │PostgreSQL│       │   Redis   │
                               │(Drizzle)│       │  Queues   │
                               └─────────┘       └───────────┘
```

### Core Components

| Component            | Purpose                          | Technology               |
| -------------------- | -------------------------------- | ------------------------ |
| **Socket Handler**   | Real-time client communication   | Socket.IO                |
| **Chat Service**     | Main business logic orchestrator | TypeScript               |
| **Database Service** | Data persistence operations      | Drizzle ORM + PostgreSQL |
| **Queue Service**    | Transfer queue management        | Redis                    |
| **OpenAI Service**   | AI chat integration              | OpenAI API               |

---

## 🗄️ Database Layer

The system uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations.

### Database Schema

```sql
-- Core Tables
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  chat_sessions  │    │    messages     │    │     agents      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (varchar)    │◄───┤ session_id      │    │ id (varchar)    │
│ user_id         │    │ content         │    │ socket_id       │
│ status (enum)   │    │ sender (enum)   │    │ name            │
│ assigned_agent  │────┼─────────────────┤    │ status (enum)   │
│ bot_context     │    │ timestamp       │    │ joined_at       │
│ metadata (json) │    │ metadata (json) │    │ last_active_at  │
│ created_at      │    └─────────────────┘    └─────────────────┘
│ updated_at      │
└─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│ transfer_queue  │    │session_analytics│
├─────────────────┤    ├─────────────────┤
│ id (serial)     │    │ session_id      │
│ session_id      │    │ total_messages  │
│ reason          │    │ bot_messages    │
│ priority (enum) │    │ agent_messages  │
│ position        │    │ session_duration│
│ requested_at    │    │ was_transferred │
│ processed_at    │    └─────────────────┘
│ is_active       │
└─────────────────┘
```

### Database Service (`src/services/databaseService.ts`)

**Purpose**: Handles all database operations with type safety

**Key Methods**:

```typescript
// Session Management
createSession(userId, botContext, metadata) → ChatSession
getSession(sessionId) → ChatSession | null
updateSessionStatus(sessionId, status, assignedAgent?)
closeSession(sessionId)

// Message Management
addMessage(sessionId, content, sender, metadata) → Message
getSessionMessages(sessionId) → Message[]
getSessionMessageCount(sessionId) → number

// Agent Management
createAgent(socketId, name, metadata) → Agent
getAgent(agentId) → Agent | null
getAvailableAgents() → Agent[]
assignSessionToAgent(sessionId, agentId) → boolean

// Statistics
getSystemStats() → SystemStats
cleanupOldSessions(olderThanDays) → number
```

**Example Usage**:

```typescript
const dbService = new DatabaseService();

// Create a new chat session
const session = await dbService.createSession(
  'user123',
  'You are a helpful support bot',
  { customerType: 'premium' }
);

// Add a message
const message = await dbService.addMessage(
  session.id,
  'Hello, I need help',
  'user'
);
```

---

## 🔄 Queue System

Uses **Redis** for high-performance queue management with priority levels.

### Queue Architecture

```
Redis Queue System
├── High Priority Queue    (chat:queue:high)
├── Normal Priority Queue  (chat:queue:normal)
├── Low Priority Queue     (chat:queue:low)
├── Queue Metadata        (chat:queue_metadata)
└── Active Sessions Set   (chat:active_sessions)
```

### Queue Service (`src/services/queueService.ts`)

**Purpose**: Manages transfer queue with priority handling

**Key Methods**:

```typescript
// Queue Operations
addToQueue(sessionId, reason, priority, metadata?) → void
getNextInQueue() → QueueEntry | null
removeFromQueue(sessionId) → boolean
getQueuePosition(sessionId) → number

// Queue Management
getQueueLength() → number
getWaitingSessions() → QueueStatus[]
clearQueue() → number
getQueueStats() → QueueStats

// Health & Monitoring
healthCheck() → HealthStatus
debugQueue() → DebugInfo
```

**Queue Entry Structure**:

```typescript
interface QueueEntry {
  sessionId: string;
  reason: string;
  priority: 'high' | 'normal' | 'low';
  requestedAt: Date;
  metadata?: Record<string, any>;
}
```

**Example Usage**:

```typescript
const queueService = new QueueService();

// Add customer to high priority queue
await queueService.addToQueue(
  'session-123',
  'Technical issue with premium account',
  'high',
  { customerTier: 'premium' }
);

// Get next customer for agent
const nextCustomer = await queueService.getNextInQueue();
```

---

## 🎛️ Service Layers

### Chat Service (`src/services/chatService.ts`)

**Purpose**: Main orchestrator that coordinates all other services

**Key Responsibilities**:

- Session lifecycle management
- Message routing
- Agent assignment
- Queue coordination
- Statistics aggregation

**Key Methods**:

```typescript
// Session Management
createSession(userId, botContext, metadata) → ChatSession
getSessionWithMessages(sessionId) → {session, messages}
closeSession(sessionId)

// Transfer Management
transferToQueue(sessionId, reason, priority)
assignSessionToAgent(sessionId, agentId) → boolean
getWaitingSessions() → SessionWithQueueInfo[]

// Agent Management
addAgent(socketId, name, metadata) → Agent
removeAgent(agentId)
getAvailableAgent() → Agent | undefined

// Monitoring
getStats() → SystemStats
healthCheck() → HealthStatus
debugQueue() → DebugInfo
```

### OpenAI Service (`src/services/openaiService.ts`)

**Purpose**: Handles AI conversation and automatic transfers

**Key Features**:

- GPT-powered responses
- Automatic agent transfer detection
- Tool integration (transfer, poetry, etc.)
- Context management

**Key Methods**:

```typescript
generateResponse(sessionId, messages, botContext) → {content}
generateGreeting(botContext) → string
setTransferCallback(callback) // For automatic transfers
```

**Transfer Detection**:
The AI automatically detects when customers need human help and triggers transfers:

```typescript
// User: "I want to speak with a human"
// AI automatically calls: transferCallback(sessionId, "Customer requested human agent", "normal")
```

---

## 🔌 Socket.IO Events

Real-time communication between frontend and backend.

### Customer Events

| Event                   | Direction       | Purpose                | Data                             |
| ----------------------- | --------------- | ---------------------- | -------------------------------- |
| `customer:start_chat`   | Client → Server | Start new chat session | `{userId, botContext, metadata}` |
| `customer:send_message` | Client → Server | Send message           | `{sessionId, content}`           |
| `customer:end_chat`     | Client → Server | End chat session       | `{sessionId}`                    |
| `session:created`       | Server → Client | Session created        | `{sessionId, status}`            |
| `message:received`      | Server → Client | New message            | `Message`                        |
| `status:changed`        | Server → Client | Session status update  | `{status, agentName?}`           |
| `session:closed`        | Server → Client | Session closed         | `{}`                             |

### Agent Events

| Event                  | Direction       | Purpose                   | Data                   |
| ---------------------- | --------------- | ------------------------- | ---------------------- |
| `agent:join`           | Client → Server | Agent login               | `{name}`               |
| `agent:pickup_session` | Client → Server | Take session from queue   | `{sessionId}`          |
| `agent:send_message`   | Client → Server | Send message as agent     | `{sessionId, content}` |
| `agent:close_session`  | Client → Server | Close session             | `{sessionId}`          |
| `agent:joined`         | Server → Client | Agent login successful    | `{agentId, agent}`     |
| `session:assigned`     | Server → Client | Session assigned to agent | `{sessionId, session}` |
| `queue:update`         | Server → Client | Queue state changed       | `{sessions[]}`         |

### Admin Events

| Event                | Direction       | Purpose              | Data          |
| -------------------- | --------------- | -------------------- | ------------- |
| `admin:get_stats`    | Client → Server | Request system stats | `{}`          |
| `admin:debug_queue`  | Client → Server | Request debug info   | `{}`          |
| `admin:health_check` | Client → Server | System health check  | `{}`          |
| `stats:update`       | Server → Client | System statistics    | `SystemStats` |
| `queue:debug_info`   | Server → Client | Debug information    | `DebugInfo`   |

---

## 📊 Data Flow

### 1. Customer Starts Chat

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as Socket Handler
    participant CS as Chat Service
    participant DB as Database
    participant AI as OpenAI

    C->>S: customer:start_chat
    S->>CS: createSession()
    CS->>DB: createSession()
    DB-->>CS: session
    CS-->>S: session
    S->>AI: generateGreeting()
    AI-->>S: greeting
    S->>DB: addMessage(greeting)
    S-->>C: session:created
    S-->>C: message:received (greeting)
```

### 2. AI Conversation & Transfer

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as Socket Handler
    participant CS as Chat Service
    participant AI as OpenAI
    participant Q as Queue Service
    participant A as Agent

    C->>S: customer:send_message
    S->>CS: addMessage()
    S->>AI: generateResponse()
    AI->>CS: transferToQueue() [if needed]
    CS->>Q: addToQueue()
    Q-->>CS: queued
    CS-->>S: session transferred
    S-->>C: status:changed (waiting)
    S-->>A: queue:update
```

### 3. Agent Assignment

```mermaid
sequenceDiagram
    participant A as Agent
    participant S as Socket Handler
    participant CS as Chat Service
    participant Q as Queue Service
    participant DB as Database
    participant C as Customer

    A->>S: agent:pickup_session
    S->>CS: assignSessionToAgent()
    CS->>Q: removeFromQueue()
    CS->>DB: assignSessionToAgent()
    DB-->>CS: success
    CS-->>S: assigned
    S-->>A: session:assigned
    S-->>C: status:changed (agent)
    S-->>A: queue:update
```

---

## 🌐 API Reference

### REST Endpoints

| Method | Endpoint    | Purpose             | Response                        |
| ------ | ----------- | ------------------- | ------------------------------- |
| `GET`  | `/health`   | System health check | `{status, services, timestamp}` |
| `GET`  | `/api/info` | Server information  | `{name, version, features}`     |

### Socket.IO Namespaces

- **Default namespace** (`/`): All customer and agent communication
- **Admin namespace** (potential future): Administrative functions

### Authentication

- **No authentication required** for development
- Customers identified by `userId`
- Agents identified by `socketId` + `name`

---

## ⚙️ Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://chat_user:chat_password@localhost:5432/chat_db

# Redis
REDIS_URL=redis://:redis_password@localhost:6379
REDIS_PASSWORD=redis_password

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Docker Services

```yaml
# Managed by docker-compose.yml
services:
  - PostgreSQL 16 (port 5432)
  - Redis 7 (port 6379)
  - Redis Commander (port 8081) [development]
```

---

## 🔧 Development Guide

### Starting the System

```bash
# 1. Start infrastructure
pnpm docker:dev

# 2. Setup database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 3. Start development server
pnpm dev
```

### Key Commands

```bash
# Database
pnpm db:studio          # Open database browser
pnpm db:generate        # Generate migrations
pnpm db:migrate         # Run migrations
pnpm db:seed           # Seed sample data

# Development
pnpm dev               # Start with auto-reload
pnpm type-check        # TypeScript validation
pnpm test:client       # Run test client

# Docker
pnpm docker:up         # Start all services
pnpm docker:logs       # View logs
pnpm redis:cli         # Connect to Redis CLI
```

### Testing

```bash
# Run the interactive test client
pnpm test:client

# Test scenarios:
# 1. Start as customer → chat with AI → request human
# 2. Start as agent → pick up session → chat with customer
# 3. Multiple customers with different priorities
```

### Monitoring Tools

- **Database Studio**: http://localhost:4983 (database browser)
- **Redis Commander**: http://localhost:8081 (queue monitoring)
- **Server Health**: http://localhost:3001/health

### File Structure

```
src/
├── config/
│   ├── redis.ts           # Redis connection & keys
│   └── database.ts        # Database configuration
├── database/
│   ├── schema.ts          # Drizzle schema definitions
│   ├── db.ts             # Database connection
│   └── migrations/        # SQL migration files
├── services/
│   ├── chatService.ts     # Main orchestrator
│   ├── databaseService.ts # Database operations
│   ├── queueService.ts    # Queue management
│   └── openaiService.ts   # AI integration
├── socket/
│   └── socketHandler.ts   # Socket.IO event handling
├── scripts/
│   └── seed.ts           # Database seeding
├── types/
│   └── chat.types.ts     # TypeScript type definitions
└── index.ts              # Main server entry point
```

### Performance Considerations

- **Database Indexing**: All frequently queried fields are indexed
- **Connection Pooling**: PostgreSQL uses connection pooling (max 20 connections)
- **Redis Pipelining**: Queue operations use Redis transactions
- **Type Safety**: Full TypeScript prevents runtime errors
- **Efficient Queries**: Message counts vs. full message loading

### Debugging

```typescript
// Enable debug logging
DEBUG=socket.io:* pnpm dev

// Queue debugging
socket.emit('admin:debug_queue');

// Database inspection
pnpm db:studio

// Redis monitoring
pnpm redis:cli
> MONITOR
```

---

## 🎯 Common Patterns

### Adding a New Feature

1. **Update Database Schema** (`schema.ts`)
2. **Generate Migration** (`pnpm db:generate`)
3. **Add Database Methods** (`databaseService.ts`)
4. **Update Business Logic** (`chatService.ts`)
5. **Add Socket Events** (`socketHandler.ts`)
6. **Update Types** (`chat.types.ts`)

### Error Handling

All services use consistent error handling:

```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('User-friendly error message');
}
```

### Logging Convention

```typescript
console.log('✅ Success message');
console.log('🔄 Process message');
console.log('⚠️ Warning message');
console.error('❌ Error message');
console.log('🔍 Debug info');
```

---

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

---

**🎉 You're ready to develop with the chat backend!**

This architecture provides a solid foundation for real-time chat with AI integration, human agent handoff, and scalable queue management. The modular design makes it easy to extend and customize for specific needs.
