# Murmurs App - Development Log

## Step 1: Database Schema & TypeORM Entities ✅

### What was implemented:
Created the complete database foundation with 4 core entities using TypeORM.

### Files Created/Modified:

#### 1. **User Entity** (`server/src/entities/user.entity.ts`)
- Primary table for all users
- Fields: `id`, `name`, `email`, `createdAt`, `updatedAt`
- Relations: One-to-Many with Murmurs, Follows (both directions), and Likes

#### 2. **Murmur Entity** (`server/src/entities/murmur.entity.ts`)
- Stores all tweets/murmurs
- Fields: `id`, `text`, `likeCount`, `userId`, `createdAt`, `updatedAt`
- Relations: Many-to-One with User, One-to-Many with Likes
- **Denormalized field**: `likeCount` for performance (avoids counting likes on every query)

#### 3. **Follow Entity** (`server/src/entities/follow.entity.ts`)
- Manages user follow relationships
- Fields: `id`, `followerId`, `followedId`, `createdAt`
- **Unique constraint**: Prevents duplicate follows
- Relations: Many-to-One with User (twice - follower and followed)

#### 4. **Like Entity** (`server/src/entities/like.entity.ts`)
- Tracks likes on murmurs
- Fields: `id`, `userId`, `murmurId`, `createdAt`
- **Unique constraint**: One user can only like a murmur once
- Relations: Many-to-One with User and Murmur

#### 5. **App Module** (`server/src/app.module.ts`)
- Registered all 4 entities with TypeORM
- Enabled `logging: true` for debugging SQL queries
- `synchronize: true` auto-creates tables in development

#### 6. **Seed Data** (`db/init_db/seed_data.sql`)
- 4 sample users (Alice, Bob, Charlie, Diana)
- 10 sample murmurs
- 9 follow relationships
- 8 likes
- Ready to test relationships and queries

### Database Schema Diagram:

```
users (1) ──────< murmurs (N)
  ↑                  ↑
  │                  │
  │ (N)          (N) │
  │                  │
follows            likes
(self-referencing)
```

### Key Design Decisions:

1. **Cascading Deletes**: `onDelete: 'CASCADE'`
   - When a user is deleted, all their murmurs, follows, and likes are automatically deleted
   - Maintains data integrity

2. **Unique Indexes**: 
   - `follows`: `(followerId, followedId)` - prevents duplicate follows
   - `likes`: `(userId, murmurId)` - prevents duplicate likes
   - Improves query performance

3. **Denormalized Like Count**:
   - `murmurs.likeCount` stores count directly
   - Trade-off: Faster reads, need to update on like/unlike
   - Good for timeline where we show many murmurs

4. **Timestamps**:
   - `createdAt` on all entities for chronological ordering
   - `updatedAt` on User and Murmur for audit trail

### How to Test:

1. **Start the backend** (it will auto-create tables):
   ```bash
   cd server
   npm run start:dev
   ```

2. **Check MySQL** - Tables should be created:
   - users
   - murmurs
   - follows
   - likes

3. **Load seed data** (optional, for testing):
   ```bash
   cd db
   docker exec -i $(docker ps -qf "name=test") mysql -udocker -pdocker test < init_db/seed_data.sql
   ```

### What's Next:
**Step 2**: Create User Module with basic CRUD operations and endpoints.

---
