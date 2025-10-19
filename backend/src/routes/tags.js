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
exports.tagsRouter = void 0;
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../../lib/prisma");
const router = express_1.default.Router();
exports.tagsRouter = router;
// Get unified content for a specific tag/skill
router.get('/:tagName/content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const tagName = req.params.tagName.toLowerCase();
        const limit = parseInt(req.query.limit) || 10;
        console.log(`📍 Fetching content for tag: ${tagName}`);
        // Get articles with matching tags
        const articles = yield prisma_1.prisma.article.findMany({
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
        const questions = yield prisma_1.prisma.question.findMany({
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
        const tagStats = yield prisma_1.prisma.tag.findFirst({
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
        const relatedTags = yield prisma_1.prisma.tag.findMany({
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
                totalArticles: ((_a = tagStats === null || tagStats === void 0 ? void 0 : tagStats._count) === null || _a === void 0 ? void 0 : _a.articles) || formattedArticles.length,
                totalQuestions: ((_b = tagStats === null || tagStats === void 0 ? void 0 : tagStats._count) === null || _b === void 0 ? void 0 : _b.questions) || formattedQuestions.length,
                totalContent: (((_c = tagStats === null || tagStats === void 0 ? void 0 : tagStats._count) === null || _c === void 0 ? void 0 : _c.articles) || 0) + (((_d = tagStats === null || tagStats === void 0 ? void 0 : tagStats._count) === null || _d === void 0 ? void 0 : _d.questions) || 0)
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
    }
    catch (error) {
        console.error('❌ Error fetching tag content:', error);
        res.status(500).json({
            message: 'Server error',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
}));
// Get all tags with their content counts
router.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = yield prisma_1.prisma.tag.findMany({
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
    }
    catch (error) {
        console.error('❌ Error fetching all tags:', error);
        res.status(500).json({
            message: 'Server error',
            details: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
}));
// Helper function to assign colors to tags
function getTagColor(index) {
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
