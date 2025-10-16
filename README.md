# Garak Security Testing Frontend

A modern Next.js frontend for the Garak Security Testing API, built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- 🛡️ **REST Configuration Management** - Create, view, edit, and delete API Projects
- 🔍 **Security Testing** - Run comprehensive security tests against LLM endpoints
- 📊 **Test Results** - View detailed test results and reports
- 🎨 **Modern UI** - Beautiful, responsive interface built with shadcn/ui
- 🔐 **Authentication Ready** - Prepared for JWT-based authentication
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Garak API backend running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── Projects/           # REST config management
│   │   ├── new/                 # Create new configuration
│   │   └── page.tsx             # List Projects
│   ├── tests/                   # Security testing
│   │   ├── new/                 # Start new test
│   │   └── page.tsx             # List tests
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Dashboard
├── components/
│   └── ui/                      # shadcn/ui components
└── lib/
    └── utils.ts                 # Utility functions
```

## API Integration

The frontend integrates with the following Garak API endpoints:

### REST Projects
- `GET /rest-configs/` - List Projects
- `POST /rest-configs/` - Create configuration
- `GET /rest-configs/{id}` - Get configuration
- `PATCH /rest-configs/{id}` - Update configuration
- `DELETE /rest-configs/{id}` - Delete configuration

### Security Testing
- `POST /run-garak` - Start security test
- `GET /job/{job_id}/status` - Get test status
- `GET /job/{job_id}/results` - Get test results
- `GET /jobs/active` - List active tests
- `DELETE /job/{job_id}` - Cancel test

### System
- `GET /` - Health check
- `GET /debug/system-status` - System status

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### API Base URL

The frontend is configured to connect to the Garak API at `http://localhost:8000`. Update the fetch URLs in the components if your API runs on a different port.

## Features Overview

### 🏠 Dashboard
- System overview with quick stats
- Quick actions for common tasks
- Recent activity feed
- System health status

### ⚙️ Configuration Management
- Create REST API Projects
- Support for different authentication methods:
  - No authentication
  - Bearer tokens
  - API keys
  - Custom headers
- JSON request template editor
- Response field configuration
- Configuration testing

### 🔍 Security Testing
- Select from multiple security probes:
  - Content Safety (Profanity, Toxicity)
  - Prompt Injection attacks
  - Jailbreaking attempts
  - Encoding attacks
- Configurable test parameters
- Real-time test monitoring
- Test result visualization

### 📊 Test Results
- Detailed test reports
- Success/failure statistics
- Individual probe results
- Test history and management

## Development

### Adding New Components

```bash
npx shadcn@latest add [component-name]
```

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

### Building for Production

```bash
npm run build
npm start
```

## Deployment

The frontend can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **Docker**
- **Static hosting** (with `next export`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Garak Security Testing suite.
