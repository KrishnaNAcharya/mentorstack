const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Count records in each table
    const mentorCount = await prisma.mentor.count();
    const menteeCount = await prisma.mentee.count();
    const adminCount = await prisma.admin.count();
    const questionCount = await prisma.question.count();
    const articleCount = await prisma.article.count();
    const communityCount = await prisma.community.count();
    const authCount = await prisma.authCredentials.count();
    
    console.log('\n📊 Database Summary:');
    console.log(`- Mentors: ${mentorCount}`);
    console.log(`- Mentees: ${menteeCount}`);
    console.log(`- Admins: ${adminCount}`);
    console.log(`- Auth Credentials: ${authCount}`);
    console.log(`- Questions: ${questionCount}`);
    console.log(`- Articles: ${articleCount}`);
    console.log(`- Communities: ${communityCount}`);
    
    // Get a sample mentor with their data
    const sampleMentor = await prisma.mentor.findFirst({
      include: {
        articles: true,
        answers: true,
        connections: true,
        mentorshipRequests: true
      }
    });
    
    if (sampleMentor) {
      console.log('\n👨‍🏫 Sample Mentor:');
      console.log(`- Name: ${sampleMentor.name}`);
      console.log(`- Bio: ${sampleMentor.bio}`);
      console.log(`- Skills: ${sampleMentor.skills.join(', ')}`);
      console.log(`- Reputation: ${sampleMentor.reputation}`);
      console.log(`- Articles: ${sampleMentor.articles.length}`);
      console.log(`- Answers: ${sampleMentor.answers.length}`);
      console.log(`- Connections: ${sampleMentor.connections.length}`);
    }
    
    console.log('\n🎉 Database is fully functional!');
    console.log('🌐 Access Prisma Studio at: http://localhost:5555');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
