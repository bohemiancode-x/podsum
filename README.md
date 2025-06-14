# PodSum - AI-Powered Podcast Summarizer

PodSum is a modern web application that uses AI to generate concise summaries of podcast episodes. Built with Next.js, MongoDB, and Google's Gemini AI, it provides an intuitive interface for discovering podcasts and getting AI-generated summaries in various formats.

## Features

- 🔍 Search and discover podcasts using the ListenNotes API
- 🤖 Generate AI-powered summaries using Google's Gemini AI
- 📝 Multiple summary formats (paragraph, bullet points, key takeaways, executive summary)
- 💾 Save and manage your summaries in MongoDB
- 🎨 Modern, responsive UI built with Tailwind CSS
- ✅ Comprehensive test coverage with Jest and Cypress

## Prerequisites

Before you begin, ensure you have the following:

- Node.js 18.x or later
- npm or yarn
- MongoDB (either local installation or MongoDB Atlas account)
- ListenNotes API key
- Google Gemini AI API key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ListenNotes API Configuration
LISTENNOTES_API_KEY=your_listennotes_api_key_here
LISTENNOTES_API_URL=https://listen-api.listennotes.com/api/v2 
(You can use https://listen-api-test.listennotes.com/api/v2 if you dont have an api key. it returns test data)



# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Gemini AI API Configuration
API_KEY_GEMINI=your_gemini_api_key_here

# MongoDB Configuration (Choose one)
# For MongoDB Atlas:
MONGODB_URI=your_mongodb_atlas_uri_here
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/podsum
```

### Getting API Keys

1. **ListenNotes API Key**:
   - Visit [ListenNotes API](https://www.listennotes.com/api/)
   - Sign up for an account
   - Get your API key from the dashboard

2. **Google Gemini AI API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

### MongoDB Setup

You can choose to use either MongoDB Atlas (cloud) or a local MongoDB instance:

#### Option 1: MongoDB Atlas (Recommended for Production)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string from the cluster
4. Add your IP address to the IP Access List in MongoDB Atlas

#### Option 2: Local MongoDB (Development)
1. Install MongoDB Community Edition:
   ```bash
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community

   # Start MongoDB service
   brew services start mongodb-community
   ```
2. Verify installation:
   ```bash
   mongosh
   ```
3. Create a database:
   ```bash
   use podsum
   ```
4. The default connection string will be: `mongodb://localhost:27017/podsum`

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/podsum.git
   cd podsum
   ```

2. Install dependencies:
```bash
npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual API keys and configuration.

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Testing

The project includes both unit tests and end-to-end tests:

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:cov

# Run end-to-end tests
npm run e2e

# Open Cypress for E2E testing
npm run cy:open
```

## Project Structure

```
podsum/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── podcasts/      # Podcast-related endpoints
│   │   │   ├── summaries/     # Summary-related endpoints
│   │   │   └── summarize/     # AI summarization endpoint
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── podcast/           # Podcast-related components
│   │   ├── ui/                # Reusable UI components
│   │   └── ErrorBoundary.tsx  # Error handling component
│   ├── lib/                   # Utility functions
│   │   ├── mongodb.ts         # MongoDB connection
│   │   └── utils.ts           # Helper functions
│   ├── models/                # MongoDB models
│   │   └── Summary.ts         # Summary model
│   ├── store/                 # Zustand store
│   │   ├── podcastStore.ts    # Podcast state management
│   │   └── summaryStore.ts    # Summary state management
│   └── types/                 # TypeScript types
│       └── index.ts           # Type definitions
├── public/                    # Static assets
├── cypress/                   # E2E tests
│   ├── e2e/                  # End-to-end test specs
│   └── fixtures/             # Test data
├── __tests__/                # Unit tests
│   └── store/                # Store tests
├── .env.example              # Example environment variables
├── .env.local               # Local environment variables
├── jest.config.js           # Jest configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Project dependencies
└── tsconfig.json            # TypeScript configuration
```

## Technologies Used

- **Frontend**:
  - Next.js 15
  - React 19
  - Tailwind CSS
  - Zustand (State Management)
  - Radix UI (Components)

- **Backend**:
  - Next.js API Routes
  - MongoDB Atlas
  - Google Gemini AI
  - ListenNotes API

- **Testing**:
  - Jest
  - React Testing Library
  - Cypress

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ListenNotes](https://www.listennotes.com/) for podcast data
- [Google Gemini AI](https://ai.google.dev/) for AI summarization
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
