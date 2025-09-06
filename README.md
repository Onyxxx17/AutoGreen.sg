# 🌱 AutoGreen.sg

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black.svg)](https://nextjs.org/)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-orange.svg)](https://developer.chrome.com/docs/extensions/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

> **Greener by default.** High-impact, low-effort sustainability for Singapore's e-commerce ecosystem.

AutoGreen.sg is a comprehensive sustainability platform designed to support Singapore's Green Plan 2030 initiatives. It combines an intelligent Chrome extension with a modern web application to promote sustainable living through automated eco-product detection and green checkout optimization.

🌐 **Live Application:** [https://autogreen-sg.vercel.app/](https://autogreen-sg.vercel.app/)
## 🎯 Mission

Built for Singapore's Green Plan 2030 pillars:
- **🌱 Sustainable Living** - Making eco-friendly choices effortless
- **⚡ Energy Reset** - Promoting energy-efficient products
- **🏙️ City in Nature** - Supporting green urban living
- **💚 Green Economy** - Driving sustainable commerce

## 🏗️ Project Structure

```
AutoGreen.sg/
├── extension/          # Chrome Extension for product scanning
├── next-app/          # Next.js web application
├── README.md          # README documentation
└── request.rest       # REST API testing file
```

## 🔧 Core Components

### 1. 🛍️ Chrome Extension
**Intelligent Product Scanner for E-commerce Platforms**

- **Smart Detection**: Automatically identifies eco-friendly products on Lazada and FoodPanda
- **Deep Scanning**: Comprehensive analysis with iframe-based extraction
- **Visual Indicators**: Green borders and eco badges for sustainable products
- **Performance Optimized**: Modular architecture with efficient batch processing
- **Real-time Monitoring**: Live statistics and health monitoring

**Supported Platforms:**
- Lazada Singapore (`lazada.sg`, `lazada.com.sg`)
- FoodPanda Singapore (`foodpanda.sg`, `foodpanda.com.sg`)

### 2. 🌐 Next.js Web Application
**Modern Sustainability Dashboard**

- **React 19** with **Next.js 15.5.2**
- **TypeScript** for type safety
- **Tailwind CSS v4** for modern styling
- **Neon Database** integration for data persistence
- **Responsive Design** optimized for all devices

**Key Features:**
- Interactive leaderboards and statistics
- Environmental impact tracking
- User engagement analytics
- FAQ and educational content
- Modern UI with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Chrome Browser
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Onyxxx17/AutoGreen.sg.git
cd AutoGreen.sg
```

### 2. Setup Chrome Extension
```bash
cd extension
```

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` folder
4. The AutoGreen icon should appear in your toolbar

### 3. Setup Next.js Application
```bash
cd next-app
npm install
```

Create a `.env.local` file:
```env
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Available Scripts

### Next.js Application
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5.x** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework

### Backend & Database
- **Neon Database** - Serverless PostgreSQL
- **Next.js API Routes** - Backend API endpoints

### Browser Extension
- **Manifest V3** - Latest Chrome extension format
- **Vanilla JavaScript** - Lightweight and fast
- **Chrome APIs** - Storage, activeTab, downloads

### Development Tools
- **ESLint** - Code linting
- **Turbopack** - Fast bundler for development
- **PostCSS** - CSS processing

## 🌟 Key Features

### Chrome Extension
- ✅ **Smart Product Detection** with scroll-based optimization
- ✅ **Eco-Friendly Recognition** using multi-tier keyword system
- ✅ **Deep Page Analysis** with iframe extraction
- ✅ **Robust Error Handling** with fallback mechanisms
- ✅ **Performance Monitoring** with built-in metrics
- ✅ **Data Storage** with automatic backup and recovery

### Web Application
- ✅ **Interactive Dashboard** with real-time statistics
- ✅ **Leaderboard System** for user engagement
- ✅ **Environmental Gallery** showcasing green initiatives
- ✅ **FAQ Section** for user education
- ✅ **Responsive Design** for all screen sizes
- ✅ **Modern Animations** with reveal effects

## 📊 Database Schema

The application uses Neon PostgreSQL with the following key tables:
- `users` - User profiles and statistics
- `leaderboard` - Ranking and scoring system
- `product_scans` - Extension scanning data
- `eco_products` - Sustainable product database

## 🔗 API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/[id]/stats` - Get user statistics

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard data

## 🤝 Contributing

We welcome contributions to AutoGreen.sg! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Ensure mobile responsiveness
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌏 Impact & Goals

AutoGreen.sg contributes to Singapore's sustainability goals by:

- **Reducing Decision Fatigue** - Automatically highlighting eco-friendly options
- **Promoting Awareness** - Educating users about sustainable products
- **Tracking Progress** - Measuring collective environmental impact
- **Building Community** - Connecting eco-conscious consumers



## 🙏 Acknowledgments

- Singapore Green Plan 2030 for inspiration
- Contributors who make this project possible

---

**Made with 💚 for a sustainable Singapore**

*"High-impact, low-effort sustainability for everyone"*
