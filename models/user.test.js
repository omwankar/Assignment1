import mongoose from 'mongoose';
import User from './user.js';

describe('User Model', () => {
  it('should require an email', async () => {
    const user = new User({
      username: 'testuser',
      password: 'password',
    });

    let err;
    try {
      await user.validate();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  it('should require a username', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password',
    });

    let err;
    try {
      await user.validate();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.username).toBeDefined();
  });

  it('should require a password', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
    });

    let err;
    try {
      await user.validate();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.password).toBeDefined();
  });
});
