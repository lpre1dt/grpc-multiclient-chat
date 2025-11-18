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

function sayHello(call: any, callback: any) {
  console.log(`Empfangen: ${call.request.name}`);
  callback(null, { message: `Hallo ${call.request.name}!` });
}
function sendChat(call: any, callback: any) {
  console.log(`Nachricht von ${call.request.user} empfangen: ${call.request.message}`);
  callback(null, { message: `Nachricht von ${call.request.user} empfangen: ${call.request.message}` });
}
function main() {
  const server = new grpc.Server();
  server.addService(greeterProto.Greeter.service, { sayHello, sendChat });
  
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