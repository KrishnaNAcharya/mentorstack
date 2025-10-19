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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRabbitChannel = getRabbitChannel;
exports.closeRabbit = closeRabbit;
exports.publish = publish;
exports.createEphemeralConsumer = createEphemeralConsumer;
const amqp = __importStar(require("amqplib"));
const constants_1 = require("./constants");
// Using loose typings here due to variations between amqplib and @types/amqplib across versions
let connection = null;
let channel = null;
function getRabbitChannel() {
    return __awaiter(this, void 0, void 0, function* () {
        if (channel)
            return channel;
        connection = yield amqp.connect(constants_1.RABBITMQ_URL);
        const ch = yield connection.createChannel();
        // Ensure exchanges exist
        yield ch.assertExchange(constants_1.EXCHANGES.direct, 'direct', { durable: true });
        yield ch.assertExchange(constants_1.EXCHANGES.discussions, 'topic', { durable: true });
        channel = ch;
        return ch;
    });
}
function closeRabbit() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (channel === null || channel === void 0 ? void 0 : channel.close());
            if (connection && typeof connection.close === 'function') {
                yield connection.close();
            }
        }
        catch (_a) { }
        channel = null;
        connection = null;
    });
}
function publish(_a) {
    return __awaiter(this, arguments, void 0, function* ({ exchange, routingKey, message }) {
        const ch = yield getRabbitChannel();
        const payload = Buffer.from(JSON.stringify(message));
        ch.publish(exchange, routingKey, payload, { contentType: 'application/json', persistent: false });
    });
}
function createEphemeralConsumer(bindingKey, onMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const ch = yield getRabbitChannel();
        const q = yield ch.assertQueue('', { exclusive: true, durable: false, autoDelete: true });
        yield ch.bindQueue(q.queue, constants_1.EXCHANGES.discussions, bindingKey);
        const consumerTag = (yield ch.consume(q.queue, (msg) => {
            if (!msg)
                return;
            try {
                const content = JSON.parse(msg.content.toString());
                onMessage(content);
            }
            catch (e) {
                console.error('Failed to parse message', e);
            }
            finally {
                ch.ack(msg);
            }
        })).consumerTag;
        return {
            queue: q.queue,
            consumerTag,
            cancel: () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield ch.cancel(consumerTag);
                }
                catch (_a) { }
                try {
                    yield ch.unbindQueue(q.queue, constants_1.EXCHANGES.discussions, bindingKey);
                }
                catch (_b) { }
                try {
                    yield ch.deleteQueue(q.queue);
                }
                catch (_c) { }
            })
        };
    });
}
