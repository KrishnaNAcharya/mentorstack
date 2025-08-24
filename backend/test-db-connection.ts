// Simple test to check database connectivity
import { prisma } from './lib/prisma';

async function testDatabaseConnection() {
    try {
        console.log('Testing database connection...');
        
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        
        // Test reading from a table
        const authCount = await prisma.authCredentials.count();
        console.log(`📊 Current auth records: ${authCount}`);
        
        const mentorCount = await prisma.mentor.count();
        console.log(`👨‍🏫 Current mentors: ${mentorCount}`);
        
        const menteeCount = await prisma.mentee.count();
        console.log(`👨‍🎓 Current mentees: ${menteeCount}`);
        
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabaseConnection();
