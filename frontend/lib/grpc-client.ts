import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(process.cwd(), '..', 'greeter.proto');
const SERVER_URL = process.env.GRPC_SERVER_URL || 'grpc-server:50051';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const greeterProto = grpc.loadPackageDefinition(packageDefinition).greeter as any;

let client: any = null;

export function getGrpcClient() {
  if (!client) {
    client = new greeterProto.Greeter(
      SERVER_URL,
      grpc.credentials.createInsecure()
    );
  }
  return client;
}

export function promisifyGrpcCall(method: any, request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    method.call(getGrpcClient(), request, (error: any, response: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
