import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { createServer as createViteServer } from 'vite';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('mystudylife.db');
db.pragma('journal_mode = WAL');

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || 'mystudylife-secret-key-12345';

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    displayName TEXT,
    photoURL TEXT,
    streak INTEGER DEFAULT 1,
    lastActive TEXT DEFAULT CURRENT_TIMESTAMP,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    subject TEXT,
    deadline TEXT,
    priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    status TEXT CHECK(status IN ('To Do', 'Completed')) DEFAULT 'To Do',
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    subject TEXT NOT NULL,
    attended INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    subject TEXT NOT NULL,
    day TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    room TEXT,
    color TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    subject TEXT,
    date TEXT NOT NULL,
    time TEXT,
    room TEXT,
    type TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    subject TEXT,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

app.use(cors());
app.use(express.json());

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const { username, email, password, displayName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const info = db.prepare('INSERT INTO users (username, email, password, displayName) VALUES (?, ?, ?, ?)').run(username, email, hashedPassword, displayName);
    const userId = info.lastInsertRowid;
    const token = jwt.sign({ id: userId, email, username }, JWT_SECRET, { expiresIn: '7d' });
    
    // Fetch newly created user
    const user = db.prepare('SELECT id, username, email, displayName, streak, lastActive FROM users WHERE id = ?').get(userId);
    res.status(201).json({ token, user });
    return;
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      throw error;
    }
  }
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { identifier, password } = req.body; // Can be email or username
  const user: any = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier, identifier);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  // Update streak if needed
  const now = new Date();
  const lastActive = new Date(user.lastActive);
  const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
  
  if (diffDays === 1) {
    db.prepare('UPDATE users SET streak = streak + 1, lastActive = ? WHERE id = ?').run(now.toISOString(), user.id);
  } else if (diffDays > 1) {
    db.prepare('UPDATE users SET streak = 1, lastActive = ? WHERE id = ?').run(now.toISOString(), user.id);
  } else {
    db.prepare('UPDATE users SET lastActive = ? WHERE id = ?').run(now.toISOString(), user.id);
  }

  const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
  return;
}));

app.get('/api/auth/me', authenticateToken, asyncHandler(async (req: any, res) => {
  const user = db.prepare('SELECT id, username, email, displayName, photoURL, streak, lastActive FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(user);
  return;
}));

// --- Task Routes ---
app.get('/api/tasks', authenticateToken, (req: any, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY id DESC').all(req.user.id);
  res.json(tasks);
});

app.post('/api/tasks', authenticateToken, (req: any, res) => {
  const { title, subject, deadline, priority } = req.body;
  const info = db.prepare('INSERT INTO tasks (userId, title, subject, deadline, priority) VALUES (?, ?, ?, ?, ?)').run(req.user.id, title, subject, deadline, priority);
  res.json({ id: info.lastInsertRowid, ...req.body, status: 'To Do' });
});

app.patch('/api/tasks/:id', authenticateToken, (req: any, res) => {
  const { status, title, subject, deadline, priority } = req.body;
  // Dynamic update
  const updates = [];
  const params = [];
  if (status) { updates.push('status = ?'); params.push(status); }
  if (title) { updates.push('title = ?'); params.push(title); }
  if (subject) { updates.push('subject = ?'); params.push(subject); }
  if (deadline) { updates.push('deadline = ?'); params.push(deadline); }
  if (priority) { updates.push('priority = ?'); params.push(priority); }
  params.push(req.params.id, req.user.id);
  
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND userId = ?`).run(...params);
  res.json({ success: true });
});

app.delete('/api/tasks/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// --- Attendance Routes ---
app.get('/api/attendance', authenticateToken, (req: any, res) => {
  const rows = db.prepare('SELECT * FROM attendance WHERE userId = ?').all(req.user.id);
  res.json(rows);
});

app.post('/api/attendance', authenticateToken, (req: any, res) => {
  const { subject, attended, total } = req.body;
  const info = db.prepare('INSERT INTO attendance (userId, subject, attended, total) VALUES (?, ?, ?, ?)').run(req.user.id, subject, attended, total);
  res.json({ id: info.lastInsertRowid, ...req.body });
});

app.patch('/api/attendance/:id', authenticateToken, (req: any, res) => {
  const { attended, total } = req.body;
  db.prepare('UPDATE attendance SET attended = ?, total = ? WHERE id = ? AND userId = ?').run(attended, total, req.params.id, req.user.id);
  res.json({ success: true });
});

app.delete('/api/attendance/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM attendance WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// --- Timetable Routes ---
app.get('/api/timetable', authenticateToken, (req: any, res) => {
  const rows = db.prepare('SELECT * FROM timetable WHERE userId = ?').all(req.user.id);
  res.json(rows);
});

app.post('/api/timetable', authenticateToken, (req: any, res) => {
  const { subject, day, startTime, endTime, room, color } = req.body;
  const info = db.prepare('INSERT INTO timetable (userId, subject, day, startTime, endTime, room, color) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.user.id, subject, day, startTime, endTime, room, color);
  res.json({ id: info.lastInsertRowid, ...req.body });
});

app.delete('/api/timetable/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM timetable WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// --- Exam Routes ---
app.get('/api/exams', authenticateToken, (req: any, res) => {
  const rows = db.prepare('SELECT * FROM exams WHERE userId = ? ORDER BY date ASC').all(req.user.id);
  res.json(rows);
});

app.post('/api/exams', authenticateToken, (req: any, res) => {
  const { title, subject, date, time, room, type } = req.body;
  const info = db.prepare('INSERT INTO exams (userId, title, subject, date, time, room, type) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.user.id, title, subject, date, time, room, type);
  res.json({ id: info.lastInsertRowid, ...req.body });
});

app.delete('/api/exams/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM exams WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// --- Notes Routes ---
app.get('/api/notes', authenticateToken, (req: any, res) => {
  const rows = db.prepare('SELECT * FROM notes WHERE userId = ? ORDER BY updatedAt DESC').all(req.user.id);
  res.json(rows);
});

app.post('/api/notes', authenticateToken, (req: any, res) => {
  const { title, content, subject } = req.body;
  const info = db.prepare('INSERT INTO notes (userId, title, content, subject) VALUES (?, ?, ?, ?)').run(req.user.id, title, content, subject);
  res.json({ id: info.lastInsertRowid, ...req.body, updatedAt: new Date().toISOString() });
});

app.patch('/api/notes/:id', authenticateToken, (req: any, res) => {
  const { title, content, subject } = req.body;
  db.prepare('UPDATE notes SET title = ?, content = ?, subject = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?').run(title, content, subject, req.params.id, req.user.id);
  res.json({ success: true });
});

app.delete('/api/notes/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM notes WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// --- StudyBuddy AI Route ---
app.post('/api/ai/chat', authenticateToken, asyncHandler(async (req: any, res) => {
  const { message } = req.body;
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are "MSL StudyBuddy", a helpful AI assistant for a student productivity app. 
      The student says: "${message}". 
      Give a concise, helpful, and motivating response (max 100 words). Help them with study tips, scheduling, or academic stress. Use Markdown for formatting if helpful.`;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      res.json({ text: responseText });
      return;
    } catch (err) {
      console.error("AI Error:", err);
    }
  }

  // Fallback Predefined Responses
  const responses = [
    "You're doing great! Remember to take a 5-minute break every 25 minutes of studying (Pomodoro technique).",
    "Focus on your most difficult task first while your brain is fresh. You've got this!",
    "Stay hydrated! Water is essential for maintaining concentration during long study sessions.",
    "Revision is key. Try explaining what you just learned to an imaginary friend to solidify the knowledge.",
    "Don't worry about perfection. Just getting started is often the hardest part!",
    "Remember to get enough sleep before your exams. A rested mind performs much better than an exhausted one."
  ];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  res.json({ text: randomResponse });
}));

// --- Vite Middleware ---
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
