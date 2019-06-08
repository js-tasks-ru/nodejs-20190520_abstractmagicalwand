const Koa = require('koa');
const Router = require('koa-router');
const User = require('./models/User');
const mongoose = require('mongoose');
const normalizeValidationError = require('./libs/normalize-validation-error');

const app = new Koa();
const ValidationError = mongoose.Error.ValidationError;

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());


app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ValidationError) {
      ctx.status = 400;
      ctx.body = {
        errors: normalizeValidationError(err.errors),
      };
    } else if (err.kind === 'ObjectId') {
      ctx.status = 400;
      ctx.body = {error: err.message};
    } else if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

const router = new Router();

router.get('/users', async (ctx) => {
  const users = await User.find();
  ctx.body = users;
});

router.get('/users/:id', async (ctx) => {
  const [user] = await User.find({_id: ctx.params.id});

  if (!user) {
    ctx.throw(404, 'Not Found');
    return;
  }

  ctx.body = user;
});

router.patch('/users/:id', async (ctx) => {
  const updatedUser = await User.findOneAndUpdate(
      {_id: ctx.params.id},
      ctx.request.body,
      {new: true, runValidators: true}
  );
  ctx.body = updatedUser;
});

router.post('/users', async (ctx) => {
  const newUser = await User.create(ctx.request.body);
  ctx.body = newUser;
});

router.delete('/users/:id', async (ctx) => {
  const user = await User.deleteOne({_id: ctx.params.id});

  if (user.deletedCount === 1) {
    ctx.status = 200;
  } else {
    ctx.throw(404, 'Not Found');
  }
});

app.use(router.routes());

module.exports = app;
