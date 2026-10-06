import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const core=fs.readFileSync('src/core.js','utf8');const html=fs.readFileSync('src/index.html','utf8').replace('/*CORE*/',core);const sw=fs.readFileSync('src/sw.js','utf8');const manifest=JSON.stringify({name:'مؤمن فريش',short_name:'مؤمن فريش',lang:'ar',dir:'rtl',start_url:'/',scope:'/',display:'standalone',background_color:'#f2f5f7',theme_color:'#063b31',icons:[{src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#063b31"/><text x="96" y="140" text-anchor="middle" font-size="130" fill="#dcf763">م</text></svg>'),sizes:'any',type:'image/svg+xml'}]});
fs.writeFileSync('dist/server/index.js',core+'\nconst HTML='+JSON.stringify(html)+';\nconst SW='+JSON.stringify(sw)+';\nconst MANIFEST='+JSON.stringify(manifest)+';\n'+fs.readFileSync('src/worker.js','utf8'));
fs.writeFileSync('dist/.openai/hosting.json',fs.readFileSync('.openai/hosting.json'));
fs.writeFileSync('../Momen-Fresh.html',html);console.log('Built Worker and offline application');
