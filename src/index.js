const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());

// Only connect if NOT in test mode (tests handle their own connection)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export app for testing, start server if main module
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
