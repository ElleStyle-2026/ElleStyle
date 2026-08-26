const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const v1Routes = require('./routes/v1');
const razorpayWebhookRoutes = require('./routes/razorpayWebhookRoutes');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');

const app = express();

const allowedOrigins = env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean);
app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Vary', 'Origin');
		res.setHeader('Access-Control-Allow-Credentials', 'true');
	}
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
	if (req.method === 'OPTIONS') return res.sendStatus(204);
	next();
});

// Webhook route must be mounted before express.json()
app.use('/api/v1/webhooks', razorpayWebhookRoutes);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/v1', v1Routes);

// Error Handling
app.use(errorHandler);

module.exports = app;
