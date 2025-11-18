# gRPC Example Project

A simple gRPC example demonstrating client-server communication with both Go and TypeScript implementations.

## Overview

This project implements a gRPC service with two RPC methods:
- `SayHello`: A simple greeting service
- `SendChat`: A chat message service

The server is implemented in TypeScript (Node.js) and the client in Go, showcasing cross-language gRPC communication.

## Project Structure

```
grpc-example/
├── greeter.proto          # Protocol Buffer definition
├── server.ts              # TypeScript gRPC server
├── client.go              # Go gRPC client
├── proto/                 # Generated Go protobuf files
│   ├── greeter.pb.go
│   └── greeter_grpc.pb.go
├── package.json           # Node.js dependencies
└── go.mod                 # Go dependencies
```

## Prerequisites

- **Go** (1.16 or higher)
- **Node.js** (14 or higher)
- **Protocol Buffers Compiler** (`protoc`)
- **protoc-gen-go** and **protoc-gen-go-grpc** plugins

### Installing Protocol Buffer Tools

```bash
# Install protoc plugins for Go
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Make sure Go bin is in your PATH
export PATH="$PATH:$(go env GOPATH)/bin"
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grpc-example
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Go dependencies**
   ```bash
   go mod download
   ```

## Protocol Buffer Definition

The service is defined in `greeter.proto`:

```protobuf
service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
  rpc SendChat (ChatRequest) returns (Recived) {}
}
```

### Regenerating Protocol Buffers

If you modify `greeter.proto`, regenerate the Go files:

```bash
protoc --go_out=proto --go_opt=paths=source_relative \
       --go-grpc_out=proto --go-grpc_opt=paths=source_relative \
       greeter.proto
```

For TypeScript, the proto loader handles this at runtime.

## Usage

### Starting the Server

The server runs on port `50051`:

```bash
npm run server
```

You should see:
```
Server läuft auf Port 50051...
```

### Running the Client

In a separate terminal, run the Go client:

```bash
go run client.go
```

The client will prompt you to enter:
1. A username
2. A message

Example session:
```
Client gestartet
Name eingeben: John
Bitte Nachricht eingeben: Hello World
Name: John, Nachricht: Hello World
Antwort: Nachricht von John empfangen: Hello World
```

## API Methods

### SayHello

Simple greeting service that returns a personalized hello message.

**Request:** `HelloRequest`
- `name` (string): Name to greet

**Response:** `HelloReply`
- `message` (string): Greeting message

### SendChat

Chat message service that processes user messages.

**Request:** `ChatRequest`
- `user` (string): Username
- `message` (string): Chat message

**Response:** `Recived`
- `message` (string): Confirmation message

## Technologies Used

- **gRPC**: High-performance RPC framework
- **Protocol Buffers**: Efficient serialization format
- **Go**: Client implementation
- **TypeScript/Node.js**: Server implementation
- **@grpc/grpc-js**: gRPC implementation for Node.js
- **@grpc/proto-loader**: Dynamic proto loading for Node.js

## Development

### Server (TypeScript)

The server implementation is in `server.ts`. It uses:
- `@grpc/grpc-js` for gRPC functionality
- `@grpc/proto-loader` to load proto definitions dynamically

### Client (Go)

The client implementation is in `client.go`. It uses:
- Standard Go gRPC libraries
- Generated protocol buffer code from `proto/` directory

## Troubleshooting

### Port Already in Use

If you get an "address already in use" error:

```bash
lsof -ti:50051 | xargs kill -9
```

### Connection Refused

Make sure the server is running before starting the client.

### Protocol Buffer Generation Issues

Ensure `protoc-gen-go` and `protoc-gen-go-grpc` are in your PATH:

```bash
which protoc-gen-go
which protoc-gen-go-grpc
```

## License

MIT
