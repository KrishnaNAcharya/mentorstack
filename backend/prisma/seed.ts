import { PrismaClient } from '@prisma/client'

// Define enums locally since they may not be exported yet
enum Role {
  mentor = 'mentor',
  mentee = 'mentee',
  admin = 'admin'
}

enum VoteType {
  upvote = 'upvote',
  downvote = 'downvote'
}

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.bookmark.deleteMany()
  await prisma.aiLog.deleteMany()
  await prisma.reputationHistory.deleteMany()
  await prisma.userBadge.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.communityPostVote.deleteMany()
  await prisma.communityPost.deleteMany()
  await prisma.communityMember.deleteMany()
  await prisma.community.deleteMany()
  await prisma.articleVote.deleteMany()
  await prisma.article.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.question.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.connection.deleteMany()
  await prisma.mentorshipRequest.deleteMany()
  await prisma.authCredentials.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.mentee.deleteMany()
  await prisma.mentor.deleteMany()

  // Create Mentors
  const mentor1 = await prisma.mentor.create({
    data: {
      name: 'Dr. Sarah Johnson',
      bio: 'Senior Software Engineer with 10+ years experience in full-stack development',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      location: 'San Francisco, CA',
      reputation: 850,
    },
  })

  const mentor2 = await prisma.mentor.create({
    data: {
      name: 'Michael Chen',
      bio: 'Tech Lead specializing in cloud architecture and DevOps',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Python', 'Terraform'],
      location: 'Seattle, WA',
      reputation: 720,
    },
  })

  // Create Mentees
  const mentee1 = await prisma.mentee.create({
    data: {
      name: 'Alex Rodriguez',
      bio: 'Computer Science student passionate about web development',
      skills: ['HTML', 'CSS', 'JavaScript', 'Python'],
      location: 'Austin, TX',
      reputation: 120,
    },
  })

  const mentee2 = await prisma.mentee.create({
    data: {
      name: 'Emma Davis',
      bio: 'Career changer transitioning into software engineering',
      skills: ['JavaScript', 'React', 'Git'],
      location: 'New York, NY',
      reputation: 85,
    },
  })

  // Create Admin
  const admin1 = await prisma.admin.create({
    data: {
      name: 'Platform Administrator',
    },
  })

  // Create Auth Credentials
  await prisma.authCredentials.create({
    data: {
      email: 'sarah.johnson@mentorstack.com',
      password: 'hashed_password_here', // In real app, this would be properly hashed
      role: Role.mentor,
      userId: mentor1.id,
    },
  })

  await prisma.authCredentials.create({
    data: {
      email: 'michael.chen@mentorstack.com',
      password: 'hashed_password_here',
      role: Role.mentor,
      userId: mentor2.id,
    },
  })

  await prisma.authCredentials.create({
    data: {
      email: 'alex.rodriguez@mentorstack.com',
      password: 'hashed_password_here',
      role: Role.mentee,
      userId: mentee1.id,
    },
  })

  await prisma.authCredentials.create({
    data: {
      email: 'emma.davis@mentorstack.com',
      password: 'hashed_password_here',
      role: Role.mentee,
      userId: mentee2.id,
    },
  })

  await prisma.authCredentials.create({
    data: {
      email: 'admin@mentorstack.com',
      password: 'hashed_password_here',
      role: Role.admin,
      userId: admin1.id,
    },
  })

  // Create Mentorship Requests
  const mentorshipRequest1 = await prisma.mentorshipRequest.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee1.id,
      status: 'accepted',
      requestMessage: 'Hi! I would love to learn web development from you.',
    },
  })

  // Create Connections
  const connection1 = await prisma.connection.create({
    data: {
      mentorId: mentor1.id,
      menteeId: mentee1.id,
    },
  })

  // Create Conversation
  const conversation1 = await prisma.conversation.create({
    data: {
      connectionId: connection1.id,
    },
  })

  // Create Messages
  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderRole: Role.mentor,
      senderId: mentor1.id,
      message: 'Welcome! I\'m excited to mentor you in your web development journey.',
    },
  })

  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderRole: Role.mentee,
      senderId: mentee1.id,
      message: 'Thank you so much! I\'m really looking forward to learning from you.',
    },
  })

  // Create Questions
  const question1 = await prisma.question.create({
    data: {
      menteeId: mentee2.id,
      title: 'How to get started with React?',
      body: 'I\'m new to React and feeling overwhelmed. What\'s the best way to start learning?',
      tags: ['React', 'JavaScript', 'Beginner', 'Frontend'],
    },
  })

  // Create Answers
  await prisma.answer.create({
    data: {
      questionId: question1.id,
      mentorId: mentor1.id,
      body: 'Start with the official React tutorial and build small projects. Focus on understanding components and state management first.',
      upvotes: 5,
    },
  })

  // Create Articles
  const article1 = await prisma.article.create({
    data: {
      authorId: mentor2.id,
      title: 'Getting Started with Cloud Architecture',
      content: 'Cloud architecture is fundamental in modern software development...',
      upvotes: 12,
      downvotes: 1,
    },
  })

  // Create Communities
  const community1 = await prisma.community.create({
    data: {
      name: 'Web Development',
      description: 'A community for web developers to share knowledge and experiences',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular'],
      createdBy: mentor1.id,
    },
  })

  const community2 = await prisma.community.create({
    data: {
      name: 'Cloud & DevOps',
      description: 'Discussions about cloud platforms, DevOps practices, and infrastructure',
      skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform'],
      createdBy: mentor2.id,
    },
  })

  // Create Community Members
  await prisma.communityMember.create({
    data: {
      communityId: community1.id,
      userRole: Role.mentor,
      userId: mentor1.id,
    },
  })

  await prisma.communityMember.create({
    data: {
      communityId: community1.id,
      userRole: Role.mentee,
      userId: mentee1.id,
    },
  })

  // Create Community Posts
  const communityPost1 = await prisma.communityPost.create({
    data: {
      communityId: community1.id,
      userRole: Role.mentor,
      userId: mentor1.id,
      title: 'Best Practices for React State Management',
      content: 'Here are some tips for managing state effectively in React applications...',
    },
  })

  // Create Badges
  const badge1 = await prisma.badge.create({
    data: {
      name: 'First Question',
      description: 'Asked your first question',
      reputationThreshold: 10,
    },
  })

  const badge2 = await prisma.badge.create({
    data: {
      name: 'Helpful Mentor',
      description: 'Received 10 upvotes on answers',
      reputationThreshold: 100,
    },
  })

  // Create Article Votes
  await prisma.articleVote.create({
    data: {
      menteeId: mentee1.id,
      articleId: article1.id,
      voteType: VoteType.upvote,
    },
  })

  // Create AI Logs
  await prisma.aiLog.create({
    data: {
      menteeId: mentee1.id,
      prompt: 'Explain the difference between let and const in JavaScript',
      response: 'let allows reassignment while const creates immutable bindings...',
    },
  })

  // Create Bookmarks
  await prisma.bookmark.create({
    data: {
      menteeId: mentee1.id,
      contentType: 'article',
      contentId: article1.id,
    },
  })

  // Create Reputation History
  await prisma.reputationHistory.create({
    data: {
      userId: mentee1.id,
      userRole: Role.mentee,
      change: 10,
      reason: 'Asked first question',
    },
  })

  console.log('✅ Database seeding completed successfully!')
  console.log(`Created:`)
  console.log(`- 2 Mentors`)
  console.log(`- 2 Mentees`) 
  console.log(`- 1 Admin`)
  console.log(`- 5 Auth credentials`)
  console.log(`- 1 Mentorship request`)
  console.log(`- 1 Connection`)
  console.log(`- 1 Conversation with messages`)
  console.log(`- 1 Question with answer`)
  console.log(`- 1 Article`)
  console.log(`- 2 Communities`)
  console.log(`- 2 Badges`)
  console.log(`- Various interactions (votes, bookmarks, AI logs)`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })