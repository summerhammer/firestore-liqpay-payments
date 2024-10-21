const path = require('path');

export const pathToenvFile = path.resolve(
  __dirname,
  '../../integration-tests/extensions/firestore-liqpay-payments.env.local'
);

export const pathTosecretsFile = path.resolve(
  __dirname,
  '../../integration-tests/extensions/firestore-liqpay-payments.secret.local'
);

export const setupEnvironment = () => {
  require('dotenv').config({
    path: pathToenvFile,
  });

  require('dotenv').config({
    path: pathTosecretsFile,
  });
};
