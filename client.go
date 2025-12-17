package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"
	"time"

	pb "grpc-example/proto"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	fmt.Printf("Client started\n")
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Enter name: ")
	nameInput, err := reader.ReadString('\n')
	if err != nil {
		log.Fatalf("Error reading input: %v", err)
	}
	nameInput = nameInput[:len(nameInput)-1] // Remove newline

	fmt.Println("\n=== Chat started ===")
	fmt.Println("Commands:")
	fmt.Println("   - Enter message -> will be sent & saved")
	fmt.Println("   - \"clear mine\" -> deletes your messages")
	fmt.Println("   - \"show all\" -> shows all messages")
	fmt.Println("   - \"block <name>\" -> blocks a user")
	fmt.Println("   - \"exit\" -> exits the chat")

	for {
		fmt.Print("Enter message: ")
		messageInput, err := reader.ReadString('\n')
		if err != nil {
			log.Fatalf("Error reading input: %v", err)
		}
		messageInput = messageInput[:len(messageInput)-1] // Remove newline

		// Check for "clear mine" keyword
		if messageInput == "clear mine" {
			conn, err := grpc.Dial("localhost:50051",
				grpc.WithTransportCredentials(insecure.NewCredentials()))
			if err != nil {
				log.Fatalf("Connection failed: %v", err)
			}

			c := pb.NewGreeterClient(conn)
			ctx, cancel := context.WithTimeout(context.Background(), time.Second)

			r, err := c.ClearMyMessages(ctx, &pb.ClearRequest{
				User: nameInput,
			})
			if err != nil {
				log.Fatalf("Call failed: %v", err)
			}
			log.Printf("%s (Deleted: %d)", r.GetMessage(), r.GetDeletedCount())

			cancel()
			conn.Close()
			continue
		}

		// Check for "show all" keyword
		if messageInput == "show all" {
			conn, err := grpc.Dial("localhost:50051",
				grpc.WithTransportCredentials(insecure.NewCredentials()))
			if err != nil {
				log.Fatalf("Connection failed: %v", err)
			}

			c := pb.NewGreeterClient(conn)
			ctx, cancel := context.WithTimeout(context.Background(), time.Second)

			r, err := c.GetAllMessages(ctx, &pb.Empty{})
			if err != nil {
				log.Fatalf("Call failed: %v", err)
			}

			fmt.Println("\n=== All Messages ===")
			if len(r.GetMessages()) == 0 {
				fmt.Println("   No messages available.")
			} else {
				for i, msg := range r.GetMessages() {
					fmt.Printf("   %d. [%s]: %s\n", i+1, msg.GetUser(), msg.GetMessage())
				}
			}
			fmt.Println("==========================")

			cancel()
			conn.Close()
			continue
		}

		// Check for "exit" keyword
		if messageInput == "exit" {
			fmt.Println("Chat ended.")
			os.Exit(0)
		}

		// Check if user wants to block someone
		if len(messageInput) > 6 && messageInput[:6] == "block " {
			username := messageInput[6:]

			conn, err := grpc.Dial("localhost:50051",
				grpc.WithTransportCredentials(insecure.NewCredentials()))
			if err != nil {
				log.Fatalf("Connection failed: %v", err)
			}

			c := pb.NewGreeterClient(conn)
			ctx, cancel := context.WithTimeout(context.Background(), time.Second)

			r, err := c.BlockUser(ctx, &pb.BlockRequest{
				Username: username,
			})
			if err != nil {
				log.Fatalf("Call failed: %v", err)
			}
			log.Printf("Response: %s", r.GetMessage())

			cancel()
			conn.Close()
			continue
		}

		fmt.Printf("Name: %s, Message: %s\n", nameInput, messageInput)

		conn, err := grpc.Dial("localhost:50051",
			grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			log.Fatalf("Connection failed: %v", err)
		}

		c := pb.NewGreeterClient(conn)

		ctx, cancel := context.WithTimeout(context.Background(), time.Second)

		r, err := c.SendChat(ctx, &pb.ChatRequest{
			User:    nameInput,
			Message: messageInput,
		})
		if err != nil {
			log.Fatalf("Call failed: %v", err)
		}
		log.Printf("Response: %s", r.GetMessage())

		cancel()
		conn.Close()
	}
}
