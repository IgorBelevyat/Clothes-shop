require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler.middleware.js');


const cookieParser = require('cookie-parser');


const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://demo-shop-119h3tb85--f7f127.vercel.app', // замени на свой Vercel домен
  process.env.FRONTEND_URL // чтобы можно было задавать в .env
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

const mainRouter = require('./routes/index.js'); 
app.use('/api', mainRouter); 

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is up and running!' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});