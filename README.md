# Intellicruit - AI-Powered Hiring Platform

Revolutionize your hiring process with AI-powered recruitment solutions that streamline talent acquisition and help companies find the best candidates faster.

## 🚀 Features

### For HR Professionals
- **AI-Powered Resume Screening**: Automated resume parsing and candidate scoring
- **Intelligent Job Posting**: Create comprehensive job descriptions with built-in aptitude tests
- **Smart Candidate Matching**: Advanced algorithms to match candidates with job requirements
- **Interview Scheduling**: Automated communication and interview coordination
- **Application Management**: Comprehensive dashboard for tracking all applications

### For Candidates
- **Job Insights & Analytics**: Detailed market analysis and career recommendations
- **Skill Assessment**: Interactive aptitude tests and technical evaluations
- **Resume Optimization**: AI-powered feedback and improvement suggestions
- **Career Guidance**: Personalized job and course recommendations
- **Application Tracking**: Real-time status updates on job applications

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Data visualization components
- **Clerk** - Authentication and user management
- **Axios** - HTTP client for API requests

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM application framework
- **FAISS** - Vector similarity search
- **LLAMA** - Large language model integration
- **MongoDB** - NoSQL database with Mongoose ODM
- **Sentence Transformers** - Text embedding models

### AI/ML Components
- **Resume Parsing**: Text extraction from PDF/images using OCR
- **Skill Matching**: Cosine similarity with TF-IDF vectorization
- **Job Recommendations**: ML-based career guidance system
- **Scoring Algorithms**: Multi-factor candidate evaluation

## 📁 Project Structure

```
intellicruit/
├── website/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── models/         # MongoDB schemas
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── python-backend/         # FastAPI backend
│   ├── models/             # AI agent implementations
│   ├── utils/              # Helper utilities
│   └── Data/               # Training data and datasets
└── docs/                   # Documentation files
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- MongoDB database
- Clerk account for authentication

### Frontend Setup

```bash
cd website
npm install
cp .env.example .env.local
npm run dev
```

### Backend Setup

```bash
cd python-backend
pip install -r requirements.txt
cp .env.example .env
python main.py
```

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_FASTAPI_URI=http://localhost:8000
MONGODB_URI=
```

#### Backend (.env)
```env
MISTRAL_API_KEY=
CLERK_SECRET_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
```

## 🔧 Core Components

### Resume Agent
Intelligent resume parsing and analysis system that extracts skills, experience, and qualifications to generate comprehensive candidate profiles.

### Scoring Agent
Multi-dimensional evaluation system that scores candidates based on technical skills, experience, certifications, projects, and soft skills.

### Scheduler Communication Agent
Automated communication system for interview scheduling and candidate engagement with personalized messaging.

### Job Insights Engine
Advanced analytics platform providing market trends, salary insights, and career growth predictions.

## 🎯 User Roles

### HR Professional
- Create and manage job postings
- Build custom aptitude tests
- Review and score applications
- Schedule interviews
- Generate hiring reports

### Candidate
- Browse job opportunities
- Take skill assessments
- Submit applications
- Track application status
- Access career insights

## 🔒 Security Features

- Multi-factor authentication via Clerk
- Role-based access control
- Secure file upload handling
- Data encryption and privacy protection
- CORS and security middleware

## 📊 Analytics & Insights

- Real-time job market analysis
- Salary benchmarking by role and location
- Skills demand forecasting
- Industry growth trends
- Personalized career recommendations

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Production)
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: intellicruitorg@gmail.com
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

## 🏆 Acknowledgments

Built with modern web technologies and AI frameworks to create an innovative hiring solution that benefits both employers and job seekers.
