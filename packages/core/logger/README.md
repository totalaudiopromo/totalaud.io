# @total-audio/core-logger

Structured logging utility for TotalAud.io applications.

## Features

- **Log levels:** debug, info, warn, error
- **Scoped loggers:** Group related logs by component/module
- **Environment aware:** Debug/info only in development
- **Structured context:** Attach metadata to logs
- **Type-safe:** Full TypeScript support

## Installation

```typescript
import { logger } from '@total-audio/core-logger'
```

## Usage

### Basic Logging

```typescript
import { logger } from '@total-audio/core-logger'

// Debug (development only)
logger.debug('User data loaded', { userId: '123', recordCount: 45 })

// Info (development only)
logger.info('Operation completed', { duration: 500, status: 'success' })

// Warn (always shown)
logger.warn('Rate limit approaching', { requests: 95, limit: 100 })

// Error (always shown)
try {
  // some operation
} catch (error) {
  logger.error('Operation failed', error, { userId: '123' })
}
```

### Scoped Logger

Create a scoped logger for a component or module:

```typescript
import { logger } from '@total-audio/core-logger'

// Create scoped logger
const log = logger.scope('BrokerChat')

// All logs will be prefixed with [BrokerChat]
log.debug('Component mounted')
log.info('Message sent', { messageId: '123' })
log.warn('Connection unstable')
log.error('Failed to send message', error)
```

### Component Example

```typescript
import { logger } from '@total-audio/core-logger'

export function UserProfile({ userId }: { userId: string }) {
  const log = logger.scope('UserProfile')

  useEffect(() => {
    log.debug('Component mounted', { userId })

    fetchUser(userId)
      .then((user) => {
        log.info('User loaded', { userId, userName: user.name })
      })
      .catch((error) => {
        log.error('Failed to load user', error, { userId })
      })
  }, [userId])

  // ...
}
```

### API Route Example

```typescript
import { logger } from '@total-audio/core-logger'

const log = logger.scope('API:Users')

export async function POST(req: NextRequest) {
  log.debug('Received request', { method: 'POST' })

  try {
    const body = await req.json()
    log.debug('Request body parsed', { bodyKeys: Object.keys(body) })

    // Process request...

    log.info('User created', { userId: user.id })
    return Response.json({ success: true })
  } catch (error) {
    log.error('Failed to create user', error, { method: 'POST' })
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
```

## Log Levels

### debug
- **Shown:** Development only
- **Use for:** Detailed debugging information
- **Example:** "Component mounted", "State updated"

### info
- **Shown:** Development only
- **Use for:** General information about operations
- **Example:** "User logged in", "Data loaded"

### warn
- **Shown:** Always (development + production)
- **Use for:** Warning conditions that don't stop execution
- **Example:** "Rate limit approaching", "Deprecated API used"

### error
- **Shown:** Always (development + production)
- **Use for:** Errors that need attention
- **Example:** "API request failed", "Database connection lost"

## Environment Behavior

### Development (NODE_ENV=development)
All log levels shown:
```
2025-10-23T12:00:00.000Z DEBUG [BrokerChat] Component mounted
2025-10-23T12:00:01.000Z INFO  [BrokerChat] Message sent
2025-10-23T12:00:02.000Z WARN  [BrokerChat] Connection unstable
2025-10-23T12:00:03.000Z ERROR [BrokerChat] Send failed
```

### Production (NODE_ENV=production)
Only warnings and errors shown:
```
2025-10-23T12:00:02.000Z WARN  [BrokerChat] Connection unstable
2025-10-23T12:00:03.000Z ERROR [BrokerChat] Send failed
```

## Migration from console.log

### Before
```typescript
console.log('[BrokerChat] Component mounted')
console.log('User data:', userData)
console.error('Error:', error)
```

### After
```typescript
import { logger } from '@total-audio/core-logger'

const log = logger.scope('BrokerChat')

log.debug('Component mounted')
log.debug('User data loaded', { userData })
log.error('Operation failed', error)
```

## Benefits Over console.log

1. **Environment aware** - Debug logs don't clutter production
2. **Structured** - Consistent format across codebase
3. **Scoped** - Easy to filter logs by component
4. **Contextual** - Attach metadata to logs
5. **Type-safe** - TypeScript catches errors

## API Reference

### logger.debug(message, context?)
Log debug information (development only).

### logger.info(message, context?)
Log informational messages (development only).

### logger.warn(message, context?)
Log warnings (always shown).

### logger.error(message, error?, context?)
Log errors (always shown). Optionally include Error object.

### logger.scope(scopeName)
Create a scoped logger. Returns new Logger instance.

## Examples

See the [examples directory](../../../examples/logger/) for more usage patterns.
