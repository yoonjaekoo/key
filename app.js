const DEFAULT_KEYS=[
  {code:'Tab',lbl:'⇥'},{code:'Digit1',lbl:'1'},{code:'Digit2',lbl:'2'},{code:'KeyE',lbl:'E'},
  {code:'KeyP',lbl:'P'},{code:'Equal',lbl:'='},{code:'Backspace',lbl:'⌫'},{code:'Backslash',lbl:'\\'},
  {code:'KeyC',lbl:'C'},{code:'Space',lbl:'␠'},{code:'Lang1',lbl:'한/영'},{code:'Comma',lbl:','}
];
const STORAGE_KEY='adofai-key-viewer-bindings-v1';
function loadKeys(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(Array.isArray(saved)&&saved.length===DEFAULT_KEYS.length&&saved.every(k=>k&&typeof k.code==='string'&&typeof k.lbl==='string')) return saved;
  }catch(e){}
  return DEFAULT_KEYS.map(k=>({...k}));
}
let KEYS=loadKeys();
const N=KEYS.length;
const ORANGE='#ff6a00',CAP_H=48,PAD=6,MAX_PARTICLES=5;
let speedMult=3.0,dirUp=true;
const lanes=Array.from({length:N},()=>[]),particles=Array.from({length:N},()=>[]),pulseAt=new Float64Array(N),hitBuffer=[];
let totalHits=0,maxKps=0;
const wrap=document.getElementById('wrap'),cv=document.getElementById('cv'),ctx=cv.getContext('2d');
let W=0,H=0,LW=0;
function resize(){H=wrap.clientHeight;LW=Math.min(90,Math.max(52,Math.floor(wrap.clientWidth/N)));W=LW*N;cv.width=W;cv.height=H}
resize();new ResizeObserver(resize).observe(wrap);
function hitY(){return dirUp?H-CAP_H-PAD:CAP_H+PAD}
const codeMap={};
function rebuildCodeMap(){
  for(const k in codeMap) delete codeMap[k];
  KEYS.forEach((k,i)=>codeMap[k.code]=i);
  const hi=KEYS.findIndex(k=>k.lbl==='한/영'||k.code==='Lang1');
  if(hi!==-1)['HangulMode','KanaMode','Convert','NonConvert','Lang1'].forEach(code=>codeMap[code]=hi);
}
rebuildCodeMap();
function prettyKey(e){
  const special={Space:'␠',Tab:'⇥',Backspace:'⌫',Enter:'↵',Escape:'Esc',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Equal:'=',Minus:'-',Comma:',',Period:'.',Slash:'/',Backslash:'\\',Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Backquote:'`',CapsLock:'Caps',ShiftLeft:'LShift',ShiftRight:'RShift',ControlLeft:'LCtrl',ControlRight:'RCtrl',AltLeft:'LAlt',AltRight:'RAlt',Lang1:'한/영',HangulMode:'한/영'};
  if(special[e.code]) return special[e.code];
  if(e.code.startsWith('Key')) return e.code.slice(3);
  if(e.code.startsWith('Digit')) return e.code.slice(5);
  if(e.code.startsWith('Numpad')) return 'N'+e.code.slice(6);
  return e.key&&e.key.length<=8?e.key:e.code;
}
let listeningIndex=null;
const pressedCodes=new Set();
function registerDown(code,repeat=false){
  const i=codeMap[code];
  if(i===undefined||repeat||pressedCodes.has(code))return;
  pressedCodes.add(code);
  pressLane(i);
}
function registerUp(code){
  const i=codeMap[code];
  if(i===undefined)return;
  pressedCodes.delete(code);
  closeSegment(i);
}
function handleKeyDown(e){
  if(listeningIndex!==null){
    e.preventDefault();
    e.stopPropagation();
    if(e.repeat) return;
    const target=listeningIndex;
    const other=KEYS.findIndex((k,i)=>i!==target&&k.code===e.code);
    if(other!==-1){
      const old={...KEYS[target]};
      KEYS[other]=old;
    }
    KEYS[target]={code:e.code,lbl:prettyKey(e)};
    listeningIndex=null;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(KEYS));
    rebuildCodeMap();renderKeyGrid();resize();
    return;
  }
  if(codeMap[e.code]===undefined)return;
  e.preventDefault();
  e.stopPropagation();
  registerDown(e.code,e.repeat);
}
function handleKeyUp(e){
  if(listeningIndex!==null||codeMap[e.code]===undefined)return;
  e.preventDefault();
  e.stopPropagation();
  registerUp(e.code);
}
window.addEventListener('keydown',handleKeyDown,true);
window.addEventListener('keyup',handleKeyUp,true);

// When this page is opened as the Chrome extension viewer, receive keyboard
// events captured by content.js in whichever normal Chrome tab/window is active.
if(globalThis.chrome?.runtime?.onMessage){
  chrome.runtime.onMessage.addListener(message=>{
    if(!message||message.type!=='KEY_VIEWER_EVENT'||listeningIndex!==null)return;
    if(message.kind==='keydown') registerDown(message.code,Boolean(message.repeat));
    else if(message.kind==='keyup') registerUp(message.code);
  });
}

window.addEventListener('blur',()=>{
  // Do not close relayed keys merely because the viewer itself lost focus.
  // Local keys are closed by their keyup; remote keys are closed by content.js.
});
function pressLane(i){const now=performance.now();hitBuffer.push(now);totalHits++;pulseAt[i]=now;document.getElementById('s-total').textContent=totalHits;const hy=hitY();lanes[i].push({headY:hy,tailY:hy,closed:false});spawnParticles(i,hy)}
function closeSegment(i){const arr=lanes[i];for(let j=arr.length-1;j>=0;j--){if(!arr[j].closed){arr[j].closed=true;return}}}
function spawnParticles(lane,hy){const arr=particles[lane],cx=lane*LW+LW*.5,dir=dirUp?-1:1;for(let i=0;i<MAX_PARTICLES;i++){const a=Math.PI*(.2+Math.random()*.6)*dir+(dir<0?0:Math.PI),sp=1+Math.random()*2;arr.push({x:cx,y:hy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,decay:.04+Math.random()*.04,r:1+Math.random()*2})}}
const sKps=document.getElementById('s-kps'),sMax=document.getElementById('s-max'),kpBar=document.getElementById('kps-bar');
function updateKps(){const now=performance.now(),cut=now-1000;while(hitBuffer.length&&hitBuffer[0]<cut)hitBuffer.shift();const kps=hitBuffer.length;if(kps>maxKps){maxKps=kps;sMax.textContent=maxKps}sKps.textContent=kps;kpBar.style.width=Math.min(100,(kps/Math.max(maxKps,1))*100)+'%'}
let lastFrame=0;
function frame(ts){requestAnimationFrame(frame);const dt=Math.min(ts-lastFrame,32);lastFrame=ts;updateKps();ctx.fillStyle='#080808';ctx.fillRect(0,0,W,H);const hy=hitY(),pxPerMs=speedMult*.18;ctx.strokeStyle='rgba(255,106,0,.08)';ctx.lineWidth=1;for(let i=1;i<N;i++){const x=i*LW;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}ctx.strokeStyle='rgba(255,106,0,.25)';ctx.beginPath();ctx.moveTo(0,hy);ctx.lineTo(W,hy);ctx.stroke();ctx.fillStyle=ORANGE;
  for(let i=0;i<N;i++){const laneX=i*LW,segs=lanes[i];for(let j=segs.length-1;j>=0;j--){const s=segs[j],scroll=pxPerMs*dt;if(!s.closed){s.headY+=dirUp?-scroll:scroll;s.tailY=hy}else{s.headY+=dirUp?-scroll:scroll;s.tailY+=dirUp?-scroll:scroll}const top=dirUp?s.headY:s.tailY,bottom=dirUp?s.tailY:s.headY;if(dirUp&&bottom<0){segs.splice(j,1);continue}if(!dirUp&&top>H){segs.splice(j,1);continue}const drawTop=Math.max(top,0),drawBottom=Math.min(bottom,H),rh=drawBottom-drawTop;if(rh>0)ctx.fillRect(laneX,drawTop,LW,rh)}}
  for(let i=0;i<N;i++){const arr=particles[i];for(let j=arr.length-1;j>=0;j--){const p=arr[j];p.x+=p.vx;p.y+=p.vy;p.vy+=dirUp?-.03:.03;p.life-=p.decay;if(p.life<=0){arr.splice(j,1);continue}ctx.fillStyle=`rgba(255,106,0,${p.life})`;ctx.fillRect(p.x,p.y,p.r,p.r)}}
  for(let i=0;i<N;i++)drawCap(i,ts)
}
requestAnimationFrame(frame);
function drawCap(i,ts){const x=i*LW,y=dirUp?H-CAP_H:0,active=lanes[i].some(s=>!s.closed);ctx.fillStyle=active?'rgba(255,106,0,.28)':'rgba(255,106,0,.08)';ctx.fillRect(x,y,LW,CAP_H);ctx.strokeStyle=active?ORANGE:'rgba(255,106,0,.25)';ctx.lineWidth=active?2:1;ctx.strokeRect(x+.5,y+.5,LW-1,CAP_H-1);const elapsed=ts-pulseAt[i];if(elapsed<220){const t=elapsed/220,ex=t*8;ctx.strokeStyle=`rgba(255,106,0,${(1-t)*.5})`;ctx.strokeRect(x-ex,y-ex,LW+ex*2,CAP_H+ex*2)}ctx.fillStyle=active?ORANGE:'rgba(255,106,0,.5)';ctx.font=`${active?700:400} ${Math.round(LW*.24)}px 'JetBrains Mono'`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(KEYS[i].lbl,x+LW*.5,y+CAP_H*.5)}
const speed=document.getElementById('speed'),speedVal=document.getElementById('speed-val');speed.addEventListener('input',()=>{speedMult=parseFloat(speed.value);speedVal.textContent=speedMult.toFixed(1)});
document.getElementById('rise').addEventListener('click',()=>{dirUp=true;document.getElementById('rise').classList.add('active');document.getElementById('fall').classList.remove('active')});
document.getElementById('fall').addEventListener('click',()=>{dirUp=false;document.getElementById('fall').classList.add('active');document.getElementById('rise').classList.remove('active')});
const keyPanel=document.getElementById('key-panel'),keyGrid=document.getElementById('key-grid'),keysBtn=document.getElementById('keys-btn');
function renderKeyGrid(){keyGrid.innerHTML='';KEYS.forEach((k,i)=>{const b=document.createElement('button');b.className='key-bind'+(listeningIndex===i?' listening':'');b.innerHTML=`<span class="slot">KEY ${i+1}</span><span class="binding">${listeningIndex===i?'PRESS KEY…':k.lbl}</span>`;b.addEventListener('click',()=>{listeningIndex=i;renderKeyGrid()});keyGrid.appendChild(b)})}
keysBtn.addEventListener('click',()=>{keyPanel.classList.toggle('open');keysBtn.classList.toggle('active',keyPanel.classList.contains('open'));listeningIndex=null;renderKeyGrid()});
document.getElementById('close-keys').addEventListener('click',()=>{keyPanel.classList.remove('open');keysBtn.classList.remove('active');listeningIndex=null;renderKeyGrid()});
document.getElementById('reset-keys').addEventListener('click',()=>{KEYS=DEFAULT_KEYS.map(k=>({...k}));localStorage.removeItem(STORAGE_KEY);listeningIndex=null;rebuildCodeMap();renderKeyGrid();resize()});
renderKeyGrid();
