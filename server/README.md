# README.md

# Chat Application

This project is a chat application built with Node.js, Express, and MongoDB. It features user authentication, chat functionalities, and WebSocket support for real-time messaging.

## Features

- User registration and login with password hashing using bcrypt.
- Real-time chat functionality using WebSocket.
- Encrypted chat messages stored in the database.
- User profile management.
- Conversation management.

## Project Structure

```
server
├── controllers
│   ├── authController.js      # Handles user authentication
│   ├── chatController.js      # Manages chat functionalities
│   └── userController.js      # Manages user-related operations
├── middleware
│   ├── authMiddleware.js      # Protects routes and verifies JWT tokens
│   └── socketMiddleware.js     # Handles WebSocket connections
├── models
│   ├── User.js                # User model schema
│   ├── Message.js             # Message model schema
│   └── Conversation.js         # Conversation model schema
├── routes
│   ├── authRoutes.js          # Routes for user authentication
│   ├── chatRoutes.js          # Routes for chat functionalities
│   └── userRoutes.js          # Routes for user-related operations
├── services
│   ├── emailService.js        # Functions for sending emails
│   ├── encryptionService.js    # Functions for encrypting/decrypting messages
│   └── socketService.js        # Functions for managing WebSocket events
├── utils
│   └── cryptoUtils.js         # Utility functions for encryption
├── config
│   └── socketConfig.js        # WebSocket server configuration
├── index.js                   # Entry point of the application
├── socket.js                  # WebSocket server setup
├── package.json               # npm configuration file
├── .env                       # Environment variables
├── .gitignore                 # Files to be ignored by Git
└── README.md                  # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd server
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables:
   ```
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```

## Usage

1. Start the server:
   ```
   npm run dev
   ```

2. The server will run on `http://localhost:4000`.

3. Use a tool like Postman to test the API endpoints for user authentication and chat functionalities.

## WebSocket

The WebSocket server is set up to handle real-time messaging. Ensure that the client connects to the WebSocket server to send and receive messages.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.