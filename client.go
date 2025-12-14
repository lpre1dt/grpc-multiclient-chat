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
	fmt.Printf("Client gestartet\n")
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Name eingeben: ")
	nameInput, err := reader.ReadString('\n')
	if err != nil {
		log.Fatalf("Fehler beim Lesen der Eingabe: %v", err)
	}
	nameInput = nameInput[:len(nameInput)-1] // Remove newline
	for {
		fmt.Print("Bitte Nachricht eingeben: ")
		messageInput, err := reader.ReadString('\n')
		if err != nil {
			log.Fatalf("Fehler beim Lesen der Eingabe: %v", err)
		}
		messageInput = messageInput[:len(messageInput)-1] // Remove newline

		// Check if user wants to block someone
		if len(messageInput) > 6 && messageInput[:6] == "block " {
			username := messageInput[6:]
			
			conn, err := grpc.Dial("localhost:50051",
				grpc.WithTransportCredentials(insecure.NewCredentials()))
			if err != nil {
				log.Fatalf("Verbindung fehlgeschlagen: %v", err)
			}
			defer conn.Close()

			c := pb.NewGreeterClient(conn)
			ctx, cancel := context.WithTimeout(context.Background(), time.Second)
			defer cancel()

			r, err := c.BlockUser(ctx, &pb.BlockRequest{
				Username: username,
			})
			if err != nil {
				log.Fatalf("Aufruf fehlgeschlagen: %v", err)
			}
			log.Printf("Antwort: %s", r.GetMessage())
			continue
		}

		fmt.Printf("Name: %s, Nachricht: %s\n", nameInput, messageInput)

		conn, err := grpc.Dial("localhost:50051",
			grpc.WithTransportCredentials(insecure.NewCredentials()))
		if err != nil {
			log.Fatalf("Verbindung fehlgeschlagen: %v", err)
		}
		defer conn.Close()

		c := pb.NewGreeterClient(conn)

		ctx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()

		r, err := c.SendChat(ctx, &pb.ChatRequest{
			User:    nameInput,
			Message: messageInput,
		})
		if err != nil {
			log.Fatalf("Aufruf fehlgeschlagen: %v", err)
		}
		log.Printf("Antwort: %s", r.GetMessage())
	}
}
