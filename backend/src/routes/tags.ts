import express from 'express';
import { prisma } from '../../lib/prisma';

const router = express.Router();

// Get unified content for a specific tag/skill
router.get('/:tagName/content', async (req: any, res: any) => {
  try {
    const tagName = req.params.tagName.toLowerCase();
    const limit = parseInt(req.query.limit as string) || 10;
    
    console.log(`📍 Fetching content for tag: ${tagName}`);

    // Get articles with matching tags
    const articles = await prisma.article.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: {
                contains: tagName,
                mode: 'insensitive'
              }
            }
          }
        }
      },
      include: {
        author: {
          select: {
            name: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Get questions with matching tags
    const questions = await prisma.question.findMany({
      where: {
        OR: [
          {
            tags: {
              some: {
                tag: {
                  name: {
                    contains: tagName,
                    mode: 'insensitive'
                  }
                }
              }
            }
          },
          {
            title: {
              contains: tagName,
              mode: 'insensitive'
            }
          },
          {
            body: {
              contains: tagName,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        mentee: {
          select: {
            name: true
          }
        },
        answers: true,
        tags: {
          include: {
            tag: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Get statistics for this tag
    const tagStats = await prisma.tag.findFirst({
      where: {
        name: {
          contains: tagName,
          mode: 'insensitive'
        }
      },
      include: {
        _count: {
          select: {
            articles: true,
            questions: true
          }
        }
      }
    });

    // Format articles
    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content.substring(0, 200) + '...',
      authorName: article.author.name,
      createdAt: article.createdAt,
      tags: article.tags.map(t => t.tag.name)
    }));

    // Format questions
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      title: question.title,
      description: question.body.substring(0, 200) + '...',
      authorName: question.mentee.name,
      createdAt: question.createdAt,
      answerCount: question.answers.length,
      tags: question.tags.map(t => t.tag.name)
    }));

    // Get related tags
    const relatedTags = await prisma.tag.findMany({
      where: {
        OR: [
          {
            articles: {
              some: {
                article: {
                  tags: {
                    some: {
                      tag: {
                        name: {
                          contains: tagName,
                          mode: 'insensitive'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            questions: {
              some: {
                question: {
                  tags: {
                    some: {
                      tag: {
                        name: {
                          contains: tagName,
                          mode: 'insensitive'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ],
        NOT: {
          name: {
            contains: tagName,
            mode: 'insensitive'
          }
        }
      },
      include: {
        _count: {
          select: {
            articles: true,
            questions: true
          }
        }
      },
      take: 10
    });

    const response = {
      tagName,
      stats: {
        totalArticles: tagStats?._count?.articles || formattedArticles.length,
        totalQuestions: tagStats?._count?.questions || formattedQuestions.length,
        totalContent: (tagStats?._count?.articles || 0) + (tagStats?._count?.questions || 0)
      },
      articles: formattedArticles,
      questions: formattedQuestions,
      relatedTags: relatedTags.map(tag => ({
        name: tag.name,
        articleCount: tag._count.articles,
        questionCount: tag._count.questions,
        totalCount: tag._count.articles + tag._count.questions
      }))
    };

    console.log(`✅ Found ${formattedArticles.length} articles and ${formattedQuestions.length} questions for tag: ${tagName}`);
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching tag content:', error);
    res.status(500).json({ 
      message: 'Server error', 
      details: (error as any)?.message || 'Unknown error' 
    });
  }
});

// Get all tags with their content counts
router.get('/all', async (req: any, res: any) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            articles: true,
            questions: true
          }
        }
      },
      orderBy: [
        {
          articles: {
            _count: 'desc'
          }
        },
        {
          questions: {
            _count: 'desc'
          }
        }
      ]
    });

    const formattedTags = tags.map((tag, index) => ({
      name: tag.name,
      articleCount: tag._count.articles,
      questionCount: tag._count.questions,
      totalCount: tag._count.articles + tag._count.questions,
      color: getTagColor(index)
    }));

    res.json(formattedTags);

  } catch (error) {
    console.error('❌ Error fetching all tags:', error);
    res.status(500).json({ 
      message: 'Server error', 
      details: (error as any)?.message || 'Unknown error' 
    });
  }
});

// Helper function to assign colors to tags
function getTagColor(index: number): string {
  const colors = [
    'bg-blue-100',
    'bg-green-100', 
    'bg-purple-100',
    'bg-yellow-100',
    'bg-pink-100',
    'bg-indigo-100',
    'bg-red-100',
    'bg-gray-100',
    'bg-orange-100',
    'bg-teal-100'
  ];
  return colors[index % colors.length];
}

export { router as tagsRouter };
