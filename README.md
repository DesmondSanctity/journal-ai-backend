## Journal AI Backend
A powerful backend service for an AI-powered journaling application built with Hono.js and Cloudflare Workers.

## Features
- Real-time audio transcription using AssemblyAI
- Sentiment analysis and topic extraction
- Audio storage with Cloudinary
- KV-based journal entry management
- Analytics dashboard with insights
- JWT-based authentication
- Tech Stack
- Hono.js - Fast, lightweight web framework
- Cloudflare Workers - Edge computing platform
- AssemblyAI - Speech-to-text and NLP
- Cloudinary - Media management
- Cloudflare KV - Key-value storage


## Getting Started
- Clone the repository
- Install dependencies:
```bash
npm install
```
- Create .dev.vars file with environment variables:
```bash
ASSEMBLY_AI_KEY=your_key
JWT_SECRET=your_secret
```
- Run development server:
```bash
npx wrangler dev
```
- Deploy to Cloudflare:
```bash
npx wrangler deploy
```

## API Endpoints

Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - User registration

Journal Entries
- GET /api/journal - Get all entries
- DELETE /api/journal/:id - Delete entry

Transcription
- POST /api/transcription - Process audio recording

Analytics
- GET /api/analytics - Get journal insights

## Architecture
The application uses a serverless architecture with:

- Durable Objects for WebSocket connections
- KV for data persistence
- Workers for edge computing

## Contributing
- Fork the repository
- Create your feature branch
- Commit your changes
- Push to the branch
- Create a Pull Request

## License
MIT License