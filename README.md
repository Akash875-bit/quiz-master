# Quiz Master

A full-stack quiz application built with Flask, Vue.js, and SQLite.

## Features

- User Authentication (Admin/User roles)
- Quiz Management System
- Real-time Quiz Taking
- Score Tracking
- CSV Export
- Email Notifications
- Daily Reminders
- Monthly Reports

## Prerequisites

- Python 3.11+
- Node.js 16+
- Redis

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv311
source venv311/bin/activate  # On Windows: venv311\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
```

5. Initialize the database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
python seed_data.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
Create a `.env` file in the frontend directory with:
```
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Redis

1. Start Redis server:
```bash
redis-server
```

### Start Backend Services

1. Start Flask server:
```bash
cd backend
source venv311/bin/activate
flask run --host=127.0.0.1 --port=5000
```

2. Start Celery worker (in a new terminal):
```bash
cd backend
source venv311/bin/activate
celery -A celery_app.celery worker --loglevel=info
```

3. Start Celery beat scheduler (in a new terminal):
```bash
cd backend
source venv311/bin/activate
celery -A celery_app.celery beat --loglevel=info
```

### Start Frontend

1. Start the development server:
```bash
cd frontend
npm run dev
```

## Accessing the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Redis: localhost:6379

## Default Admin Account

- Email: admin@quizmaster.com
- Password: admin123

## Project Structure

```
quiz_master/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── config.py           # Configuration settings
│   ├── models.py           # Database models
│   ├── routes.py           # API routes
│   ├── tasks.py            # Celery tasks
│   ├── celery_app.py       # Celery configuration
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/     # Vue components
    │   ├── views/          # Page components
    │   ├── store/          # Vuex store
    │   ├── router/         # Vue router
    │   └── services/       # API services
    ├── package.json        # Node.js dependencies
    └── vite.config.js      # Vite configuration
```

## Features in Detail

### Admin Features
- User Management
- Subject/Chapter Management
- Quiz Creation and Management
- Question Management
- Reports Generation

### User Features
- Quiz Taking
- Score Tracking
- Progress Monitoring
- CSV Export
- Profile Management

### Automated Tasks
- Daily Quiz Reminders
- Monthly Activity Reports
- CSV Export Processing

## Troubleshooting

1. If Redis connection fails:
   - Ensure Redis server is running
   - Check Redis connection settings in config.py

2. If database errors occur:
   - Run `flask db init` to initialize migrations
   - Run `flask db migrate` to create migration
   - Run `flask db upgrade` to apply migrations
   - Check database file permissions

3. If frontend can't connect to backend:
   - Verify backend is running on port 5000
   - Check CORS settings in backend/app.py
   - Verify API URL in frontend/.env

4. If npm install fails:
   - Try using `npm install --legacy-peer-deps`
   - Clear npm cache with `npm cache clean --force`
   - Delete node_modules and package-lock.json and try again

   