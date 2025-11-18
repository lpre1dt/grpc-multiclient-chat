import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as readline from 'readline';

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

function main() {
  const client = new greeterProto.Greeter(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
let user_name = "";
function askName() {
rl.question('What is your name? ', ans => {
    user_name = ans;
  console.log('Your name is', ans);
  rl.close();
});
}
askName();
setTimeout(() => {
    rl.close();
    greetUser();
}, 10000);

function greetUser() {  


  client.sayHello({ name: user_name }, (err: any, response: any) => {
    if (err) {
      console.error('Fehler:', err);
      return;
    }
    console.log(`Antwort: ${response.message}`);
  });
}
}
main();