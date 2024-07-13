const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password'],
    validate: {
      // "this" only points to current doc on new document creation; it only works for "SAVE"; Always use "create" or "save" rather than findOne and update
      validator: function (el) {
        return this.password === el;
      },
      message: 'Passwords are not same',
    },
  },
});

userSchema.pre('save', async function (next) {
  // only run if password id actually modified
  if (!this.isModified('password')) return next();

  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete passsword confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  UserPassword,
) {
  return await bcrypt.compare(candidatePassword, UserPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
