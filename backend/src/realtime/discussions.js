"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.setupDiscussionsWebSocket = setupDiscussionsWebSocket;
const ws_1 = __importStar(require("ws"));
const url_1 = __importDefault(require("url"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const constants_1 = require("./constants");
const rabbit_1 = require("./rabbit");
// Helper to authenticate via query token or header (Sec-WebSocket-Protocol not used here)
function authenticateFromQuery(reqUrl) {
    if (!reqUrl)
        return null;
    const parsed = url_1.default.parse(reqUrl, true);
    const token = parsed.query.token || '';
    if (!token)
        return null;
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        return payload; // { userId, role, email }
    }
    catch (_a) {
        return null;
    }
}
function setupDiscussionsWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server, path: constants_1.WS_PATHS.discussions });
    wss.on('connection', (ws, req) => __awaiter(this, void 0, void 0, function* () {
        try {
            const parsed = url_1.default.parse(req.url || '', true);
            const communityId = Number(parsed.query.communityId);
            const auth = authenticateFromQuery(req.url);
            if (!auth || !communityId || Number.isNaN(communityId)) {
                ws.close(1008, 'Unauthorized or invalid community');
                return;
            }
            // Verify membership
            const isMember = yield prisma_1.prisma.communityMember.findFirst({
                where: { communityId, userId: auth.userId, userRole: auth.role },
            });
            if (!isMember) {
                ws.close(1008, 'Not a member of this community');
                return;
            }
            // Create ephemeral RabbitMQ consumer bound to topic community.<id>
            const bindingKey = constants_1.ROUTING_KEYS.community(communityId);
            const consumer = yield (0, rabbit_1.createEphemeralConsumer)(bindingKey, (msg) => {
                if (ws.readyState === ws_1.default.OPEN) {
                    ws.send(JSON.stringify(msg));
                }
            });
            ws.on('message', (raw) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const text = raw.toString();
                    const payload = JSON.parse(text);
                    const content = String((payload === null || payload === void 0 ? void 0 : payload.content) || '').slice(0, 4000);
                    if (!content)
                        return;
                    const enriched = {
                        type: 'community.message',
                        communityId,
                        content,
                        senderId: auth.userId,
                        senderRole: auth.role,
                        timestamp: new Date().toISOString(),
                    };
                    yield (0, rabbit_1.publish)({
                        exchange: constants_1.EXCHANGES.discussions,
                        routingKey: bindingKey,
                        message: enriched,
                    });
                }
                catch (e) {
                    console.error('Failed to process incoming message', e);
                }
            }));
            ws.on('close', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield consumer.cancel();
                }
                catch (_a) { }
            }));
            // Acknowledge connection
            if (ws.readyState === ws_1.default.OPEN) {
                ws.send(JSON.stringify({ type: 'system', message: 'joined', communityId }));
            }
        }
        catch (err) {
            console.error('WS connection error', err);
            try {
                ws.close(1011, 'Internal error');
            }
            catch (_a) { }
        }
    }));
    console.log(`🧩 Discussions WebSocket ready at ${constants_1.WS_PATHS.discussions}`);
}
