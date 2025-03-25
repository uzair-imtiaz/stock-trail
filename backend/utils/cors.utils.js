const allowedOrigins = [
  'http://localhost:5173',
  'https://ds.algobricks.org',
  'https://www.ds.algobricks.org',
  'https://stock-trail-git-main-uzair-imtiazs-projects.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  enablePreflight: true,
};

module.exports = { corsOptions };
