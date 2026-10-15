set -e
ESB=/home/claude/.npm-global/lib/node_modules/tsx/node_modules/esbuild/bin/esbuild
export NODE_PATH=/home/claude/.npm-global/lib/node_modules
$ESB entry.jsx --bundle --minify --format=iife --jsx=automatic --define:process.env.NODE_ENV='"production"' --outfile=/tmp/hok-bundle.js --log-level=warning
OUT=..
node build.cjs
