# MyStudyLife - Student Productivity App

A full-stack student productivity platform built with React, Vite, Express, and Firebase.

## Features
- **Dashboard**: Overview of academic progress and daily goals.
- **Task Manager**: Organize assignments with priorities and deadlines.
- **Timetable**: Weekly schedule with PDF export.
- **Attendance Tracker**: Keep track of class presence with 75% alerts.
- **Exam Planner**: Countdown to your next big test.
- **Notes**: Rich text markdown notes for easy revision.
- **StudyBuddy AI**: Academic assistant powered by Gemini.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS 4, Motion/React, Recharts, Lucide Icons.
- **Backend**: Node.js, Express (API Proxy for Gemini).
- **Database**: Firebase Firestore (NoSQL, real-time).
- **Authentication**: Firebase Google Auth.

## Setup Instructions
1. **Firebase Configuration**:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable Firestore and Authentication (Google).
   - Place your `firebase-applet-config.json` in the root.
2. **Environment Variables**:
   - Add `GEMINI_API_KEY` to your `.env` file for the AI chatbot.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

Developed with ❤️ using Google AI Studio.
