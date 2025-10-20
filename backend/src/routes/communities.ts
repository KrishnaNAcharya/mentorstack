import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Role } from '@prisma/client';

const router = express.Router();

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
    email: string;
  };
}

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get community categories based on real-time skills
router.get('/categories', async (req: any, res: any) => {
  try {
    // Get all communities with their skills
    const communities = await prisma.community.findMany({
      include: {
        members: true,
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    });

    // Aggregate all skills from communities and their members
    const skillCounts: Record<string, { count: number; communities: string[] }> = {};

    for (const community of communities) {
      const allSkills: string[] = [...community.skills];
      
      // Get skills from all members
      for (const member of community.members) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: member.userId },
            select: { skills: true }
          });
          if (user?.skills) {
            allSkills.push(...user.skills);
          }
        } catch (error) {
          console.error(`Error fetching skills for member ${member.userId}:`, error);
        }
      }

      // Count each skill
      const uniqueSkills = [...new Set(allSkills)];
      for (const skill of uniqueSkills) {
        if (!skillCounts[skill]) {
          skillCounts[skill] = { count: 0, communities: [] };
        }
        skillCounts[skill].count += 1;
        skillCounts[skill].communities.push(community.name);
      }
    }

    // Convert to array and sort by count
    const categories = Object.entries(skillCounts)
      .map(([skill, data]) => ({
        name: skill,
        count: data.count,
        communities: data.communities.slice(0, 3) // Show up to 3 example communities
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 categories

    res.json(categories);
  } catch (error) {
    console.error('Error fetching community categories:', error);
    res.status(500).json({ error: 'Failed to fetch community categories' });
  }
});

// Get all communities with real-time skills from members
router.get('/', async (req: any, res: any) => {
  try {
    const communities = await prisma.community.findMany({
      include: {
        members: {
          include: {
            // Include member details to get their skills
            ...(req.query.includeSkills === 'true' && {
              // We'll need to fetch member skills based on their role
            })
          }
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // For each community, aggregate skills from all members
    const communitiesWithRealTimeSkills = await Promise.all(
      communities.map(async (community) => {
        const memberSkills: string[] = [];
        
        // Get skills from all members
        for (const member of community.members) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: member.userId },
              select: { skills: true }
            });
            if (user?.skills) {
              memberSkills.push(...user.skills);
            }
          } catch (error) {
            console.error(`Error fetching skills for member ${member.userId}:`, error);
          }
        }

        // Combine community's original skills with member skills
        const allSkills = [...new Set([...community.skills, ...memberSkills])];
        
        return {
          ...community,
          skills: allSkills,
          memberSkills: memberSkills // Keep track of member-contributed skills
        };
      })
    );

    res.json(communitiesWithRealTimeSkills);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// Get community by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const community = await prisma.community.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: true,
        posts: {
          include: {
            votes: true,
            _count: {
              select: {
                votes: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      }
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// Check if user is a member of a community
router.get('/:id/membership', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const member = await prisma.communityMember.findFirst({
      where: {
        communityId: parseInt(id),
        userId: userId,
        userRole: role as any
      }
    });

    res.json({ isMember: !!member });
  } catch (error) {
    console.error('Error checking membership:', error);
    res.status(500).json({ error: 'Failed to check membership' });
  }
});

// Create a new community
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, description, skills } = req.body;
    const { userId, role } = req.user;

    if (!name) {
      return res.status(400).json({ error: 'Community name is required' });
    }

    // Check if community name already exists
    const existingCommunity = await prisma.community.findUnique({
      where: { name }
    });

    if (existingCommunity) {
      return res.status(400).json({ error: 'Community name already exists' });
    }

    const community = await prisma.community.create({
      data: {
        name,
        description: description || '',
        skills: skills || [],
        createdBy: userId
      }
    });

    // Add creator as first member
    await prisma.communityMember.create({
      data: {
        communityId: community.id,
        userRole: role as any,
        userId: userId
      }
    });

    res.status(201).json(community);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

// Join a community
router.post('/:id/join', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    // Check if community exists
    const community = await prisma.community.findUnique({
      where: { id: parseInt(id) }
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is already a member
    const existingMember = await prisma.communityMember.findFirst({
      where: {
        communityId: parseInt(id),
        userId: userId,
        userRole: role as any
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this community' });
    }

    const member = await prisma.communityMember.create({
      data: {
        communityId: parseInt(id),
        userRole: role as any,
        userId: userId
      }
    });

    res.status(201).json({ message: 'Successfully joined community', member });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// Leave a community
router.delete('/:id/leave', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const member = await prisma.communityMember.findFirst({
      where: {
        communityId: parseInt(id),
        userId: userId,
        userRole: role as any
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Not a member of this community' });
    }

    await prisma.communityMember.delete({
      where: {
        id: member.id
      }
    });

    res.json({ message: 'Successfully left community' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

// Create a post in a community
router.post('/:id/posts', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrls } = req.body;
    const { userId, role } = req.user;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check if user is a member of the community
    const member = await prisma.communityMember.findFirst({
      where: {
        communityId: parseInt(id),
        userId: userId,
        userRole: role as any
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Must be a member to post in this community' });
    }

    const post = await prisma.communityPost.create({
      data: {
        communityId: parseInt(id),
        authorId: userId,
        authorRole: role as Role,
        title,
        content,
        imageUrls: imageUrls || []
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get posts in a community
router.get('/:id/posts', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user is authenticated (optional for viewing posts)
    let currentUserId = null;
    let currentUserRole = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        currentUserId = decoded.userId;
        currentUserRole = decoded.role;
      } catch (err) {
        // Token invalid, but still allow viewing posts
      }
    }

    const posts = await prisma.communityPost.findMany({
      where: { communityId: parseInt(id) },
      include: {
        votes: true,
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    // Fetch user details for each post
    const postsWithUserDetails = await Promise.all(
      posts.map(async (post) => {
        let userName = `User${post.authorId}`;
        
        try {
          const user = await prisma.user.findUnique({
            where: { id: post.authorId },
            select: { name: true }
          });
          if (user) userName = user.name;
        } catch (error) {
          console.error('Error fetching user details:', error);
        }

        return {
          ...post,
          userName
        };
      })
    );

    // Add user vote status to each post
    const postsWithUserVotes = postsWithUserDetails.map(post => {
      let userVote = null;
      if (currentUserId) {
        const userVoteRecord = post.votes.find(vote => 
          vote.userId === currentUserId
        );
        userVote = userVoteRecord ? userVoteRecord.voteType : null;
      }

      return {
        ...post,
        userVote
      };
    });

    res.json(postsWithUserVotes);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Vote on a community post
router.post('/:communityId/posts/:postId/vote', authenticateToken, async (req: any, res: any) => {
  try {
    const { communityId, postId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const { userId, role } = req.user;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Vote type must be upvote or downvote' });
    }

    // Check if user is a member
    const member = await prisma.communityMember.findFirst({
      where: {
        communityId: parseInt(communityId),
        userId: userId,
        userRole: role as any
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Must be a member to vote' });
    }

    // Check if user already voted
    const existingVote = await prisma.communityPostVote.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: parseInt(postId)
        }
      }
    });

    if (existingVote) {
      // If user clicks the same vote type, remove the vote
      if (existingVote.voteType === voteType) {
        await prisma.communityPostVote.delete({
          where: { id: existingVote.id }
        });
        res.json({ message: 'Vote removed successfully' });
      } else {
        // Update existing vote to new type
        await prisma.communityPostVote.update({
          where: { id: existingVote.id },
          data: { voteType: voteType as any }
        });
        res.json({ message: 'Vote updated successfully' });
      }
    } else {
      // Create new vote
      await prisma.communityPostVote.create({
        data: {
          userId: userId,
          postId: parseInt(postId),
          voteType: voteType as any
        }
      });
      res.json({ message: 'Vote recorded successfully' });
    }
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ error: 'Failed to vote on post' });
  }
});

// Search communities
router.get('/search/:query', async (req: any, res: any) => {
  try {
    const { query } = req.params;

    const communities = await prisma.community.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { skills: { hasSome: [query] } }
        ]
      },
      include: {
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(communities);
  } catch (error) {
    console.error('Error searching communities:', error);
    res.status(500).json({ error: 'Failed to search communities' });
  }
});

export { router as communitiesRouter };