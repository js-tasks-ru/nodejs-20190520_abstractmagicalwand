const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [{
      validator: (value) => /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value),
      message: (props) => `${props.value} is not a valid email!`,
    }],
    lowercase: true,
    trim: true,
    index: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'users',
});

module.exports = mongoose.model('User', schema);
