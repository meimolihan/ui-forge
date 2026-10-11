// 键盘焦点可见性验证：用 CDP 派发真实 Tab 键遍历所有可操作控件，
// 报告哪些控件缺少可见焦点环。
//
// 为什么必须用真实按键：`:focus-visible` 只在真实键盘导航时匹配。
// 用 element.focus() 做程序化聚焦，浏览器不认为那是键盘意图，
// :focus-visible 不生效，判定结果错误且不稳定（同样代码两次跑出不同结论）。
// 这个坑踩过，所以这里用 Input.dispatchKeyEvent 派发真正的 Tab。
//
// 用法：
//   node verify_focus.mjs <页面地址或 HTML 文件> [更多参数透传给 shoot.mjs]
//   node verify_focus.mjs preview.html
//   node verify_focus.mjs http://127.0.0.1:8080/
//
// 退出码：有控件缺焦点环时为 1，否则为 0。可直接接进 CI。

import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('用法: node verify_focus.mjs <页面地址或 HTML 文件>');
  process.exit(2);
}

const isFile = !/^https?:\/\//i.test(target);
let srv = null;
let pageUrl = target;

if (isFile) {
  // 本地 HTML：起一个只监听 127.0.0.1 的临时服务器
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) {
    console.error(`找不到文件: ${abs}`);
    process.exit(2);
  }
  const html = fs.readFileSync(abs);
  const root = path.dirname(abs);
  srv = http.createServer((req, res) => {
    // 相对路径的静态资源（css/js）也要能取到，否则页面样式全丢，焦点环无从判断
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const rel = urlPath === '/' ? path.basename(abs) : urlPath.replace(/^\/+/, '');
    const file = path.join(root, rel);
    if (!path.resolve(file).startsWith(path.resolve(root))) {
      res.writeHead(403); return res.end('forbidden');
    }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('not found'); }
      const ext = path.extname(file).toLowerCase();
      const mime = {
        '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
        '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
        '.woff2': 'font/woff2', '.ico': 'image/x-icon',
      }[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(buf);
    });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  pageUrl = `http://127.0.0.1:${srv.address().port}/${path.basename(abs)}`;
}

function findBrowser() {
  const cands = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.PROGRAMFILES + '/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    process.env['PROGRAMFILES(X86)'] + '/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  return cands.find(p => { try { return fs.existsSync(p); } catch { return false; } });
}

const browser = findBrowser();
if (!browser) {
  console.error('未找到 Chrome/Chromium/Edge，设置 CHROME_PATH 后重试。');
  if (srv) srv.close();
  process.exit(2);
}

const port = 9300 + Math.floor(Math.random() * 400);
const udd = path.join(os.tmpdir(), `ui-forge-focus-${process.pid}`);
const proc = spawn(browser, [
  '--headless=new', `--remote-debugging-port=${port}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu',
  '--window-size=1440,900', `--user-data-dir=${udd}`, 'about:blank',
], { stdio: 'ignore' });

const cleanup = () => {
  try { proc.kill(); } catch {}
  if (srv) srv.close();
  try { fs.rmSync(udd, { recursive: true, force: true }); } catch {}
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

// 等 DevTools 端口就绪
let wsUrl = null;
for (let i = 0; i < 40; i++) {
  await new Promise(r => setTimeout(r, 250));
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = list.find(t => t.type === 'page');
    if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
  } catch {}
}
if (!wsUrl) { console.error('DevTools 未就绪'); cleanup(); process.exit(2); }

const ws = new WebSocket(wsUrl);
let msgId = 0;
const pending = new Map();
const consoleErrors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') {
    consoleErrors.push(m.params.entry.text);
  }
};
await new Promise(r => ws.onopen = r);
const send = (method, params = {}) => new Promise(res => {
  const id = ++msgId; pending.set(id, res);
  ws.send(JSON.stringify({ id, method, params }));
});

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Page.navigate', { url: pageUrl });
await new Promise(r => setTimeout(r, 2500));

const PROBE = `(function(){
  const a = document.activeElement;
  if(!a || a===document.body) return {skip:true};
  const cs = getComputedStyle(a);
  const outlineRing = cs.outlineStyle!=='none' && parseFloat(cs.outlineWidth)>0;
  const shadowRing = cs.boxShadow && cs.boxShadow!=='none';
  const desc = (a.getAttribute('aria-label')||a.getAttribute('title')||a.textContent||'')
    .trim().replace(/\\s+/g,' ').slice(0,24);
  // 唯一身份：绝不能用 tag+class+label，表格里多个开关三者全同会撞车，
  // 导致遍历在第2 个相同 key 处误判为回到起点而提前退出，只检查了一半控件。
  let uid = a.id || '';
  if(!uid){
    const sibs = a.parentElement ? [...a.parentElement.children] : [];
    uid = a.tagName.toLowerCase()+'#'+sibs.indexOf(a)+(a.parentElement?
      '@'+(a.parentElement.className||a.parentElement.tagName).toString().trim().split(/\\s+/)[0]:'');
  }
  return {skip:false, uid:uid,
    tag:a.tagName.toLowerCase(),
    cls:(a.className||'').toString().trim().split(/\\s+/).slice(0,3).join('.'),
    label:desc,
    focused:!!a.matches(':focus-visible'),
    outline:cs.outlineStyle+' '+cs.outlineWidth+' '+cs.outlineColor,
    shadow:(cs.boxShadow||'').slice(0,50),
    hasRing: !!(outlineRing||shadowRing)};
})()`;

async function pressTab(shift = false) {
  const mods = shift ? 8 : 0;   // 8 = Shift
  const base = { windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, key: 'Tab', code: 'Tab', modifiers: mods };
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await new Promise(r => setTimeout(r, 90));
}

const MAX = 60;
const seen = new Set();
const missing = [];
const all = [];
let checked = 0;
let wrapped = false;

for (let i = 0; i < MAX; i++) {
  await pressTab();
  const { result } = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
  const r = result?.result?.value;
  if (!r || r.skip) continue;
  // 用唯一 uid 判断是否绕回起点；重复出现同一个 uid 才是真的绕回来了
  if (seen.has(r.uid)) { wrapped = true; break; }
  seen.add(r.uid);
  checked++;
  all.push(r);
  if (!r.hasRing) missing.push(r);
}

console.log(`\n检查了 ${checked} 个可聚焦控件${wrapped ? '' : '（可能已到上限，未遍历完整）'}\n`);
for (const r of missing) {
  console.log(`  缺焦点环  ${r.tag}.${r.cls} "${r.label}"  focus-visible:${r.focused}  outline:${r.outline}`);
}
if (missing.length === 0) {
  console.log('  全部控件都有可见焦点环。');
} else {
  console.log(`\n${missing.length} / ${checked} 个控件缺少可见焦点环。`);
}

if (consoleErrors.length) {
  console.log(`\n控制台错误 ${consoleErrors.length} 条（可能影响判断，需先修）:`);
  for (const e of [...new Set(consoleErrors)].slice(0, 5)) console.log('  - ' + e.slice(0, 140));
  console.log('  注意：页面脚本报错时样式可能没加载，此时焦点环结论不可信。');
}

process.exit(missing.length ? 1 : 0);