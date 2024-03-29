# Chat Planet

Welcome to the Chat Planet! This application allows users to create accounts and chat with other global users anonymously. Users simply need to choose a username and password to get started. The application is built using React, Node.js, Express, and Websockets to facilitate real-time communication.

## Features
Global Chat: Once registered, users can enter chat rooms and engage in real-time conversations with other users from around the world.

Anonymous Chatting: Users can chat anonymously, as no personal information is collected during registration.

Real-time Updates: The application uses Websockets to provide seamless real-time updates and chat functionality.

Responsive Design: The user interface is built using React, ensuring a responsive and user-friendly experience across various devices.

## Installation

Follow these steps to set up the Chat Planet locally:

Clone the repository to your local machine:

```bash
Copy code
git clone https://github.com/BandaySajid/chat-planet
```
Navigate to the project directory:

```bash
cd chat-planet
```

Setup Environment

```bash
cp .env.sample .env && cp .env.local.sample frontend/.env.local && cp sample.config.js config.js  
```

Install dependencies

```bash
npm run setup
```

Start the App:

```bash
npm run dev
```
OR
```bash
docker compose up
```




Open your web browser and access the application at http://localhost:3000.
