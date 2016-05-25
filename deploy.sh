pushd dist

zip -r mbtareportcard.zip main.js

aws lambda update-function-code \
  --function-name mbtareportcard \
  --zip-file fileb://`pwd`/mbtareportcard.zip

popd dist
