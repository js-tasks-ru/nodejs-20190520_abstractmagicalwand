const uuid = require('uuid/v4');
const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) {
    done(null, false, 'Не указан email');
    return;
  }

  let user = await User.findOne({email});
  if (!user) {
    try {
      user = new User({email, displayName});
      await user.setPassword(uuid());
      await user.save();
    } catch (error) {
      done(error);
      return;
    }
  }

  done(null, user);
};
