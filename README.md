# AutoGreen.sg

A green technology project featuring a browser extension and web application to make sustainability actions effortless by marking the eco-friendly products in e-commerce platforms like shopee and then encourage users by socially awarding them thorugh sector leaderboard. This app is aimed specifically for Singapore with the kampung spirit in mind

## Project Structure

This project consists of two main components:

### 🌐 Browser Extension (`/extension`)

A Chrome/Firefox browser extension that helps users track and improve their environmental impact while browsing.

- **`manifest.json`** - Extension configuration and permissions
- **`background.js`** - Background service worker for extension functionality
- **`popup/`** - Extension popup interface
  - `popup.js` - Popup logic and interactions
  - `popup.tsx` - React-based popup component
- **`scripts/`** - Content and utility scripts
  - `content.js` - Content script for web page interaction
  - `react.production.main.js` - React runtime for extension
- **`images/`** - Extension icons and assets

### 🚀 Next.js Web Application (`/next-app`)

A modern web application built with Next.js, React, and TypeScript for sustainability tracking and community features.

#### Key Directories:

- **`src/app/`** - Next.js app router pages and layouts
  - `page.tsx` - Main landing page
  - `layout.tsx` - Root layout component
  - `api/` - API routes for backend functionality
  - `leaderboard/` - Leaderboard page for user rankings
- **`components/`** - Reusable React components
  - `Header.tsx` - Site header component
  - `Navbar.tsx` - Navigation bar component
  - `Leaderboard.tsx` - Leaderboard display component
- **`lib/`** - Utility functions and API logic
- **`db/`** - Database schema and DB related actions
- **`public/`** - Static assets (images, icons, etc.)

## Tech Stack

### Web Application

- **Framework:** Next.js 15.5.2
- **Frontend:** React 19.1.0, TypeScript
- **Styling:** Tailwind CSS
- **Development:** Turbopack for fast builds
- **Linting:** ESLint

### Browser Extension

- **Frontend:** React, TypeScript
- **Architecture:** Manifest V3 compatible

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Running the Web Application

```bash
cd next-app
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Setting up the Browser Extension

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `/extension` folder
4. The extension will be installed and ready to use

## Development

### Web App Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

This project is part of a hackathon initiative focused on environmental sustainability and green technology solutions.

## License

[Add your license here]
