# Keywords & Commands

## Sending Chat Messages
Simply type your message and press Enter. The message will be sent to the server and stored there.

Example:
```
Enter message: Hello everyone!
```

---

## show all
Displays all stored messages from the server.

Example:
```
Enter message: show all
```

Output:
```
=== All Messages ===
   1. [Daniel]: Hello everyone!
   2. [Daniel]: How are you?
==========================
```

---

## clear mine
Deletes all your own messages from the server. Messages from other users remain intact.

Example:
```
Enter message: clear mine
```

Output:
```
2 message(s) from Daniel deleted (Deleted: 2)
```

---

## block <username>
Blocks a user. Blocked users can no longer send messages (their messages will be rejected by the server).

Example:
```
Enter message: block Bob
```

Output:
```
Response: Bob has been successfully blocked.
```

---

## exit
Exits the chat client.

Example:
```
Enter message: exit
```

Output:
```
Chat ended.
```

---

## Tips

- Keywords must be entered **exactly** as shown (case-sensitive)
- Use `show all` before `clear mine` to see what will be deleted
- Blocked users cannot be unblocked (only by server restart)
