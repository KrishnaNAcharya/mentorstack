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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        console.log('🌱 Starting comprehensive database seeding...');
        // Hash password once for all users
        const hashedPassword = yield bcrypt_1.default.hash('password123', 10);
        // Create Admin
        console.log('📝 Creating admin...');
        const admin = yield prisma.admin.create({
            data: {
                name: 'System Administrator'
            }
        });
        // Create admin auth credentials
        yield prisma.authCredentials.create({
            data: {
                email: 'admin@mentorstack.com',
                password: hashedPassword,
                role: 'admin',
                userId: admin.id
            }
        });
        // Create Mentors
        console.log('👨‍🏫 Creating mentors...');
        const mentorsData = [
            {
                name: 'Sarah Chen',
                bio: 'Senior Software Engineer at Google with 8+ years experience in full-stack development. Passionate about teaching React, Node.js, and system design.',
                skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'System Design'],
                location: 'San Francisco, CA',
                reputation: 1250,
                email: 'sarah.chen@email.com'
            },
            {
                name: 'Marcus Rodriguez',
                bio: 'Tech Lead and Startup Advisor. Former CTO of two successful startups. Expert in scaling teams and building robust backend systems.',
                skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
                location: 'Austin, TX',
                reputation: 980,
                email: 'marcus.rodriguez@email.com'
            },
            {
                name: 'Emily Johnson',
                bio: 'UX/UI Designer turned Frontend Developer. Specializes in creating beautiful, accessible web applications with modern frameworks.',
                skills: ['Vue.js', 'CSS', 'JavaScript', 'Figma', 'Accessibility'],
                location: 'New York, NY',
                reputation: 875,
                email: 'emily.johnson@email.com'
            },
            {
                name: 'David Kim',
                bio: 'DevOps Engineer and Cloud Architect. Helps teams deploy scalable applications on AWS, Azure, and GCP.',
                skills: ['AWS', 'Azure', 'Terraform', 'Jenkins', 'Monitoring'],
                location: 'Seattle, WA',
                reputation: 1100,
                email: 'david.kim@email.com'
            },
            {
                name: 'Lisa Wang',
                bio: 'Data Scientist and Machine Learning Engineer. PhD in Computer Science, specializes in NLP and computer vision.',
                skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
                location: 'Cambridge, MA',
                reputation: 1400,
                email: 'lisa.wang@email.com'
            },
            {
                name: 'Alex Thompson',
                bio: 'Mobile Development Expert. Led iOS and Android teams at major tech companies. Expert in React Native and native development.',
                skills: ['React Native', 'iOS', 'Android', 'Swift', 'Kotlin'],
                location: 'Los Angeles, CA',
                reputation: 950,
                email: 'alex.thompson@email.com'
            },
            {
                name: 'Rachel Green',
                bio: 'Cybersecurity Specialist and Ethical Hacker. Helps organizations secure their applications and infrastructure.',
                skills: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'Python', 'Linux'],
                location: 'Denver, CO',
                reputation: 1050,
                email: 'rachel.green@email.com'
            }
        ];
        const mentors = [];
        for (const mentorData of mentorsData) {
            const { email } = mentorData, data = __rest(mentorData, ["email"]);
            const mentor = yield prisma.mentor.create({ data });
            mentors.push(mentor);
            // Create auth credentials
            yield prisma.authCredentials.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'mentor',
                    userId: mentor.id
                }
            });
        }
        // Create Mentees
        console.log('🎓 Creating mentees...');
        const menteesData = [
            {
                name: 'John Smith',
                bio: 'Computer Science student at Stanford. Passionate about web development and looking to break into tech.',
                skills: ['JavaScript', 'HTML', 'CSS', 'Python'],
                location: 'Palo Alto, CA',
                reputation: 45,
                email: 'john.smith@email.com'
            },
            {
                name: 'Maria Garcia',
                bio: 'Bootcamp graduate specializing in full-stack development. Recently completed a React/Node.js intensive program.',
                skills: ['React', 'Node.js', 'Express', 'MongoDB'],
                location: 'Miami, FL',
                reputation: 120,
                email: 'maria.garcia@email.com'
            },
            {
                name: 'Kevin Park',
                bio: 'Self-taught developer with 1 year experience. Working on personal projects and seeking guidance for career growth.',
                skills: ['Vue.js', 'JavaScript', 'Firebase', 'Git'],
                location: 'Portland, OR',
                reputation: 80,
                email: 'kevin.park@email.com'
            },
            {
                name: 'Sophia Wilson',
                bio: 'Recent CS graduate interested in machine learning and data science. Building projects to gain practical experience.',
                skills: ['Python', 'Pandas', 'Scikit-learn', 'Jupyter'],
                location: 'Boston, MA',
                reputation: 65,
                email: 'sophia.wilson@email.com'
            },
            {
                name: 'Ahmed Hassan',
                bio: 'Mobile app developer learning React Native. Previously worked with native Android development.',
                skills: ['Android', 'Java', 'React Native', 'Kotlin'],
                location: 'Chicago, IL',
                reputation: 95,
                email: 'ahmed.hassan@email.com'
            },
            {
                name: 'Jenny Liu',
                bio: 'UX designer transitioning to frontend development. Learning modern web technologies and design systems.',
                skills: ['Design', 'CSS', 'JavaScript', 'Figma'],
                location: 'San Diego, CA',
                reputation: 55,
                email: 'jenny.liu@email.com'
            },
            {
                name: 'Ryan O\'Connor',
                bio: 'DevOps enthusiast learning cloud technologies. Background in system administration looking to modernize skills.',
                skills: ['Linux', 'Docker', 'AWS', 'Bash'],
                location: 'Phoenix, AZ',
                reputation: 75,
                email: 'ryan.oconnor@email.com'
            }
        ];
        const mentees = [];
        for (const menteeData of menteesData) {
            const { email } = menteeData, data = __rest(menteeData, ["email"]);
            const mentee = yield prisma.mentee.create({ data });
            mentees.push(mentee);
            // Create auth credentials
            yield prisma.authCredentials.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'mentee',
                    userId: mentee.id
                }
            });
        }
        // Create Tags
        console.log('🏷️ Creating tags...');
        const tagsData = [
            { name: 'javascript', description: 'JavaScript programming language' },
            { name: 'react', description: 'React frontend framework' },
            { name: 'nodejs', description: 'Node.js backend runtime' },
            { name: 'python', description: 'Python programming language' },
            { name: 'webdev', description: 'Web development' },
            { name: 'career', description: 'Career advice and guidance' },
            { name: 'beginners', description: 'For programming beginners' },
            { name: 'algorithms', description: 'Data structures and algorithms' },
            { name: 'database', description: 'Database design and management' },
            { name: 'devops', description: 'DevOps and deployment' }
        ];
        const tags = [];
        for (const tagData of tagsData) {
            const tag = yield prisma.tag.create({ data: tagData });
            tags.push(tag);
        }
        // Create Articles
        console.log('📝 Creating articles...');
        const articlesData = [
            {
                authorId: mentors[0].id, // Sarah Chen
                title: 'Getting Started with React Hooks: A Complete Guide',
                content: `React Hooks revolutionized how we write functional components. In this comprehensive guide, we'll explore useState, useEffect, and custom hooks with practical examples.

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

Custom hooks let you extract component logic into reusable functions. This promotes code reuse and separation of concerns.

## Best Practices

1. Only call hooks at the top level
2. Use multiple state variables
3. Use useEffect cleanup

## Conclusion

React Hooks provide a more direct API to React concepts while maintaining performance.`,
                imageUrls: [],
                upvotes: 45,
                downvotes: 2
            },
            {
                authorId: mentors[1].id, // Marcus Rodriguez
                title: 'Building Scalable APIs with Node.js and Express',
                content: `Learn how to build robust and scalable REST APIs using Node.js and Express. This guide covers everything from basic setup to advanced production considerations.

## Project Setup

First, let's initialize a new Node.js project:

\`\`\`bash
mkdir my-api
cd my-api
npm init -y
npm install express cors helmet morgan dotenv
\`\`\`

## Basic Express Setup

\`\`\`javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## API Design Principles

### RESTful URL Structure
- GET /api/v1/users - Get all users
- GET /api/v1/users/:id - Get specific user
- POST /api/v1/users - Create new user
- PUT /api/v1/users/:id - Update user
- DELETE /api/v1/users/:id - Delete user

## Error Handling

Implement consistent error handling across your API:

\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: { message: 'Internal Server Error' }
  });
});
\`\`\`

## Authentication & Security

Use JWT tokens for stateless authentication and implement proper validation and sanitization for all inputs.

## Conclusion

Building scalable APIs requires careful consideration of architecture, security, and performance from the start.`,
                imageUrls: [],
                upvotes: 38,
                downvotes: 1
            },
            {
                authorId: mentors[2].id, // Emily Johnson
                title: 'Modern CSS Techniques for Better User Interfaces',
                content: `Discover modern CSS techniques that will help you create stunning, responsive, and accessible user interfaces.

## CSS Grid and Flexbox

CSS Grid and Flexbox are powerful layout systems that make creating complex layouts much easier.

### CSS Grid Example

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.grid-item {
  background: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
}
\`\`\`

### Flexbox for Navigation

\`\`\`css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}
\`\`\`

## CSS Custom Properties (Variables)

CSS variables make your stylesheets more maintainable:

\`\`\`css
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --font-size-base: 16px;
  --spacing-unit: 8px;
}

.button {
  background-color: var(--primary-color);
  font-size: var(--font-size-base);
  padding: calc(var(--spacing-unit) * 2);
}
\`\`\`

## Responsive Design

Use mobile-first approach with media queries:

\`\`\`css
/* Mobile first */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 2rem;
  }
}
\`\`\`

## Accessibility Considerations

Always consider accessibility in your CSS:

- Use sufficient color contrast
- Provide focus indicators
- Use semantic HTML with appropriate CSS
- Test with screen readers

## Conclusion

Modern CSS provides powerful tools for creating beautiful, accessible interfaces. Master these techniques to build better user experiences.`,
                imageUrls: [],
                upvotes: 32,
                downvotes: 0
            },
            {
                authorId: mentors[3].id, // David Kim
                title: 'Introduction to Docker for Web Developers',
                content: `Docker has revolutionized how we develop, ship, and run applications. This guide will get you started with containerizing your web applications.

## What is Docker?

Docker is a platform that uses containerization to package applications and their dependencies into lightweight, portable containers.

## Basic Docker Concepts

### Images vs Containers
- **Image**: A blueprint for creating containers
- **Container**: A running instance of an image

### Dockerfile

A Dockerfile defines how to build your application image:

\`\`\`dockerfile
# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
\`\`\`

## Building and Running Containers

\`\`\`bash
# Build image
docker build -t my-app .

# Run container
docker run -p 3000:3000 my-app

# Run in background
docker run -d -p 3000:3000 my-app
\`\`\`

## Docker Compose

For multi-service applications, use Docker Compose:

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

## Best Practices

1. Use multi-stage builds to reduce image size
2. Don't run containers as root
3. Use .dockerignore to exclude unnecessary files
4. Keep containers stateless
5. Use health checks

## Benefits of Docker

- Consistent development environments
- Easy deployment and scaling
- Improved resource utilization
- Better isolation and security

## Conclusion

Docker simplifies the development and deployment process. Start with simple containerization and gradually adopt more advanced patterns.`,
                imageUrls: [],
                upvotes: 41,
                downvotes: 3
            },
            {
                authorId: mentors[4].id, // Lisa Wang
                title: 'Getting Started with Machine Learning in Python',
                content: `Machine Learning is transforming industries and creating new opportunities. This guide will help you start your ML journey with Python.

## Setting Up Your Environment

First, install the essential libraries:

\`\`\`bash
pip install numpy pandas scikit-learn matplotlib seaborn jupyter
\`\`\`

## Understanding Machine Learning Types

### Supervised Learning
Learning from labeled examples to make predictions on new data.

Examples:
- **Classification**: Spam detection, image recognition
- **Regression**: Price prediction, sales forecasting

### Unsupervised Learning
Finding patterns in data without labels.

Examples:
- **Clustering**: Customer segmentation
- **Dimensionality Reduction**: Data visualization

## Your First ML Model

Let's build a simple classification model:

\`\`\`python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load data
data = pd.read_csv('dataset.csv')

# Prepare features and target
X = data.drop('target', axis=1)
y = data['target']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)

# Evaluate
accuracy = accuracy_score(y_test, predictions)
print(f'Accuracy: {accuracy:.2f}')
\`\`\`

## Data Preprocessing

Clean and prepare your data:

\`\`\`python
# Handle missing values
data.fillna(data.mean(), inplace=True)

# Encode categorical variables
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
data['category'] = le.fit_transform(data['category'])

# Scale features
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
\`\`\`

## Model Evaluation

Use cross-validation for robust evaluation:

\`\`\`python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5)
print(f'Cross-validation scores: {scores}')
print(f'Average score: {scores.mean():.2f}')
\`\`\`

## Common Pitfalls

1. **Overfitting**: Model performs well on training but poorly on new data
2. **Data leakage**: Using future information to predict the past
3. **Poor feature selection**: Including irrelevant or redundant features
4. **Ignoring data quality**: Garbage in, garbage out

## Next Steps

1. Learn about different algorithms
2. Practice feature engineering
3. Study deep learning with TensorFlow/PyTorch
4. Work on real-world projects
5. Participate in Kaggle competitions

## Conclusion

Machine Learning is a powerful tool, but success requires understanding both the technical and practical aspects. Start with simple problems and gradually tackle more complex challenges.`,
                imageUrls: [],
                upvotes: 67,
                downvotes: 4
            }
        ];
        const articles = [];
        for (const articleData of articlesData) {
            const article = yield prisma.article.create({ data: articleData });
            articles.push(article);
        }
        // Create Article Tags
        console.log('🔗 Creating article tags...');
        yield prisma.articleTag.createMany({
            data: [
                { articleId: articles[0].id, tagId: (_a = tags.find(t => t.name === 'react')) === null || _a === void 0 ? void 0 : _a.id },
                { articleId: articles[0].id, tagId: (_b = tags.find(t => t.name === 'javascript')) === null || _b === void 0 ? void 0 : _b.id },
                { articleId: articles[1].id, tagId: (_c = tags.find(t => t.name === 'nodejs')) === null || _c === void 0 ? void 0 : _c.id },
                { articleId: articles[1].id, tagId: (_d = tags.find(t => t.name === 'webdev')) === null || _d === void 0 ? void 0 : _d.id },
                { articleId: articles[2].id, tagId: (_e = tags.find(t => t.name === 'webdev')) === null || _e === void 0 ? void 0 : _e.id },
                { articleId: articles[3].id, tagId: (_f = tags.find(t => t.name === 'devops')) === null || _f === void 0 ? void 0 : _f.id },
                { articleId: articles[4].id, tagId: (_g = tags.find(t => t.name === 'python')) === null || _g === void 0 ? void 0 : _g.id }
            ]
        });
        // Create Communities
        console.log('🏘️ Creating communities...');
        const communitiesData = [
            {
                name: 'React Developers',
                description: 'A community for React developers to share knowledge, ask questions, and collaborate on projects.',
                skills: ['React', 'JavaScript', 'TypeScript', 'Next.js'],
                createdBy: mentors[0].id // Sarah Chen
            },
            {
                name: 'Backend Engineers',
                description: 'Backend developers discussing server-side technologies, APIs, databases, and system architecture.',
                skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Microservices'],
                createdBy: mentors[1].id // Marcus Rodriguez
            },
            {
                name: 'UI/UX Designers',
                description: 'Design community focused on user experience, interface design, and design systems.',
                skills: ['Figma', 'Adobe XD', 'CSS', 'Design Systems', 'Accessibility'],
                createdBy: mentors[2].id // Emily Johnson
            },
            {
                name: 'DevOps & Cloud',
                description: 'Infrastructure, deployment, monitoring, and cloud technologies discussion.',
                skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Monitoring'],
                createdBy: mentors[3].id // David Kim
            },
            {
                name: 'AI & Machine Learning',
                description: 'Machine learning enthusiasts, data scientists, and AI researchers sharing insights.',
                skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'NLP'],
                createdBy: mentors[4].id // Lisa Wang
            }
        ];
        const communities = [];
        for (const communityData of communitiesData) {
            const community = yield prisma.community.create({ data: communityData });
            communities.push(community);
        }
        // Create Community Members
        console.log('👥 Creating community members...');
        const membershipData = [];
        // Add mentors to relevant communities
        communities.forEach(community => {
            // Add the creator as a member
            membershipData.push({
                communityId: community.id,
                userRole: 'mentor',
                userId: community.createdBy
            });
            // Add some other mentors to each community
            mentors.slice(0, 3).forEach(mentor => {
                if (mentor.id !== community.createdBy) {
                    membershipData.push({
                        communityId: community.id,
                        userRole: 'mentor',
                        userId: mentor.id
                    });
                }
            });
        });
        // Add mentees to communities
        mentees.slice(0, 5).forEach(mentee => {
            communities.slice(0, 3).forEach(community => {
                membershipData.push({
                    communityId: community.id,
                    userRole: 'mentee',
                    userId: mentee.id
                });
            });
        });
        yield prisma.communityMember.createMany({
            data: membershipData,
            skipDuplicates: true
        });
        // Create Questions
        console.log('❓ Creating questions...');
        const questionsData = [
            {
                menteeId: mentees[0].id, // John Smith
                title: 'How do I handle state management in a large React application?',
                body: `I'm working on a React application that's growing quite large, and I'm struggling with state management. I've been using useState and useContext, but it's becoming difficult to manage.

I've heard about Redux and Zustand, but I'm not sure which one to choose or if there are other alternatives. What are the best practices for state management in large React applications?

Specifically, I'd like to know:
1. When should I use Redux vs Context API?
2. How do I structure my state for scalability?
3. Are there any simpler alternatives to Redux?

Any guidance would be greatly appreciated!`
            },
            {
                menteeId: mentees[1].id, // Maria Garcia
                title: 'Best practices for Node.js API authentication and security?',
                body: `I'm building a REST API with Node.js and Express, and I want to make sure I implement authentication and security correctly from the start.

I'm planning to use JWT tokens, but I have several questions:

1. Should I store JWT tokens in localStorage, sessionStorage, or httpOnly cookies?
2. How do I handle token refresh properly?
3. What other security measures should I implement (rate limiting, CORS, etc.)?
4. How do I secure sensitive routes and validate user permissions?

I want to follow industry best practices and avoid common security vulnerabilities. Any recommendations for libraries or patterns?`
            },
            {
                menteeId: mentees[2].id, // Kevin Park
                title: 'Vue.js vs React: Which should I learn first as a beginner?',
                body: `I'm a self-taught developer with basic JavaScript knowledge, and I want to learn a frontend framework. I'm torn between Vue.js and React.

Here's my situation:
- I have 6 months of vanilla JavaScript experience
- I want to get a job as a frontend developer within a year
- I prefer simpler, more intuitive syntax
- I'm concerned about job market demand

I've done some research and heard that:
- Vue has a gentler learning curve
- React has more job opportunities
- Vue has better documentation
- React has a larger ecosystem

Which one would you recommend for someone in my position? Should I focus on one or try to learn both?`
            },
            {
                menteeId: mentees[3].id, // Sophia Wilson
                title: 'How to get started with machine learning projects for portfolio?',
                body: `I recently graduated with a CS degree and want to build a strong portfolio in machine learning and data science. I have theoretical knowledge but lack practical project experience.

I'm looking for advice on:

1. What types of ML projects are good for beginners but impressive to employers?
2. Which datasets should I use for practice projects?
3. How do I properly document and present my ML projects?
4. What tools and platforms should I use (Jupyter, Kaggle, GitHub)?
5. Should I focus on specific domains like NLP, computer vision, or try everything?

I want to create 3-4 solid projects that demonstrate my skills. Any suggestions for project ideas or resources would be helpful!`
            },
            {
                menteeId: mentees[4].id, // Ahmed Hassan
                title: 'React Native vs Native Development: When to choose what?',
                body: `I have experience with native Android development using Java and Kotlin, but I'm considering learning React Native for cross-platform development.

I'm trying to understand:

1. When should I choose React Native over native development?
2. What are the performance implications of React Native?
3. How different is React Native from React for web?
4. What are the limitations of React Native that I should be aware of?
5. Is it worth learning React Native if I already know native Android?

I'm particularly interested in the job market perspective. Are companies looking for React Native developers, or do they prefer native specialists?

For context, I want to develop mobile apps efficiently while maintaining good performance and user experience.`
            }
        ];
        const questions = [];
        for (const questionData of questionsData) {
            const question = yield prisma.question.create({ data: questionData });
            questions.push(question);
        }
        // Create Question Tags
        console.log('🔗 Creating question tags...');
        yield prisma.questionTag.createMany({
            data: [
                { questionId: questions[0].id, tagId: (_h = tags.find(t => t.name === 'react')) === null || _h === void 0 ? void 0 : _h.id },
                { questionId: questions[0].id, tagId: (_j = tags.find(t => t.name === 'javascript')) === null || _j === void 0 ? void 0 : _j.id },
                { questionId: questions[1].id, tagId: (_k = tags.find(t => t.name === 'nodejs')) === null || _k === void 0 ? void 0 : _k.id },
                { questionId: questions[2].id, tagId: (_l = tags.find(t => t.name === 'javascript')) === null || _l === void 0 ? void 0 : _l.id },
                { questionId: questions[2].id, tagId: (_m = tags.find(t => t.name === 'career')) === null || _m === void 0 ? void 0 : _m.id },
                { questionId: questions[3].id, tagId: (_o = tags.find(t => t.name === 'python')) === null || _o === void 0 ? void 0 : _o.id },
                { questionId: questions[3].id, tagId: (_p = tags.find(t => t.name === 'career')) === null || _p === void 0 ? void 0 : _p.id },
                { questionId: questions[4].id, tagId: (_q = tags.find(t => t.name === 'career')) === null || _q === void 0 ? void 0 : _q.id }
            ]
        });
        // Create some Answers
        console.log('💬 Creating answers...');
        yield prisma.answer.createMany({
            data: [
                {
                    questionId: questions[0].id,
                    mentorId: mentors[0].id, // Sarah Chen answering React question
                    body: `Great question! For large React applications, I recommend a layered approach to state management:

**1. Local State (useState)**: For component-specific state that doesn't need to be shared.

**2. Context API**: For theme, user authentication, or other app-wide state that doesn't change frequently.

**3. External State Management**: For complex state that needs to be shared across many components.

For external state management, I'd recommend **Zustand** over Redux for most applications because:
- Much simpler API and less boilerplate
- Great TypeScript support
- Smaller bundle size
- Still scalable for large apps

Only choose Redux if you need:
- Time-travel debugging
- Strict unidirectional data flow
- Large team with established Redux patterns

Here's a simple Zustand store example:

\`\`\`javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}))
\`\`\`

**Structure tips:**
- Keep state as flat as possible
- Separate concerns (auth, UI, data)
- Use selectors to prevent unnecessary re-renders

Would you like me to elaborate on any of these points?`,
                    upvotes: 15,
                    downvotes: 0
                },
                {
                    questionId: questions[1].id,
                    mentorId: mentors[1].id, // Marcus Rodriguez answering Node.js security question
                    body: `Excellent question! Security should indeed be a priority from the start. Here's my recommended approach:

**JWT Storage:**
Use **httpOnly cookies** for storing refresh tokens and short-lived access tokens in memory. This prevents XSS attacks while maintaining usability.

**Authentication Flow:**
1. Login → Issue short-lived access token (15-30 min) + httpOnly refresh token
2. Store access token in memory/state
3. Use refresh token to get new access tokens automatically
4. Logout → Clear both tokens

**Essential Security Measures:**

\`\`\`javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Input validation
const { body, validationResult } = require('express-validator');
\`\`\`

**Libraries I recommend:**
- \`helmet\` for security headers
- \`express-rate-limit\` for rate limiting
- \`express-validator\` for input validation
- \`bcrypt\` for password hashing
- \`jsonwebtoken\` for JWT handling

**Additional measures:**
- Always use HTTPS in production
- Validate and sanitize all inputs
- Implement proper error handling (don't leak sensitive info)
- Use environment variables for secrets
- Add logging and monitoring

Would you like me to dive deeper into any of these topics?`,
                    upvotes: 12,
                    downvotes: 1
                }
            ]
        });
        // Create some Article Votes
        console.log('👍 Creating article votes...');
        yield prisma.articleVote.createMany({
            data: [
                { menteeId: mentees[0].id, articleId: articles[0].id, voteType: 'upvote' },
                { menteeId: mentees[1].id, articleId: articles[0].id, voteType: 'upvote' },
                { menteeId: mentees[2].id, articleId: articles[1].id, voteType: 'upvote' },
                { menteeId: mentees[3].id, articleId: articles[2].id, voteType: 'upvote' },
                { menteeId: mentees[4].id, articleId: articles[3].id, voteType: 'upvote' },
                { menteeId: mentees[5].id, articleId: articles[4].id, voteType: 'upvote' }
            ],
            skipDuplicates: true
        });
        // Create some Mentorship Requests
        console.log('🤝 Creating mentorship requests...');
        yield prisma.mentorshipRequest.createMany({
            data: [
                {
                    mentorId: mentors[0].id,
                    menteeId: mentees[0].id,
                    status: 'pending',
                    requestMessage: 'Hi Sarah! I really enjoyed your React Hooks article. I\'m a CS student looking to improve my React skills and would love your guidance.'
                },
                {
                    mentorId: mentors[1].id,
                    menteeId: mentees[1].id,
                    status: 'accepted',
                    requestMessage: 'Hello Marcus, I\'m a bootcamp graduate working on Node.js projects. Your experience with scalable APIs would be invaluable for my growth.'
                },
                {
                    mentorId: mentors[2].id,
                    menteeId: mentees[5].id,
                    status: 'accepted',
                    requestMessage: 'Hi Emily! I\'m transitioning from UX design to frontend development and would appreciate guidance on modern CSS and design systems.'
                }
            ]
        });
        // Create some Connections (accepted mentorship requests)
        console.log('🔗 Creating connections...');
        yield prisma.connection.createMany({
            data: [
                { mentorId: mentors[1].id, menteeId: mentees[1].id },
                { mentorId: mentors[2].id, menteeId: mentees[5].id }
            ]
        });
        console.log('✅ COMPREHENSIVE DATABASE SEEDING COMPLETED!');
        console.log('📊 Created:');
        console.log('   - 1 Admin');
        console.log('   - 7 Mentors');
        console.log('   - 7 Mentees');
        console.log('   - 15 Auth Credentials');
        console.log('   - 5 Articles with detailed content');
        console.log('   - 5 Communities');
        console.log('   - 5 Questions with detailed descriptions');
        console.log('   - 2 Answers from mentors');
        console.log('   - 10 Tags');
        console.log('   - Article and Question tags');
        console.log('   - Community memberships');
        console.log('   - Article votes');
        console.log('   - Mentorship requests');
        console.log('   - Active connections');
        console.log('');
        console.log('🔑 Test Credentials (password: password123):');
        console.log('   📧 admin@mentorstack.com (Admin)');
        console.log('   📧 sarah.chen@email.com (Mentor - React Expert)');
        console.log('   📧 marcus.rodriguez@email.com (Mentor - Backend Expert)');
        console.log('   📧 john.smith@email.com (Mentee - CS Student)');
        console.log('   📧 maria.garcia@email.com (Mentee - Bootcamp Graduate)');
        console.log('   ... and 10 more users');
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
