const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = [];

router.get('/subscribe', async (ctx, next) => {
  await new Promise((resolve, reject) => {
    ctx.unsubscribe = resolve;
    subscribers.push(ctx);
  });
});

router.post('/publish', async (ctx, next) => {
  if (!ctx.request.body.message) {
    ctx.status = 400;
    return;
  }

  subscribers.forEach((subscriber) => {
    subscriber.body = ctx.request.body.message;
    subscriber.unsubscribe();
  });

  ctx.status = 201;
  subscribers = [];
});

app.use(router.routes());

module.exports = app;
