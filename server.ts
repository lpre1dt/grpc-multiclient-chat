import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  callback(null, { message: `Hello ${call.request.name}!` });
}

function sendChat(call: any, callback: any) {
  const user = call.request.user;
  const message = call.request.message;
  
  if (blockedUsers.includes(user)) {
    const responseMsg = `Message from ${user} could not be displayed because the user is blocked.`;
    console.log(responseMsg);
    callback(null, { message: responseMsg });
    return;
  }
  
  // messages saved in array
  chatMessages.push({ user, message });
  
  console.log(`Message from ${user} received: ${message}`);
  console.log(`Total stored messages: ${chatMessages.length}`);
  
  callback(null, { message: `Message from ${user} saved: ${message}` });
}

function blockUser(call: any, callback: any) {
  const username = call.request.username;
  
  if (blockedUsers.includes(username)) {
    callback(null, { 
      message: `${username} is already blocked.`, 
      success: false 
    });
    return;
  }
  
  blockedUsers.push(username);
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
  
  console.log(`User ${user} deleted ${deletedCount} message(s)`);
  console.log(`Remaining messages: ${chatMessages.length}`);
  
  callback(null, { 
    message: `${deletedCount} message(s) from ${user} were deleted`,
    deleted_count: deletedCount
  });
}

// returns all saved messages
function getAllMessages(call: any, callback: any) {
  console.log(`All messages retrieved (${chatMessages.length} messages)`);
  callback(null, { messages: chatMessages });
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
      console.log(`Server running on port ${port}...`);
    }
  );
}

main();