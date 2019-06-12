const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

async function getUserAndCheckPassword(email, password, done) {
  const user = await User.findOne({email});
  if (!user) {
    done(null, false, 'Нет такого пользователя');
    return;
  }

  const validPassword = await user.checkPassword(password);
  if (validPassword) {
    done(null, user);
  } else {
    done(null, false, 'Невереный пароль');
  }
}

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    function(email, password, done) {
      getUserAndCheckPassword(email, password, done);
    }
);
