#!/bin/sh

$(npm bin)/babel index.js --out-dir dist

cp -r secrets dist/
cp -r package.json dist/

pushd dist

npm install --production

zip -ru mbtareportcard.zip ./*

aws lambda update-function-code \
  --function-name mbtareportcard \
  --zip-file fileb://`pwd`/mbtareportcard.zip

popd dist
