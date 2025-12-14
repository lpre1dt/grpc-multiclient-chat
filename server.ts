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

const blockedUsers: string[] = [];

function sayHello(call: any, callback: any) {
  console.log(`Empfangen: ${call.request.name}`);
  callback(null, { message: `Hallo ${call.request.name}!` });
}

function sendChat(call: any, callback: any) {
  const user = call.request.user;
  const message = call.request.message;
  
  if (blockedUsers.includes(user)) {
    const responseMsg = `Nachricht von ${user} konnte nicht ausgegeben werden, da der Benutzer blockiert ist.`;
    console.log(responseMsg);
    callback(null, { message: responseMsg });
    return;
  }
  
  console.log(`Nachricht von ${user} empfangen: ${message}`);
  callback(null, { message: `Nachricht von ${user} empfangen: ${message}` });
}

function blockUser(call: any, callback: any) {
  const username = call.request.username;
  
  if (blockedUsers.includes(username)) {
    callback(null, { 
      message: `${username} ist bereits blockiert.`, 
      success: false 
    });
    return;
  }
  
  blockedUsers.push(username);
  const responseMsg = `${username} wurde erfolgreich blockiert.`;
  console.log(responseMsg);
  callback(null, { 
    message: responseMsg, 
    success: true 
  });
}
function main() {
  const server = new grpc.Server();
  server.addService(greeterProto.Greeter.service, { sayHello, sendChat, blockUser });
  
  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Fehler beim Starten:', err);
        return;
      }
      console.log(`Server läuft auf Port ${port}...`);
    }
  );
}

main();