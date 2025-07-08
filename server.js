const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// const to MongoDB
connectDB();

// middleware to parse JSON and URL-encoded data 
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

// route 
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

// error handling 
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));