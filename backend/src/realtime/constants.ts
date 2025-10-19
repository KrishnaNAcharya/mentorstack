export const EXCHANGES = {
  direct: 'direct-exchange',
  discussions: 'discussions-exchange', // Topic exchange for community discussions
} as const;

export const ROUTING_KEYS = {
  community: (communityId: number | string) => `community.${communityId}`,
} as const;

export const WS_PATHS = {
  discussions: '/ws/discussions',
} as const;

export const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
