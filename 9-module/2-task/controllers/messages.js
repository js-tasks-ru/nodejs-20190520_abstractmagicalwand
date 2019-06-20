const Message = require('../models/Message');

module.exports = async function messages(ctx, next) {
  let messages = await Message.find().populate('user');
  messages = messages.map(({_id: id, date, text, user: {displayName: user}}) =>
    ({id, date, text, user}));

  ctx.body = {messages};
};
