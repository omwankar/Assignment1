import request from 'supertest';
import { app } from '../config/config.js'; // Import the app instance
import mongoose from 'mongoose';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock the User model
jest.mock('../models/user.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('authRoutes', () => {
  beforeAll(async () => {
    // Connect to a test database (e.g., in-memory MongoDB)
    // await mongoose.connect('mongodb://localhost/testdb', {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });
  });

  afterAll(async () => {
    // Disconnect from the test database
    // await mongoose.connection.close();
  });

  describe('POST /api/register', () => {
    it('should register a new user', async () => {
      // Mock the User model's save method
      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({}),
      }));

      // Mock bcrypt.hash
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('User registered successfully');
    });

    it('should return an error if the user already exists', async () => {
      // Mock the User model's findOne method to return an existing user
      User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Email already in use');
    });
  });

  describe('POST /api/login', () => {
    it('should log in a user', async () => {
      // Mock the User model's findOne method to return a user
      User.findOne = jest.fn().mockResolvedValue({
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        referralCode: 'referralCode',
      });

      // Mock bcrypt.compare
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      // Mock jwt.sign
      jwt.sign = jest.fn().mockReturnValue('mockToken');

      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toEqual('mockToken');
      expect(res.body.user.username).toEqual('testuser');
    });

    it('should return an error if invalid credentials', async () => {
      // Mock the User model's findOne method to return a user
      User.findOne = jest.fn().mockResolvedValue({
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        referralCode: 'referralCode',
      });

      // Mock bcrypt.compare
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Invalid credentials');
    });
  });
});
