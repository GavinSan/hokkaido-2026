
const fs=require("fs");
const css=fs.readFileSync("style.css","utf8");
const js=fs.readFileSync("/tmp/hok-bundle.js","utf8").replace(/<\/script/g,"<\\/script");
const html=`<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>北海道七日自駕遊</title>
<meta name="description" content="2026 北海道七日自駕遊：行程、航班、清單、住宿、公數袋">
<meta name="theme-color" content="#FFFCF6">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="北海道">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" href="icon-192.png">
<link rel="manifest" href="manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Huninn&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${fs.readFileSync("firebase-config.js","utf8")}</script>
<script>${js}</script>
</body>
</html>`;
fs.writeFileSync("../index.html",html);
// 東京私人行程：同一個 app，獨立網址 /tokyo/
fs.mkdirSync("../tokyo",{recursive:true});
const tokyo=html
  .replace("<title>北海道七日自駕遊</title>","<title>私人行程</title>")
  .replace(/<meta name="description"[^>]*>/,"<meta name=\"robots\" content=\"noindex\">")
  .replace('content="北海道"','content="東京"')
  .replace('<div id="root"></div>','<div id="root"></div>\n<script>window.HOK_MODE="tokyo"</script>');
fs.writeFileSync("../tokyo/index.html",tokyo);
fs.writeFileSync("../tokyo/manifest.json",JSON.stringify({name:"東京",short_name:"東京",start_url:".",display:"standalone",background_color:"#FFFCF6",theme_color:"#FFFCF6",icons:[{src:"icon-192.png",sizes:"192x192",type:"image/png"},{src:"icon-512.png",sizes:"512x512",type:"image/png"}]},null,2));
fs.writeFileSync("../manifest.json",JSON.stringify({name:"北海道七日自駕遊",short_name:"北海道",start_url:".",display:"standalone",background_color:"#FFFCF6",theme_color:"#FFFCF6",icons:[{src:"icon-192.png",sizes:"192x192",type:"image/png"},{src:"icon-512.png",sizes:"512x512",type:"image/png"}]},null,2));
fs.writeFileSync("../.nojekyll","");
const sharp=require("sharp");
const svg=fs.readFileSync("icon.svg");
const svgT=fs.readFileSync("icon-tokyo.svg");
Promise.all([...[180,192,512].map(s=>sharp(svg).resize(s,s).png().toFile(`../icon-${s}.png`)),...[180,192,512].map(s=>sharp(svgT).resize(s,s).png().toFile(`../tokyo/icon-${s}.png`))]).then(()=>console.log("ok",(html.length/1024).toFixed(0)+"KB"));
