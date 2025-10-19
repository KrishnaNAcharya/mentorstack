"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RABBITMQ_URL = exports.WS_PATHS = exports.ROUTING_KEYS = exports.EXCHANGES = void 0;
exports.EXCHANGES = {
    direct: 'direct-exchange',
    discussions: 'discussions-exchange', // Topic exchange for community discussions
};
exports.ROUTING_KEYS = {
    community: (communityId) => `community.${communityId}`,
};
exports.WS_PATHS = {
    discussions: '/ws/discussions',
};
exports.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
