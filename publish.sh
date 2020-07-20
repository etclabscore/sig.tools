#!/bin/bash
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > generated/client/typescript/.npmrc
cd  generated/client/typescript && npm install && npm run build && npm publish --access=public
