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
    rl.question('What is your name? ', (ans: string) => {
      user_name = ans.trim();
      console.log('Your name is', ans);
      rl.close();
      greetUser();
    });
  }

  function greetUser() {
    client.sayHello({ name: user_name }, (err: any, response: any) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      console.log(`Response: ${response.message}`);
      startChatInterface();
    });
  }

  function startChatInterface() {
    const chatRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n=== Chat started ===');
    console.log('Commands:');
    console.log('   - Enter message -> will be sent & saved');
    console.log('   - "clear mine" -> deletes your messages');
    console.log('   - "show all" -> shows all messages');
    console.log('   - "exit" -> exits the chat\n');

    function promptChat() {
      chatRl.question(`[${user_name}]: `, (input: string) => {
        const message = input.trim();

        if (message === 'exit') {
          console.log('Chat ended.');
          chatRl.close();
          return;
        }

        // "clear mine" keyword
        if (message === 'clear mine') {
          client.clearMyMessages({ user: user_name }, (err: any, response: any) => {
            if (err) {
              console.error('Error deleting:', err);
            } else {
              console.log(`${response.message}`);
            }
            promptChat();
          });
          return;
        }

        // "show all" to show all messages sent
        if (message === 'show all') {
          client.getAllMessages({}, (err: any, response: any) => {
            if (err) {
              console.error('Error fetching:', err);
            } else {
              console.log('\n=== All Messages ===');
              if (response.messages.length === 0) {
                console.log('   No messages available.');
              } else {
                response.messages.forEach((msg: any, idx: number) => {
                  console.log(`   ${idx + 1}. [${msg.user}]: ${msg.message}`);
                });
              }
              console.log('==========================\n');
            }
            promptChat();
          });
          return;
        }

        // send standard messages
        if (message.length > 0) {
          client.sendChat({ user: user_name, message }, (err: any, response: any) => {
            if (err) {
              console.error('Error sending:', err);
            } else {
              console.log(`${response.message}`);
            }
            promptChat();
          });
        } else {
          promptChat();
        }
      });
    }

    promptChat();
  }

  askName();
}

main();