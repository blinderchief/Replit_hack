# 🌸 EchoBloom - AI-Powered Empathy Garden for Mental Wellness

![EchoBloom](https://img.shields.io/badge/Mental%20Wellness-AI%20Garden-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-blue)
![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-purple)

**Tagline:** *"Plant your echoes, watch your wellness bloom—safely, privately, profoundly."*

Transform your mental wellness journey into a living, breathing garden. Plant your emotions, nurture them with AI, and watch your resilience bloom through innovative therapeutic features.

## ✨ Core Features

### � **Echo Planting System**
- **Multimodal Input**: Text or voice-based emotional journaling
- **AI Empathy Responses**: Gemini-powered compassionate feedback
- **3D Garden Visualization**: Watch your wellness grow with animated plants
- **Mood Tracking**: Visual mood scores and emotion tagging
- **Growth Stages**: Plants evolve as you engage with your emotions

### 🎭 **Advanced Therapeutic Features**

#### 🔥 **Gestalt Greenhouse - Emotion Alchemy Lab**
Explore complex emotional states through creative fusion:
- **Emotion Token Palette**: 16+ pre-defined emotions (Joy, Sadness, Anger, Fear, etc.)
- **Drag-and-Drop Fusion**: Combine two emotions to create new complex states
- **AI-Generated Fusions**: Unique names, metaphors, and therapeutic insights
- **Visual Alchemy**: Interactive particle effects and color-coded emotions
- **Personalized Suggestions**: AI recommends emotion pairings based on your recent echoes
- **Therapeutic Insights**: Understand what complex emotions teach you about yourself

*Example Fusions:*
- Anger + Curiosity = "Fiery Inquiry"
- Sadness + Gratitude = "Bittersweet Abundance"
- Fear + Excitement = "Electric Anticipation"

#### ✨ **Foresight Florals - Future Self Simulations**
Visualize potential outcomes of wellness choices:
- **What-If Scenarios**: Explore future garden states based on actions
- **Multiple Timelines**: See 7, 14, and 30-day projections
- **AI Predictions**: Gemini analyzes your patterns to forecast outcomes
- **Scenario Comparisons**: Compare positive vs. negative behavior paths
- **Actionable Insights**: Get specific first steps to reach desired outcomes
- **Visual Forecasts**: See how your garden could bloom or wither

*Example Scenarios:*
- "I start journaling every morning"
- "I practice gratitude daily"
- "I stop all wellness activities"

#### 🌅 **Dawn Weaves - Predictive Mood Alerts**
Proactive support for challenging days ahead:
- **Pattern Recognition**: AI analyzes historical mood data by day of week
- **Advance Warnings**: Get alerts for potentially difficult days
- **Shield Stories**: Narrative therapy fables for emotional armor
- **Weekly Forecasts**: See your emotional weather for the week
- **Personalized Tales**: Stories crafted from your unique patterns
- **Coping Strategies**: Actionable steps embedded in metaphorical narratives

#### � **Garden Whisperer - Proactive Intervention**
Gentle AI nudges when patterns suggest support is needed:
- **Mood Pattern Detection**: Identifies declining trends or stagnation
- **Empathetic Check-ins**: Personalized support messages
- **Wellness Basket**: Mood-boosting food recommendations with science
- **Activity Suggestions**: Tailored breathing, grounding, or journaling prompts
- **Non-intrusive**: Only appears when genuinely needed

#### 📖 **Whisper Weave - AI-Coauthored Tales**
Transform weekly experiences into therapeutic stories:
- **Weekly Aggregation**: Combines 7 days of echoes into narrative
- **Fable Format**: Story with character, moral, and reflection
- **Garden Metaphors**: Uses botanical imagery for healing
- **Audio Playback**: Text-to-speech with voice selection
- **Page-Turn Animation**: Beautiful storybook presentation
- **Reflection Prompts**: Questions to deepen self-awareness

#### 🎵 **Sensory Symphonies - Adaptive Soundscapes**
AI-generated ambient music matched to your mood:
- **Mood-Responsive**: Music adapts to your current emotional state
- **Multiple Genres**: Nature sounds, ambient, lo-fi, meditative
- **AI Generation**: Gemini suggests soundscapes for your needs
- **Interactive Controls**: Play, pause, volume, playlist navigation
- **Therapeutic Audio**: Scientifically-backed sound healing

#### 💝 **Affirmation Weavings - Poetic Affirmations**
Personalized poetry generated from your journey:
- **Recent Echo Analysis**: AI reads your last 10 emotional entries
- **Poetic Format**: Beautiful stanzas with thematic structure
- **Animated Reveal**: Line-by-line animation with effects
- **Regenerate Options**: Create multiple versions until it resonates
- **Save to Vault**: Store your favorite affirmations (coming soon)

### 🏃 **Wellness Activities**
Interactive exercises for mental health:
- **🫁 Breathing Exercises**: Box breathing, 4-7-8, resonant breathing
- **📔 Journaling**: Guided prompts and free-form writing
- **🙏 Gratitude Practice**: Daily gratitude logging
- **🌍 Grounding Techniques**: 5-4-3-2-1 sensory grounding

### 📊 **Progress & Analytics**
Comprehensive wellness tracking:
- **Mood Trends**: Visual charts of emotional patterns
- **Streak Tracking**: Current and longest engagement streaks
- **Wellness Score**: Composite metric of overall health
- **Achievement Badges**: Gamified progress milestones
- **Activity Stats**: Track breathing, journaling, gratitude counts
- **Export Data**: Download your complete journey

### 🎨 **Beautiful UI/UX**
- **Liquid Sanctuary Design**: Glass morphism with fluid animations
- **Earthy Color Palette**: Moss greens (#A8D5BA), sunset oranges, petal pinks
- **Custom Scrollbars**: Themed with moss-green styling
- **Responsive Design**: Mobile-first, works on all devices
- **Framer Motion**: Smooth transitions and micro-interactions
- **Dark Mode Native**: Comfortable for extended use

### 🔒 **Privacy & Security**
- **Clerk Authentication**: Enterprise-grade OAuth and email auth
- **Secure API Routes**: JWT tokens and middleware protection
- **CORS Protection**: Configured for frontend-backend security
- **No Data Selling**: Your mental health data stays private
- **Anonymous Sharing**: Community features without identity exposure

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.12+
- **PostgreSQL** or SQLite for development
- **Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/blinderchief/EchoBloom.git
cd EchoBloom
```

### 2. Setup Clerk Authentication

1. Go to [Clerk.dev](https://clerk.dev) and create an account
2. Create a new application
3. Get your API keys from the dashboard
4. In the frontend folder, create `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies with pip or uv
pip install -r requirements.txt
# or
uv sync

# Create .env file
GEMINI_API_KEY=your_gemini_key_here
DATABASE_URL=sqlite+aiosqlite:///echobloom.db
SECRET_KEY=your_jwt_secret_key_here

# Start the backend server
python -m uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 5. Access the Application

1. Open `http://localhost:3000` in your browser
2. Click "Start Your Garden"
3. Sign up with email or OAuth (Google/GitHub)
4. Complete the onboarding quiz
5. Start planting echoes and exploring features!

## 🎯 Recent Updates

### UI/UX Improvements (Latest)
- ✅ Fixed horizontal scrollbars in all modals
- ✅ Added custom themed scrollbars (moss-green)
- ✅ Improved overflow handling in popups
- ✅ Better button positioning (close/help icons)
- ✅ Enhanced color consistency across components
- ✅ Optimized modal heights for better viewing

### API Architecture Updates
- ✅ Fixed all 404 routing errors
- ✅ Implemented Next.js API proxy for seamless backend communication
- ✅ Corrected router prefixes for all endpoints
- ✅ Added async/await fixes in database queries
- ✅ Enhanced CORS configuration
- ✅ Created centralized API utility (`lib/api.ts`)

### New Features Added
- ✅ Gestalt Greenhouse (Emotion Alchemy)
- ✅ Foresight Florals (Future Simulations)
- ✅ Dawn Weaves (Predictive Alerts)
- ✅ Garden Whisperer (Proactive Support)
- ✅ Whisper Weave (Weekly Tales)
- ✅ Sensory Symphonies (Soundscapes)
- ✅ Affirmation Weavings (Poetry)

## 📦 Project Structure

```
echobloom/
├── frontend/                 # Next.js 15.5 App
│   ├── app/                 # App Router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── layout.tsx       # Root layout with Clerk
│   │   ├── onboard/         # Authentication & quiz
│   │   ├── garden/          # Main dashboard
│   │   ├── activities/      # Wellness exercises
│   │   │   ├── breathing/   # Breathing exercises
│   │   │   ├── journal/     # Journaling
│   │   │   ├── gratitude/   # Gratitude practice
│   │   │   └── grounding/   # Grounding techniques
│   │   ├── seeds/           # Community marketplace
│   │   ├── insights/        # Analytics dashboard
│   │   └── profile/         # User profile
│   ├── components/
│   │   └── ui/
│   │       ├── atoms/       # Basic components
│   │       │   ├── Button.tsx
│   │       │   ├── Logo.tsx
│   │       │   └── FloatingOrb.tsx
│   │       ├── molecules/   # Composite components
│   │       │   ├── GlassCard.tsx
│   │       │   ├── InputBubble.tsx
│   │       │   └── EmpathyResponse.tsx
│   │       └── organisms/   # Complex features
│   │           ├── AdvancedGarden.tsx      # 3D visualization
│   │           ├── GestaltGreenhouse.tsx   # Emotion alchemy
│   │           ├── ForesightFlorals.tsx    # Future sims
│   │           ├── DawnWeaves.tsx          # Predictive alerts
│   │           ├── GardenWhisperer.tsx     # Proactive support
│   │           ├── WhisperWeave.tsx        # Weekly tales
│   │           ├── SensorySymphonies.tsx   # Soundscapes
│   │           └── AffirmationWeavings.tsx # Poetry
│   ├── lib/
│   │   ├── api.ts           # API utility functions
│   │   └── hooks/           # Custom React hooks
│   ├── middleware.ts        # Clerk auth middleware
│   ├── next.config.js       # Next.js config + API proxy
│   ├── tailwind.config.js   # Custom theme
│   └── globals.css          # Global styles + custom scrollbars
│
├── backend/                 # FastAPI App
│   ├── app/
│   │   ├── core/           # Config & database
│   │   │   ├── config.py   # Settings
│   │   │   └── database.py # SQLAlchemy setup
│   │   ├── models/         # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── user_profile.py
│   │   │   ├── echo.py
│   │   │   ├── activity.py
│   │   │   └── seed.py
│   │   ├── routers/        # API endpoints
│   │   │   ├── auth.py              # Authentication
│   │   │   ├── echo.py              # Echo generation
│   │   │   ├── activities.py        # Wellness exercises
│   │   │   ├── alchemy.py           # Emotion fusion
│   │   │   ├── simulate.py          # Future scenarios
│   │   │   ├── patterns.py          # Mood predictions
│   │   │   ├── whisperer.py         # Proactive checks
│   │   │   ├── weave.py             # Tale generation
│   │   │   ├── soundscape.py        # Music generation
│   │   │   └── analytics.py         # Statistics
│   │   └── main.py         # FastAPI entry + CORS
│   └── pyproject.toml      # Python dependencies
│
└── docker-compose.yml       # Container orchestration
```

## 🎯 Key Technologies

### Frontend
- **Next.js 15.5**: React framework with App Router and Server Components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with custom theme
- **Framer Motion**: Smooth animations and transitions
- **React Three Fiber**: 3D garden visualization
- **Clerk**: Authentication & user management
- **Lucide React**: Beautiful, consistent icons
- **Web Speech API**: Voice input support

### Backend
- **FastAPI**: High-performance async Python API
- **SQLAlchemy**: Async ORM for database operations
- **Google Gemini 2.0**: AI for empathy, fusion, tales, and predictions
- **PostgreSQL/SQLite**: Relational database
- **Pydantic**: Data validation and settings
- **Python 3.12+**: Modern Python features

### Infrastructure
- **Docker**: Containerization for easy deployment
- **CORS Middleware**: Secure cross-origin requests
- **JWT Tokens**: Secure authentication
- **Async/Await**: Non-blocking I/O throughout

## 🌈 Usage Guide

### 1. **Sign Up / Sign In**
- Visit `http://localhost:3000`
- Click "Start Your Garden"
- Sign up with email or OAuth (Google/GitHub)
- Complete the onboarding ritual preference quiz

### 2. **Plant Your First Echo**
- Click the 🌱 "Plant New Echo" floating button
- Type your thoughts or click the microphone for voice input
- Receive an AI-generated empathetic response
- Watch a new plant sprout in your 3D garden!
- View mood score and emotion tags

### 3. **Explore Advanced Features**

#### 🔥 Emotion Alchemy
- Click the flame icon (bottom right)
- Drag two emotions into the fusion zone
- See AI-generated complex emotional states
- Get therapeutic insights and metaphors

#### ✨ Future Simulations
- Click the sparkle crystal icon (bottom left)
- Enter a "what-if" scenario (e.g., "I meditate daily")
- See 7, 14, and 30-day garden projections
- Compare different behavioral paths

#### 🌅 Dawn Weaves
- Click the sunrise icon (left side)
- View predicted challenging days for the week
- Read personalized shield stories
- Get coping strategies embedded in fables

#### 🌸 Garden Whisperer
- Appears automatically when patterns suggest support needed
- Receive gentle check-ins
- Get personalized wellness basket (mood-boosting foods)
- Follow suggested activities

#### 📖 Weekly Tales
- Click the book icon after 5+ echoes planted
- Generate AI-woven fable from your week
- Read with animated page turns
- Listen with text-to-speech playback

#### 🎵 Soundscapes
- Click the music note icon
- Choose or generate mood-matched playlists
- Play ambient, lo-fi, or nature sounds
- Adjust volume and switch tracks

#### 💝 Affirmations
- Click the heart icon (right side)
- Generate personalized poetry from recent echoes
- Watch line-by-line animated reveal
- Regenerate until it resonates

### 4. **Wellness Activities**
Navigate to Activities section:
- **Breathing**: Guided exercises with visual timers
- **Journaling**: Prompted or free-form entries
- **Gratitude**: Daily gratitude logging
- **Grounding**: 5-4-3-2-1 sensory technique

### 5. **Track Progress**
- View insights dashboard
- See mood trends over time
- Check wellness score and streaks
- Celebrate achievements
- Export your data anytime

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/echobloom
QDRANT_URL=http://localhost:6333
GEMINI_API_KEY=your_gemini_api_key
ENCRYPTION_KEY=your_32_char_encryption_key
SECRET_KEY=your_jwt_secret_key
```

## 🎨 Customization

### Changing Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  moss: '#A8D5BA',      // Primary green (used in buttons, accents)
  sunset: '#F4A261',    // Accent orange (warnings, highlights)
  navy: '#2A3D45',      // Dark background
  'navy-light': '#374B55', // Lighter dark shade
  petal: '#FFB6D9',     // Highlight pink
  sky: '#7FB3D5',       // Blue accent
}
```

### Customizing AI Prompts
Edit prompts in backend routers:
- `alchemy.py` - Emotion fusion prompts
- `simulate.py` - Future scenario prompts
- `patterns.py` - Predictive alert prompts
- `weave.py` - Tale generation prompts
- `whisperer.py` - Intervention prompts

### Adding Custom Emotions
Edit `backend/app/routers/alchemy.py`:
```python
EMOTION_PALETTE = [
    {"name": "Your Emotion", "color": "gradient-colors", "description": "..."},
    # Add more emotions
]
```

### Modifying Garden Visualization
Edit `frontend/components/ui/organisms/AdvancedGarden.tsx`:
- Change particle colors and counts
- Modify plant shapes and animations
- Add new visual effects
- Customize growth stages

### Creating New Wellness Activities
1. Add model in `backend/app/models/activity.py`
2. Add router in `backend/app/routers/activities.py`
3. Create page in `frontend/app/activities/your-activity/`
4. Add link in garden dashboard

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/preferences/{user_id}` - Get user preferences
- `POST /api/auth/preferences` - Save user preferences

### Echoes & Garden
- `POST /api/echo` - Generate AI empathy response & plant echo
- `POST /api/sessions` - Save echo session
- `GET /api/sessions/{user_id}` - Get user sessions
- `GET /api/echoes/{user_id}` - Get user's planted echoes
- `GET /api/profile/{user_id}` - Get user profile with stats

### Wellness Activities
- `POST /api/activities/breathing` - Save breathing session
- `POST /api/activities/journal` - Save journal entry
- `POST /api/activities/gratitude` - Save gratitude entry
- `POST /api/activities/grounding` - Save grounding session
- `GET /api/activities/stats/{user_id}` - Get activity statistics
- `GET /api/activities/{type}/{user_id}` - Get specific activity history

### Advanced Features
- `POST /api/alchemy/fuse` - Fuse two emotions
- `GET /api/alchemy/emotion-palette` - Get emotion tokens
- `GET /api/alchemy/suggested-pairs/{user_id}` - Get suggested emotion pairs
- `POST /api/simulate/run` - Run future scenario simulation
- `GET /api/simulate/suggested-scenarios/{user_id}` - Get what-if suggestions
- `GET /api/patterns/dawn-drawer/{user_id}` - Get weekly mood predictions
- `POST /api/whisperer/check-patterns` - Check if intervention needed
- `GET /api/whisperer/wellness-basket/{user_id}` - Get mood-boosting foods
- `POST /api/weave/create-tale` - Generate weekly narrative tale
- `GET /api/weave/preview-data/{user_id}` - Check tale readiness
- `POST /api/weave/affirmation` - Generate personalized poetry
- `POST /api/soundscape/generate` - Generate mood-matched music
- `GET /api/soundscape/current-mood/{user_id}` - Get current mood for music

### Analytics
- `GET /api/analytics/{user_id}` - Get comprehensive analytics
- `GET /api/analytics/mood-trends/{user_id}` - Get mood trends over time

## 🧪 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Changes auto-refresh with Fast Refresh
- **Backend**: Use `--reload` flag to restart on code changes

### Testing Features Without Gemini
If you don't have a Gemini API key yet:
- Echo responses will use fallback empathy messages
- Some features (fusion, tales, simulations) may show placeholder content
- Core functionality (authentication, saving echoes) still works

### Debugging API Calls
- Backend logs show all API requests and SQL queries
- Frontend uses centralized `apiFetch()` from `lib/api.ts`
- Check browser Network tab for request/response details
- Backend runs on `http://localhost:8000`
- Frontend proxies `/api/*` to backend via Next.js rewrites

### Customizing the Garden
Edit `frontend/components/ui/organisms/AdvancedGarden.tsx`:
- Change plant colors, sizes, and growth rates
- Modify 3D shapes and animations
- Add new plant types based on emotion tags

### Adding New Therapeutic Features
1. Create new router in `backend/app/routers/`
2. Add route to `backend/app/main.py`
3. Create component in `frontend/components/ui/organisms/`
4. Add floating button/trigger in `garden/page.tsx`
5. Use Gemini API for AI-powered insights

### Clearing Webpack Cache
If you encounter build errors:
```bash
cd frontend
Remove-Item -Recurse -Force .next,node_modules\.cache
npm run dev
```

### Custom Scrollbar Styling
All modals use custom scrollbars. To modify:
- Edit `frontend/app/globals.css`
- Change `.custom-scrollbar` class
- Adjust colors, width, hover effects

## 🚢 Deployment

### Frontend (Vercel - Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**Environment Variables on Vercel:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_URL` (your backend URL)

### Backend (Render/Railway/Fly.io)

**Using Render:**
1. Connect your GitHub repo
2. Select `backend` as root directory
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in dashboard

**Environment Variables:**
- `GEMINI_API_KEY`
- `DATABASE_URL` (PostgreSQL connection string)
- `SECRET_KEY`
- `ALLOWED_ORIGINS` (comma-separated frontend URLs)

### Database (PostgreSQL)
- Use Render, Supabase, or Railway PostgreSQL
- Update `DATABASE_URL` in backend `.env`
- Run migrations if needed

### Docker Deployment
```bash
# Build and run
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 🔧 Troubleshooting

### Common Issues

**404 Errors on API Calls:**
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify Next.js rewrites in `next.config.js`

**Clerk Authentication Not Working:**
- Check Clerk keys are correctly set
- Ensure Clerk middleware is in `middleware.ts`
- Add your localhost URLs to Clerk dashboard

**Gemini API Errors:**
- Verify API key is valid
- Check API quota/rate limits
- Fallback responses will be used if key is missing

**Database Connection Issues:**
- Check `DATABASE_URL` format
- Ensure database is running
- Try SQLite for development: `sqlite+aiosqlite:///echobloom.db`

**White Scrollbar Issues:**
- Cleared in latest version with custom scrollbars
- Check `globals.css` has custom scrollbar styles
- Verify components use `custom-scrollbar` class

**Webpack Cache Errors:**
```bash
cd frontend
Remove-Item -Recurse -Force .next,node_modules\.cache
npm run dev
```

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Contribution Ideas
- 🎨 New therapeutic features
- 🐛 Bug fixes and improvements
- 📚 Documentation updates
- 🌍 Internationalization (i18n)
- ♿ Accessibility improvements
- 🎭 New emotion tokens for alchemy
- 🎵 Additional soundscape genres
- 📖 More tale templates

### Code Style
- **Frontend**: Follow Prettier config, use TypeScript
- **Backend**: Follow PEP 8, use type hints
- **Components**: Atomic design (atoms → molecules → organisms)
- **Commits**: Clear, descriptive messages

## 📝 License

MIT License - feel free to use for your own projects!

## 🙏 Acknowledgments

- **Design Inspiration**: Deepen, Soula Care, Ash, Headspace
- **AI Partner**: Google Gemini 2.0 Flash
- **Authentication**: Clerk
- **3D Graphics**: Three.js / React Three Fiber
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Framework**: Next.js 15 & FastAPI
- **Therapeutic Concepts**: Gestalt psychology, narrative therapy, CBT principles

## 🌟 Roadmap

### Coming Soon
- [ ] Weave Vault (save tales & affirmations)
- [ ] Community Seed Marketplace
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Voice journal entries
- [ ] Garden sharing with friends
- [ ] Weekly email summaries
- [ ] Integration with wearables
- [ ] Therapist dashboard (professional tier)
- [ ] Group gardens for support circles

### Future Features
- [ ] VR garden experience
- [ ] AI-powered mood predictions (ML models)
- [ ] Personalized meditation tracks
- [ ] Crisis intervention hotline integration
- [ ] Insurance integration for therapy sessions
- [ ] Research partnership program

## 📧 Support & Community

### Get Help
- 📖 **Documentation**: You're reading it!
- 🐛 **Bug Reports**: [Open a GitHub Issue](https://github.com/blinderchief/EchoBloom/issues)
- 💡 **Feature Requests**: Use GitHub Discussions
- 📧 **Email**: support@echobloom.app (coming soon)

### Join the Community
- 💬 **Discord**: Bloom Grove community (coming soon)
- 🐦 **Twitter**: [@EchoBloomApp](https://twitter.com/echobloomapp) (coming soon)
- � **Instagram**: [@echobloom.wellness](https://instagram.com/echobloom.wellness) (coming soon)

## ⚠️ Disclaimer

**EchoBloom is a wellness tool, not a replacement for professional mental health care.**

- This app is designed to support mental wellness, not diagnose or treat conditions
- If you're experiencing a mental health crisis, please contact:
  - **USA**: 988 Suicide & Crisis Lifeline
  - **International**: [Find your local crisis line](https://findahelpline.com/)
- Always consult with licensed mental health professionals for serious concerns
- Your privacy is paramount - we never share your data with third parties

---

## 🌸 Made with 💚 for Mental Wellness

**EchoBloom** isn't just an app; it's a movement toward empathetic, AI-powered mental health support. We believe technology should nurture, not drain—inspire, not overwhelm.

### Why EchoBloom?
- 🌱 **Nature-Inspired**: Healing through botanical metaphors
- 🤖 **AI-Augmented**: Intelligence that empowers, not replaces
- 🔒 **Privacy-First**: Your garden, your data, your control
- 🎨 **Beautifully Crafted**: Wellness should feel wonderful
- 💝 **Community-Driven**: Built with feedback from real users

### Our Vision
To make mental wellness accessible, engaging, and effective through the perfect blend of AI empathy, therapeutic principles, and delightful design. Every feature is crafted to help you:
- Understand your emotions better
- Build healthy coping mechanisms  
- Track genuine progress
- Feel supported in your journey

**Thank you for choosing to grow with EchoBloom.** 🌸

---

*"In the garden of the mind, every echo can bloom into wisdom."*

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Active Development 🚀
