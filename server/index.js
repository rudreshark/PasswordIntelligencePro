import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import xss from 'express-xss-sanitizer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------
// SECURITY FIRST! - OWASP Top 10 + Protection
// --------------------------

// 1. Helmet for secure headers (OWASP A05: Security Misconfiguration)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Keep for React dev, tighten in prod
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'", "https://api.ipify.org", "https://api.my-ip.com", process.env.VITE_SUPABASE_URL || ""]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' }
}));

// 2. CORS configuration - restrict to your domain in production
const allowedOrigins = [
  'http://localhost:8080',
  'https://rudreshark.github.io'
];
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 3. XSS Sanitizer (OWASP A03: Injection)
app.use(xss());

// 4. Brute-force & Rate Limiting (OWASP A07: Identification & Auth Failures)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes!',
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind a proxy (like Vercel/Netlify)
    return req.headers['x-forwarded-for'] || req.ip || 'unknown';
  }
});
app.use('/api/', apiLimiter);

// 5. Strict body parsing limits (Prevents DoS via large payloads)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// 6. Request logging
app.use(morgan('combined'));

// --------------------------
// API Routes
// --------------------------

// Health check (rate-limited)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------------------
// Error Handler (OWASP A10: Security Logging & Monitoring Failures)
// --------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Don't leak error details to client
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// --------------------------
// Static Files & Production
// --------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist'), {
    maxAge: '1y',
    etag: false,
    lastModified: false
  }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Secure server running on port ${PORT}`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
