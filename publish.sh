#!/bin/bash
npm run build:sdk
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > generated/client/typescript/.npmrc
cd  generated/client/typescript && npm publish --access=public
