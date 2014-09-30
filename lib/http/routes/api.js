
'use strict';

// --- Dependencies ---
var join    = require('path').join;

var debug   = require('debug')('arkivo:server:api');
var express = require('express');

var common = require('../../common');
var pick = common.pick;

var Subscription = require('../../subscription');
var NotFoundError = Subscription.NotFoundError;

var api = express.Router();


api.use(function (req, _, next) {
  debug('%s %s', req.method, req.path);
  next();
});

api.use(require('body-parser'));


// --- Magic Parameters ---

api.param('subscription', function (req, res, next, id) {
  Subscription
    .load(id)

    .then(function (subscription) {
      req.subscription = subscription;
      next();
    })

    .catch(NotFoundError, function () {
      res.status(404).end();
    })

    .catch(next);
});




// --- Sync API ---

// async?

// --- Subscription API ---

api.route('/subscription')
  .post(function (req, res, next) {
    Subscription
      .create(pick(req.body, Subscription.accessible))

      .then(function (subscription) {
        res
          .status(201)

          .set({
            'Location': join(req.baseUrl, req.path, subscription.id)
          })

          .send(subscription.json);
      })

      .catch(next);
  });

api.route('/subscription/:subscription')
  .get(function (req, res, next) {
    res
      .set({
        'Last-Modified': req.subscription.timestamp
      })

      .send(req.subscription.json);
  })

  .post(function (req, res, next) {
    req.subscription
      .update(pick(req.body, Subscription.accessible))
      .save()

      .then(function () {
        res.send(req.subscription.json);
      })

      .catch(next);
  })

  .delete(function (req, res, next) {
    req.subscription
      .destroy()

      .then(function () {
        res.status(200).end();
      })

      .catch(next);
  });


// --- Exports ---
module.exports = api;