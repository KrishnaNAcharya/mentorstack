"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Starting SIMPLE database seeding...');
        // Simple approach: Use Prisma's upsert to handle conflicts
        const hashedPassword = yield bcrypt_1.default.hash('password123', 10);
        // Create mentors
        const mentor1 = yield prisma.mentor.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: 'Sarah Chen',
                bio: 'Senior Software Engineer at Google with 8+ years experience in full-stack development.',
                skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
                location: 'San Francisco, CA',
                reputation: 1250
            }
        });
        const mentor2 = yield prisma.mentor.upsert({
            where: { id: 2 },
            update: {},
            create: {
                name: 'Marcus Rodriguez',
                bio: 'Tech Lead and Startup Advisor. Expert in backend systems.',
                skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
                location: 'Austin, TX',
                reputation: 980
            }
        });
        // Create mentees
        const mentee1 = yield prisma.mentee.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: 'Alex Thompson',
                bio: 'Computer Science student passionate about web development.',
                skills: ['JavaScript', 'HTML', 'CSS', 'Python'],
                location: 'Palo Alto, CA',
                reputation: 45
            }
        });
        // Create auth credentials
        yield prisma.authCredentials.upsert({
            where: { email: 'sarah.chen@email.com' },
            update: {},
            create: {
                email: 'sarah.chen@email.com',
                password: hashedPassword,
                role: 'mentor',
                userId: 1
            }
        });
        yield prisma.authCredentials.upsert({
            where: { email: 'alex.thompson@email.com' },
            update: {},
            create: {
                email: 'alex.thompson@email.com',
                password: hashedPassword,
                role: 'mentee',
                userId: 1
            }
        });
        // Create articles
        const article1 = yield prisma.article.upsert({
            where: { id: 1 },
            update: {},
            create: {
                authorId: 1,
                title: 'Getting Started with React Hooks',
                content: `React Hooks revolutionized how we write functional components. In this article, we'll explore useState, useEffect, and custom hooks with practical examples.

## What are React Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They allow you to use state and other React features without writing a class.

## Basic Hooks

### useState

The useState hook lets you add state to functional components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect

The useEffect hook performs side effects in function components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Custom Hooks

Custom hooks let you extract component logic into reusable functions:

\`\`\`javascript
import { useState, useEffect } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
\`\`\`

## Best Practices

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Use multiple state variables** - Split state into multiple variables based on which values tend to change together
3. **Use useEffect cleanup** - Return a cleanup function from useEffect to prevent memory leaks

## Conclusion

React Hooks provide a more direct API to the React concepts you already know. They make components more readable and reusable while maintaining the same performance characteristics.`,
                imageUrls: []
            }
        });
        const article2 = yield prisma.article.upsert({
            where: { id: 2 },
            update: {},
            create: {
                authorId: 2,
                title: 'Building Scalable APIs with Node.js',
                content: `Learn how to build robust and scalable REST APIs using Node.js and Express. This comprehensive guide covers everything from basic setup to advanced production considerations.

## Setting Up Your Project

First, let's initialize a new Node.js project:

\`\`\`bash
mkdir my-api
cd my-api
npm init -y
npm install express cors helmet morgan dotenv
npm install -D nodemon
\`\`\`

## Basic Express Setup

\`\`\`javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## API Design Principles

### 1. Use Proper HTTP Methods
- **GET**: Retrieve data
- **POST**: Create new resources
- **PUT**: Update entire resources
- **PATCH**: Partial updates
- **DELETE**: Remove resources

### 2. RESTful URL Structure
\`\`\`
GET    /api/v1/users          # Get all users
GET    /api/v1/users/:id      # Get specific user
POST   /api/v1/users          # Create new user
PUT    /api/v1/users/:id      # Update user
DELETE /api/v1/users/:id      # Delete user
\`\`\`

### 3. Consistent Response Format
\`\`\`javascript
// Success response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
\`\`\`

## Error Handling

\`\`\`javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: message
    }
  });
});
\`\`\`

## Authentication & Authorization

\`\`\`javascript
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: { message: 'Access token required' } 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Invalid token' } 
      });
    }
    req.user = user;
    next();
  });
};
\`\`\`

## Database Integration

\`\`\`javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User routes with database
app.get('/api/v1/users', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    const total = await prisma.user.count();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch users' }
    });
  }
});
\`\`\`

## Rate Limiting

\`\`\`javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later' }
  }
});

app.use('/api/', limiter);
\`\`\`

## Validation

\`\`\`javascript
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }
    next();
  }
];

app.post('/api/v1/users', validateUser, async (req, res) => {
  // Create user logic
});
\`\`\`

## Testing

\`\`\`javascript
const request = require('supertest');
const app = require('../app');

describe('User API', () => {
  test('GET /api/v1/users should return users list', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.users).toBeDefined();
  });
});
\`\`\`

## Production Considerations

1. **Environment Variables**: Use .env files for configuration
2. **Logging**: Implement structured logging with Winston
3. **Monitoring**: Add health checks and metrics
4. **Caching**: Implement Redis for frequently accessed data
5. **Load Balancing**: Use PM2 or container orchestration
6. **Security**: HTTPS, input sanitization, SQL injection prevention

## Conclusion

Building scalable APIs requires careful consideration of architecture, security, performance, and maintainability. Start with these fundamentals and gradually add complexity as your application grows.`,
                imageUrls: []
            }
        });
        const article3 = yield prisma.article.upsert({
            where: { id: 3 },
            update: {},
            create: {
                authorId: 1,
                title: 'Modern JavaScript ES6+ Features',
                content: `JavaScript has evolved significantly with ES6 (ES2015) and beyond. Let's explore the modern features that make JavaScript more powerful and enjoyable to write.

## Arrow Functions

Arrow functions provide a more concise syntax for writing functions:

\`\`\`javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]
\`\`\`

## Template Literals

Template literals make string interpolation much cleaner:

\`\`\`javascript
const name = 'John';
const age = 30;

// Old way
const message = 'Hello, my name is ' + name + ' and I am ' + age + ' years old.';

// Template literal
const message = \`Hello, my name is \${name} and I am \${age} years old.\`;

// Multiline strings
const html = \`
  <div>
    <h1>\${title}</h1>
    <p>\${content}</p>
  </div>
\`;
\`\`\`

## Destructuring

Destructuring allows you to extract values from arrays and objects:

\`\`\`javascript
// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(rest);  // [3, 4, 5]

// Object destructuring
const user = { name: 'Alice', age: 25, city: 'New York' };
const { name, age } = user;
console.log(name); // 'Alice'

// Destructuring in function parameters
const greet = ({ name, age }) => {
  console.log(\`Hello \${name}, you are \${age} years old\`);
};
greet(user);
\`\`\`

## Spread and Rest Operators

The spread operator (...) has multiple uses:

\`\`\`javascript
// Spread arrays
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Spread objects
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// Rest parameters
const sum = (...numbers) => {
  return numbers.reduce((total, num) => total + num, 0);
};
console.log(sum(1, 2, 3, 4)); // 10
\`\`\`

## Classes

ES6 introduced class syntax for object-oriented programming:

\`\`\`javascript
class Animal {
  constructor(name, species) {
    this.name = name;
    this.species = species;
  }

  speak() {
    console.log(\`\${this.name} makes a sound\`);
  }

  static getSpeciesCount() {
    return Animal.count || 0;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name, 'Canine');
    this.breed = breed;
  }

  speak() {
    console.log(\`\${this.name} barks\`);
  }
}

const dog = new Dog('Rex', 'German Shepherd');
dog.speak(); // 'Rex barks'
\`\`\`

## Promises and Async/Await

Modern JavaScript provides better ways to handle asynchronous operations:

\`\`\`javascript
// Promise-based function
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('Data fetched successfully');
    }, 1000);
  });
};

// Using async/await
const getData = async () => {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Promise.all for concurrent operations
const fetchMultiple = async () => {
  try {
    const [data1, data2, data3] = await Promise.all([
      fetchData(),
      fetchData(),
      fetchData()
    ]);
    console.log(data1, data2, data3);
  } catch (error) {
    console.error('One or more requests failed:', error);
  }
};
\`\`\`

## Modules

ES6 modules provide a standardized way to organize code:

\`\`\`javascript
// math.js
export const PI = 3.14159;

export const add = (a, b) => a + b;

export const multiply = (a, b) => a * b;

export default class Calculator {
  static square(x) {
    return x * x;
  }
}

// main.js
import Calculator, { PI, add, multiply } from './math.js';

console.log(PI); // 3.14159
console.log(add(2, 3)); // 5
console.log(Calculator.square(4)); // 16
\`\`\`

## Array Methods

Modern JavaScript provides powerful array methods:

\`\`\`javascript
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
];

// filter
const activeUsers = users.filter(user => user.active);

// map
const names = users.map(user => user.name);

// find
const user = users.find(user => user.name === 'Alice');

// reduce
const totalAge = users.reduce((sum, user) => sum + user.age, 0);

// some and every
const hasActiveUser = users.some(user => user.active);
const allActive = users.every(user => user.active);

// includes
const numbers = [1, 2, 3, 4, 5];
console.log(numbers.includes(3)); // true
\`\`\`

## Optional Chaining and Nullish Coalescing

Handle undefined/null values safely:

\`\`\`javascript
const user = {
  name: 'Alice',
  address: {
    street: '123 Main St'
  }
};

// Optional chaining
const street = user?.address?.street; // '123 Main St'
const zipCode = user?.address?.zipCode; // undefined (no error)

// Nullish coalescing
const defaultName = user?.name ?? 'Anonymous';
const defaultAge = user?.age ?? 0;

// Combined with function calls
const result = api?.getData?.();
\`\`\`

## Conclusion

These ES6+ features make JavaScript more expressive, readable, and powerful. They're widely supported in modern browsers and Node.js, so start using them in your projects today!`,
                imageUrls: []
            }
        });
        const article4 = yield prisma.article.upsert({
            where: { id: 4 },
            update: {},
            create: {
                authorId: 2,
                title: 'Database Design Best Practices',
                content: `Good database design is crucial for building scalable and maintainable applications. Let's explore the fundamental principles and best practices for designing efficient databases.

## Database Design Principles

### 1. Normalization

Normalization reduces data redundancy and improves data integrity:

**First Normal Form (1NF):**
- Each column contains atomic values
- No repeating groups

**Second Normal Form (2NF):**
- Must be in 1NF
- All non-key columns fully depend on the primary key

**Third Normal Form (3NF):**
- Must be in 2NF
- No transitive dependencies

\`\`\`sql
-- Bad: Not normalized
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100),
  customer_email VARCHAR(100),
  customer_address TEXT,
  product_names TEXT[], -- Array of product names
  product_prices DECIMAL[]
);

-- Good: Normalized
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  address TEXT
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
\`\`\`

### 2. Primary Keys

Every table should have a primary key:

\`\`\`sql
-- Using auto-incrementing integers
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

-- Using UUIDs for distributed systems
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Composite primary keys for junction tables
CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id),
  role_id INTEGER REFERENCES roles(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);
\`\`\`

### 3. Foreign Key Constraints

Maintain referential integrity with foreign keys:

\`\`\`sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Different cascade options:
-- CASCADE: Delete/update related records
-- SET NULL: Set foreign key to NULL
-- RESTRICT: Prevent deletion if references exist
-- NO ACTION: Similar to RESTRICT
\`\`\`

### 4. Indexes

Create indexes for frequently queried columns:

\`\`\`sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);

-- Partial index
CREATE INDEX idx_active_users ON users(id) WHERE active = true;

-- Unique index
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- Full-text search index
CREATE INDEX idx_posts_content_fts ON posts USING gin(to_tsvector('english', content));
\`\`\`

## Data Types

Choose appropriate data types:

\`\`\`sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,           -- Variable length string
  description TEXT,                     -- Long text
  price DECIMAL(10,2) NOT NULL,         -- Exact decimal
  weight FLOAT,                         -- Approximate decimal
  in_stock BOOLEAN DEFAULT true,        -- Boolean
  created_at TIMESTAMP DEFAULT NOW(),   -- Date and time
  tags JSONB,                          -- JSON data
  metadata JSONB DEFAULT '{}'::jsonb
);
\`\`\`

## Performance Optimization

### Query Optimization

\`\`\`sql
-- Use EXPLAIN to analyze queries
EXPLAIN ANALYZE 
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.author_id
WHERE u.active = true
GROUP BY u.id, u.name
ORDER BY post_count DESC
LIMIT 10;

-- Use appropriate WHERE clauses
SELECT * FROM orders 
WHERE created_at >= '2024-01-01'::date
  AND status = 'completed'
  AND total_amount > 100;

-- Avoid SELECT *
SELECT id, name, email FROM users WHERE active = true;
\`\`\`

### Pagination

\`\`\`sql
-- Offset-based pagination (simple but slow for large offsets)
SELECT * FROM posts 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 100;

-- Cursor-based pagination (more efficient)
SELECT * FROM posts 
WHERE created_at < '2024-01-01 10:00:00'
ORDER BY created_at DESC 
LIMIT 20;
\`\`\`

## Security Considerations

### 1. Input Validation

\`\`\`sql
-- Use parameterized queries to prevent SQL injection
-- Bad (vulnerable to SQL injection)
SELECT * FROM users WHERE email = '\${userInput}';

-- Good (parameterized query)
SELECT * FROM users WHERE email = $1;
\`\`\`

### 2. Access Control

\`\`\`sql
-- Create specific database users with limited permissions
CREATE USER app_user WITH PASSWORD 'secure_password';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE ON posts TO app_user;
GRANT SELECT ON users TO app_user;

-- Revoke unnecessary permissions
REVOKE DELETE ON posts FROM app_user;
\`\`\`

### 3. Data Encryption

\`\`\`sql
-- Store sensitive data encrypted
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  ssn_encrypted BYTEA,  -- Encrypted SSN
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Database Schema Migrations

Version control your database changes:

\`\`\`sql
-- Migration 001: Create initial tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migration 002: Add user profiles
ALTER TABLE users ADD COLUMN first_name VARCHAR(50);
ALTER TABLE users ADD COLUMN last_name VARCHAR(50);

-- Migration 003: Create posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  author_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Backup and Recovery

\`\`\`bash
# Regular backups
pg_dump myapp_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="myapp_production"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump $DB_NAME | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
\`\`\`

## Monitoring and Maintenance

\`\`\`sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(table_name::regclass)) as size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(table_name::regclass) DESC;

-- Analyze and vacuum regularly
ANALYZE;
VACUUM;
\`\`\`

## Common Anti-Patterns to Avoid

1. **EAV (Entity-Attribute-Value) Pattern**: Avoid storing different types of data in the same columns
2. **No Foreign Keys**: Always use foreign key constraints for data integrity
3. **Generic Column Names**: Use descriptive column names
4. **No Indexes**: Create indexes for frequently queried columns
5. **Storing JSON Everything**: Use proper relational design when possible

## Conclusion

Good database design is about finding the right balance between normalization, performance, and maintainability. Start with a well-normalized design, then optimize based on your specific use cases and performance requirements.`,
                imageUrls: []
            }
        });
        const article5 = yield prisma.article.upsert({
            where: { id: 5 },
            update: {},
            create: {
                authorId: 1,
                title: 'Frontend Performance Optimization',
                content: `Frontend performance is crucial for user experience and SEO. A slow website can lead to high bounce rates and lost conversions. Let's explore proven techniques to make your web applications lightning fast.

## Core Web Vitals

Google's Core Web Vitals are essential metrics for measuring user experience:

### Largest Contentful Paint (LCP)
- **Target**: < 2.5 seconds
- **Measures**: Loading performance
- **Optimization**: Optimize images, use CDN, minimize critical path

### First Input Delay (FID)
- **Target**: < 100 milliseconds  
- **Measures**: Interactivity
- **Optimization**: Reduce JavaScript execution time, code splitting

### Cumulative Layout Shift (CLS)
- **Target**: < 0.1
- **Measures**: Visual stability
- **Optimization**: Set dimensions for images/videos, avoid dynamic content insertion

## Image Optimization

Images often account for the majority of page weight:

\`\`\`html
<!-- Use modern formats -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.avif" type="image/avif">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>

<!-- Responsive images -->
<img 
  srcset="
    image-320w.jpg 320w,
    image-640w.jpg 640w,
    image-1024w.jpg 1024w
  "
  sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, 1024px"
  src="image-640w.jpg"
  alt="Description"
  loading="lazy"
>
\`\`\`

### Image Compression Tools
- **WebP**: 25-30% smaller than JPEG
- **AVIF**: 50% smaller than JPEG
- **Tools**: ImageOptim, TinyPNG, Squoosh

## JavaScript Optimization

### Code Splitting

\`\`\`javascript
// Dynamic imports for code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: React.lazy(() => import('./Dashboard'))
  },
  {
    path: '/profile',
    component: React.lazy(() => import('./Profile'))
  }
];

// Feature-based splitting
const loadAnalytics = () => {
  if (process.env.NODE_ENV === 'production') {
    return import('./analytics').then(module => module.init());
  }
};
\`\`\`

### Tree Shaking

\`\`\`javascript
// Bad: Imports entire library
import _ from 'lodash';

// Good: Import only what you need
import { debounce, throttle } from 'lodash';

// Even better: Use individual packages
import debounce from 'lodash.debounce';

// ES modules for tree shaking
export const utils = {
  formatDate,
  formatCurrency,
  validateEmail
};

// Import specific functions
import { formatDate, validateEmail } from './utils';
\`\`\`

### Minimize and Compress

\`\`\`javascript
// Webpack configuration
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            dead_code: true
          }
        }
      })
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
\`\`\`

## CSS Optimization

### Critical CSS

\`\`\`html
<!-- Inline critical CSS -->
<style>
  /* Above-the-fold styles */
  body { margin: 0; font-family: system-ui; }
  .header { height: 60px; background: #fff; }
  .hero { height: 400px; background: #f0f0f0; }
</style>

<!-- Preload non-critical CSS -->
<link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
\`\`\`

### CSS Optimization Techniques

\`\`\`css
/* Use efficient selectors */
/* Bad */
.container .sidebar .widget .title { }

/* Good */
.widget-title { }

/* Use CSS containment */
.article {
  contain: content;
}

/* Use will-change for animations */
.animated-element {
  will-change: transform;
}

/* Remove will-change after animation */
.animated-element.animation-complete {
  will-change: auto;
}
\`\`\`

## Caching Strategies

### Browser Caching

\`\`\`javascript
// Service Worker for caching
const CACHE_NAME = 'app-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
\`\`\`

### HTTP Caching Headers

\`\`\`javascript
// Express.js caching middleware
app.use(express.static('public', {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true,
  lastModified: true
}));

// API response caching
app.get('/api/data', (req, res) => {
  res.set({
    'Cache-Control': 'public, max-age=300', // 5 minutes
    'ETag': generateETag(data)
  });
  res.json(data);
});
\`\`\`

## Resource Hints

\`\`\`html
<!-- DNS prefetch -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- Preconnect -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- Prefetch likely navigation -->
<link rel="prefetch" href="/dashboard">

<!-- Module preload for ES modules -->
<link rel="modulepreload" href="/modules/main.js">
\`\`\`

## Performance Monitoring

### Web Vitals Measurement

\`\`\`javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Measure and send to analytics
getCLS(metric => sendToAnalytics('CLS', metric));
getFID(metric => sendToAnalytics('FID', metric));
getFCP(metric => sendToAnalytics('FCP', metric));
getLCP(metric => sendToAnalytics('LCP', metric));
getTTFB(metric => sendToAnalytics('TTFB', metric));

function sendToAnalytics(name, metric) {
  // Send to your analytics service
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.value),
    event_label: metric.id
  });
}
\`\`\`

### Performance Budget

\`\`\`javascript
// Webpack Bundle Analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html'
    })
  ],
  performance: {
    maxAssetSize: 250000, // 250kb
    maxEntrypointSize: 250000,
    hints: 'warning'
  }
};
\`\`\`

## React Performance

### Component Optimization

\`\`\`javascript
import React, { memo, useMemo, useCallback } from 'react';

// Memoize components
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  // Component logic
});

// Memoize expensive calculations
const MyComponent = ({ items, filter }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter);
  }, [items, filter]);

  const handleClick = useCallback((id) => {
    // Handle click logic
  }, []);

  return (
    <div>
      {filteredItems.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
};

// Virtualization for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        {data[index].name}
      </div>
    )}
  </List>
);
\`\`\`

## Tools and Testing

### Performance Testing Tools

1. **Lighthouse**: Automated auditing tool
2. **WebPageTest**: Detailed performance analysis
3. **Chrome DevTools**: Performance profiling
4. **Bundle Analyzers**: Webpack Bundle Analyzer, Bundle Buddy

### Continuous Performance Monitoring

\`\`\`javascript
// GitHub Actions for performance testing
name: Performance Test
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.8.x
          lhci autorun
\`\`\`

## Progressive Web App Features

\`\`\`javascript
// App Shell Architecture
const SHELL_CACHE = 'shell-v1';
const shellResources = [
  '/',
  '/app-shell.html',
  '/app-shell.css',
  '/app-shell.js'
];

// Offline fallback
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    );
  }
});
\`\`\`

## Conclusion

Frontend performance optimization is an ongoing process that requires:

1. **Measurement**: Use tools to identify bottlenecks
2. **Optimization**: Apply appropriate techniques
3. **Monitoring**: Continuously track performance metrics
4. **User-centric approach**: Focus on perceived performance

Remember: Premature optimization is the root of all evil. Always measure first, then optimize based on real data and user impact.`,
                imageUrls: []
            }
        });
        // Add some votes for articles
        yield prisma.articleVote.createMany({
            data: [
                { menteeId: 1, articleId: 1, voteType: 'upvote' },
                { menteeId: 1, articleId: 2, voteType: 'upvote' },
                { menteeId: 1, articleId: 3, voteType: 'upvote' }
            ],
            skipDuplicates: true
        });
        console.log('✅ SIMPLE DATABASE SEEDING COMPLETED!');
        console.log('📊 Created:');
        console.log('   - 2 Mentors');
        console.log('   - 1 Mentee');
        console.log('   - 2 Auth Credentials');
        console.log('   - 5 Detailed Articles with full content');
        console.log('   - 3 Article votes');
        console.log('');
        console.log('🔑 Test Credentials (password: password123):');
        console.log('   📧 sarah.chen@email.com (Mentor)');
        console.log('   📧 alex.thompson@email.com (Mentee)');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
