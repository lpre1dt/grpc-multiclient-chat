import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import promClient from 'prom-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = join(__dirname, 'greeter.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const greeterProto = grpc.loadPackageDefinition(packageDefinition).greeter as any;

// ============================================
// PROMETHEUS METRICS SETUP (OSS/CNCF Tool)
// ============================================
const register = new promClient.Registry();

// Default metrics (CPU, Memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom Metrics for gRPC Chat System
const grpcRequestCounter = new promClient.Counter({
  name: 'grpc_requests_total',
  help: 'Total number of gRPC requests',
  labelNames: ['method', 'status'],
  registers: [register]
});

const chatMessageCounter = new promClient.Counter({
  name: 'chat_messages_total',
  help: 'Total number of chat messages sent',
  labelNames: ['user'],
  registers: [register]
});

const blockedUsersGauge = new promClient.Gauge({
  name: 'blocked_users_total',
  help: 'Current number of blocked users',
  registers: [register]
});

const storedMessagesGauge = new promClient.Gauge({
  name: 'stored_messages_total',
  help: 'Current number of stored messages',
  registers: [register]
});

const messageDeleteCounter = new promClient.Counter({
  name: 'messages_deleted_total',
  help: 'Total number of deleted messages',
  labelNames: ['user'],
  registers: [register]
});

// Existing block user 
const blockedUsers: string[] = [];

// In-memory message storage
interface ChatMessage {
  user: string;
  message: string;
}

const chatMessages: ChatMessage[] = [];

function sayHello(call: any, callback: any) {
  console.log(`Received: ${call.request.name}`);
  grpcRequestCounter.inc({ method: 'SayHello', status: 'success' });
  callback(null, { message: `Hello ${call.request.name}!` });
}

function sendChat(call: any, callback: any) {
  const user = call.request.user;
  const message = call.request.message;
  
  if (blockedUsers.includes(user)) {
    const responseMsg = `Message from ${user} could not be displayed because the user is blocked.`;
    console.log(responseMsg);
    grpcRequestCounter.inc({ method: 'SendChat', status: 'blocked' });
    callback(null, { message: responseMsg });
    return;
  }
  
  // messages saved in array
  chatMessages.push({ user, message });
  
  // Update Prometheus metrics
  chatMessageCounter.inc({ user });
  storedMessagesGauge.set(chatMessages.length);
  grpcRequestCounter.inc({ method: 'SendChat', status: 'success' });
  
  console.log(`Message from ${user} received: ${message}`);
  console.log(`Total stored messages: ${chatMessages.length}`);
  
  callback(null, { message: `Message from ${user} saved: ${message}` });
}

function blockUser(call: any, callback: any) {
  const username = call.request.username;
  
  if (blockedUsers.includes(username)) {
    grpcRequestCounter.inc({ method: 'BlockUser', status: 'already_blocked' });
    callback(null, { 
      message: `${username} is already blocked.`, 
      success: false 
    });
    return;
  }
  
  blockedUsers.push(username);
  blockedUsersGauge.set(blockedUsers.length);
  grpcRequestCounter.inc({ method: 'BlockUser', status: 'success' });
  
  const responseMsg = `${username} has been successfully blocked.`;
  console.log(responseMsg);
  callback(null, { 
    message: responseMsg, 
    success: true 
  });
}

// deletes all messages from a user
function clearMyMessages(call: any, callback: any) {
  const { user } = call.request;
  
  // counts messages before deleting
  const beforeCount = chatMessages.length;
  
  // filters all messages
  const remainingMessages = chatMessages.filter(msg => msg.user !== user);
  
  chatMessages.length = 0;
  chatMessages.push(...remainingMessages);
  
  const deletedCount = beforeCount - chatMessages.length;
  
  // Update Prometheus metrics
  messageDeleteCounter.inc({ user }, deletedCount);
  storedMessagesGauge.set(chatMessages.length);
  grpcRequestCounter.inc({ method: 'ClearMyMessages', status: 'success' });
  
  console.log(`User ${user} deleted ${deletedCount} message(s)`);
  console.log(`Remaining messages: ${chatMessages.length}`);
  
  callback(null, { 
    message: `${deletedCount} message(s) from ${user} were deleted`,
    deleted_count: deletedCount
  });
}

// returns all saved messages
function getAllMessages(call: any, callback: any) {
  grpcRequestCounter.inc({ method: 'GetAllMessages', status: 'success' });
  console.log(`All messages retrieved (${chatMessages.length} messages)`);
  callback(null, { messages: chatMessages });
}

// ============================================
// PROMETHEUS HTTP METRICS ENDPOINT
// ============================================
function startMetricsServer() {
  const app = express();
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'grpc-chat-server',
      timestamp: new Date().toISOString(),
      metrics: {
        totalMessages: chatMessages.length,
        blockedUsers: blockedUsers.length
      }
    });
  });
  
  // Prometheus metrics endpoint
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
  
  const METRICS_PORT = 9090;
  app.listen(METRICS_PORT, () => {
    console.log(`📊 Metrics server running on http://0.0.0.0:${METRICS_PORT}/metrics`);
    console.log(`💚 Health check available at http://0.0.0.0:${METRICS_PORT}/health`);
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(greeterProto.Greeter.service, { 
    sayHello, 
    sendChat, 
    blockUser,
    clearMyMessages,
    getAllMessages 
  });
  
  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Error starting server:', err);
        return;
      }
      console.log(`🚀 gRPC server running on port ${port}...`);
      
      // Start Prometheus metrics server
      startMetricsServer();
    }
  );
}

main();