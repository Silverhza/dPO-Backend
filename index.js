const express = require('express');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const Message = require('./models/message');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const sanitizeHtml = require('sanitize-html');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');

const HttpError = require('./helpers/http-error');
const userRoutes = require('./routes/user-routes');
const planRoutes = require('./routes/plan-routes');
const spaceRoutes = require('./routes/space-routes');
const profileRoutes = require('./routes/profile-routes');
const connectionRoutes = require('./routes/connection-routes');
const bookingRoutes = require('./routes/booking-routes');
const reviewRoutes = require('./routes/review-routes');
const contactRoutes = require('./routes/contact-routes');
const subscriptionRoutes = require('./routes/subscription-routes');
const feedbackRoutes = require('./routes/feedback-routes');
const webhookRoutes = require('./routes/webhook-routes');
const supportRoutes = require('./routes/support-routes');

const app = express();

app.use('/webhook', webhookRoutes);

app.use(express.json());

app.use(cookieParser());

function checkForHTMLTags(req, res, next) {
  const { body } = req;
  const keys = Object.keys(body);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = body[key];

    if (typeof value === 'string' && sanitizeHtml(value) !== value) {
      return res.status(400).json({ error: 'HTML tags are not allowed in the request body' });
    }
  }
  next();
}

app.use(checkForHTMLTags);

// app.use(helmet());

// Disable CSP for chat test
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'To many request from this IP now please wait for an hour!',
});

// Swagger setup
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'dPO API',
      version: '1.0.0',
      description: 'dPO API with autogenerated swagger doc',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
fs.writeFileSync('./swagger.json', JSON.stringify(specs, null, 2));
console.log('Swagger documentation generated successfully.');

// Swagger UI setup
// Use http://localhost:5000/api-docs/
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/uploads/policy', express.static(path.join('uploads', 'policy')));
app.use('/uploads/company', express.static(path.join('uploads', 'company')));
app.use('/uploads/spaces', express.static(path.join('uploads', 'spaces')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api', limiter);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/plan', planRoutes);
app.use('/api/v1/space', spaceRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/connection', connectionRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/review', reviewRoutes);
app.use('/api/v1/contactus', contactRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/static', express.static(__dirname + '/node_modules'));
app.use('/api/v1/chat', express.static(path.join(__dirname, './index.html')));

app.use((req, res, next) => {
  throw new HttpError('Could not find the route', 404);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  }
  if (res.headerSent) {
    return next(error);
  }
  const validStatusCodes = [200, 201, 202, 204, 400, 401, 403, 404, 500]; // ...其他有效的状态码
  if (validStatusCodes.includes(error.code)) {
    res.status(error.code);
  } else {
    res.status(500);
  }

  res.json({ message: error.message || 'An unknown error occured' });
});

mongoose
  .connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to db on port ${process.env.PORT}`);

    // Use Swagger UI with the existing Swagger JSON at /api-docs
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });

// Socket.io setup
// Use http://localhost:5000/api/v1/chat
const port = 7000;
const server = app.listen(port, () => {
  console.log(`Chat Server running on port ${port}`);
});

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const users = {};

io.on('connection', (socket) => {
  // Handle user login
  socket.on('user-login', async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
          socket.userId = user._id;
          users[user._id] = socket.id;
          socket.emit('login-response', { success: true, userId: user._id });
          console.log('Login success for', email);
        } else {
          socket.emit('login-response', { success: false, error: 'Invalid email or password.' });
        }
      } else {
        console.log('User not exist!');
      }
    } catch (err) {
      console.error('Error handling login:', err);
      socket.emit('login-response', { success: false, error: 'Internal server error.' });
    }
  });

  // Handle incoming messages
  socket.on('send-message', async ({ receiverEmail, message }) => {
    const sender = socket.userId; // Get the userId from the socket
    if (!sender) {
      console.error('User not logged in');
      return;
    }

    try {
      // Lookup the receiver's userId by email
      const receiverUser = await User.findOne({ email: receiverEmail });
      if (!receiverUser) {
        console.error('Receiver not found');
        return;
      }
      const receiver = receiverUser._id;

      // Save the message to the database
      const newMessage = new Message({
        sender,
        receiver,
        content: message,
      });
      await newMessage.save();
      console.log('Save success', newMessage);
      const receiverSocketId = users[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', {
          sender: receiverEmail,
          message: message,
        });
        console.log('Send success to', receiverEmail);
      }
    } catch (err) {
      console.error('Error handling send-message:', err);
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    if (userId) {
      delete users[userId];
    }
    console.log('A user disconnected:', socket.id);
  });
});
