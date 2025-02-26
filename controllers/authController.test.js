import * as authController from './authController.js';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../models/user.js'); // Mock the User model

describe('authController', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      const mockReq = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          referralCode: null,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the User model's save method
      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({}),
      }));

      // Mock bcrypt.hash
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
      });
    });

    it('should return an error if the user already exists', async () => {
      const mockReq = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          referralCode: null,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the User model's findOne method to return an existing user
      User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email already in use',
      });
    });
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

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

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'mockToken',
          user: expect.objectContaining({
            username: 'testuser',
            email: 'test@example.com',
            referralCode: 'referralCode',
          }),
        })
      );
    });

    it('should return an error if invalid credentials', async () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

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

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });
  });
});
