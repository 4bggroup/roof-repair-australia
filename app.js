document.documentElement.classList.remove('no-js');

const qs = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('load', () => {
  setTimeout(() => qs('.preloader')?.classList.add('done'), reduceMotion ? 0 : 350);
  animateHero();
});

function animateHero(){
  const lines = qsa('.hero-title .line em');
  lines.forEach((line, i) => {
    line.animate([{transform:'translateY(115%)'},{transform:'translateY(0)'}], {duration:900,delay:250+i*120,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'});
  });
  qs('.hero-image-mask')?.animate([
    {clipPath:'polygon(0 100%,0 100%,100% 100%,100% 100%)'},
    {clipPath:'polygon(0 0,0 100%,100% 100%,100% 0)'}
  ],{duration:1300,delay:450,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'});
  qs('.hero-roofline')?.animate([{strokeDashoffset:1600},{strokeDashoffset:0}],{duration:1800,delay:850,easing:'ease-out',fill:'forwards'});
  qsa('.hero .reveal-up,.hero .reveal-scale').forEach((el,i)=>revealElement(el,650,600+i*90));
}

const header = qs('[data-header]');
const progress = qs('.scroll-progress span');
function onScroll(){
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 36);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if(progress) progress.style.width = `${max ? y/max*100 : 0}%`;
  updateParallax();
  updateProcess();
  updateHandoverTrack();
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

const cursor = qs('.cursor');
if(cursor && !reduceMotion){
  let tx=0,ty=0,cx=0,cy=0;
  window.addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY});
  const loop=()=>{cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;cursor.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;requestAnimationFrame(loop)};loop();
  qsa('a,button,input,select,textarea,.compare').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('active'));el.addEventListener('mouseleave',()=>cursor.classList.remove('active'))});
}

const menuToggle=qs('.menu-toggle');
const menuPanel=qs('.menu-panel');
menuToggle?.addEventListener('click',()=>{
  const open=menuToggle.getAttribute('aria-expanded')==='true';
  menuToggle.setAttribute('aria-expanded',String(!open));
  menuPanel?.classList.toggle('open',!open);
  menuPanel?.setAttribute('aria-hidden',String(open));
  document.body.style.overflow=open?'':'hidden';
});
qsa('.menu-panel a').forEach(a=>a.addEventListener('click',()=>{menuToggle?.setAttribute('aria-expanded','false');menuPanel?.classList.remove('open');menuPanel?.setAttribute('aria-hidden','true');document.body.style.overflow=''}));

function revealElement(el,duration=700,delay=0){
  if(reduceMotion){el.style.opacity=1;el.style.transform='none';return}
  el.animate([
    {opacity:0,transform:el.classList.contains('reveal-scale')?'scale(.9)':'translateY(32px)'},
    {opacity:1,transform:el.classList.contains('reveal-scale')?'scale(1)':'translateY(0)'}
  ],{duration,delay,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
}
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){revealElement(entry.target);observer.unobserve(entry.target)}}),{threshold:.16});
qsa('.reveal-up,.reveal-scale').forEach(el=>{if(!el.closest('.hero')) observer.observe(el)});

const splitObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){qsa('span',entry.target).forEach((s,i)=>s.animate([{opacity:0,transform:'translateY(70%)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:i*110,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'}));splitObserver.unobserve(entry.target)}}),{threshold:.2});
qsa('.split-heading,.storm-title,.contact-title').forEach(h=>{qsa('span',h).forEach(s=>{s.style.opacity=0});splitObserver.observe(h)});

const serviceData=[
  {src:'assets/inspection.webp',label:'Roof leaks & diagnosis'},
  {src:'assets/before_after.webp',label:'Restoration & ridge work'},
  {src:'assets/gutter.webp',label:'Gutters & roof drainage'},
  {src:'assets/storm.webp',label:'Storm protection'}
];
const serviceVisual=qs('[data-service-visual]');
let serviceIndex=0;
qsa('.service-tab').forEach(tab=>tab.addEventListener('click',()=>{
  const next=Number(tab.dataset.index);
  if(next===serviceIndex || !serviceVisual)return;
  qsa('.service-tab').forEach(t=>{t.classList.remove('active');t.setAttribute('aria-selected','false')});
  tab.classList.add('active');tab.setAttribute('aria-selected','true');
  const old=qs('.service-image',serviceVisual);
  const fig=document.createElement('figure');fig.className='service-image incoming';
  const img=document.createElement('img');img.src=serviceData[next].src;img.alt=serviceData[next].label;fig.append(img);serviceVisual.prepend(fig);
  fig.animate([{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:650,easing:'cubic-bezier(.7,0,.2,1)',fill:'forwards'}).finished.then(()=>{old?.remove();fig.classList.remove('incoming')});
  qs('.service-index-no',serviceVisual).textContent=String(next+1).padStart(2,'0');
  qs('.service-caption strong',serviceVisual).textContent=serviceData[next].label;
  serviceIndex=next;
}));

const compare=qs('[data-compare]');
if(compare){
  const range=qs('input',compare),before=qs('.compare-before',compare),line=qs('.compare-line',compare);
  const update=v=>{before.style.width=`${v}%`;line.style.left=`${v}%`};
  range.addEventListener('input',()=>update(range.value));update(range.value);
}

function updateParallax(){
  if(reduceMotion)return;
  qsa('[data-parallax]').forEach(img=>{
    const rect=img.parentElement.getBoundingClientRect();
    const center=rect.top+rect.height/2-window.innerHeight/2;
    const factor=Number(img.dataset.parallax||.05);
    img.style.transform=`translate3d(0,${center*factor}px,0) scale(1.04)`;
  });
}

function updateProcess(){
  const wrap=qs('[data-process]');if(!wrap)return;
  const rect=wrap.getBoundingClientRect();
  const progressValue=Math.min(1,Math.max(0,(window.innerHeight*.65-rect.top)/(rect.height-window.innerHeight*.2)));
  const fill=qs('.process-line span',wrap);if(fill)fill.style.height=`${progressValue*100}%`;
  const steps=qsa('.process-step',wrap);
  steps.forEach((step,i)=>step.classList.toggle('active',progressValue>i/steps.length-.03));
}

const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const el=entry.target,end=Number(el.dataset.count||0);let start=0;const duration=900,t0=performance.now();const tick=t=>{const p=Math.min(1,(t-t0)/duration);el.textContent=Math.round(end*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);countObserver.unobserve(el)}}),{threshold:.6});qsa('[data-count]').forEach(el=>countObserver.observe(el));

function updateHandoverTrack(){
  const track=qs('.handover-track');if(!track)return;
  const section=track.closest('.handover').getBoundingClientRect();
  const p=(window.innerHeight-section.top)/(section.height+window.innerHeight);
  track.style.transform=`translateX(${(-10+p*16)}%)`;
}

qsa('.magnetic').forEach(el=>{
  if(reduceMotion)return;
  el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.12}px,${y*.16}px)`});
  el.addEventListener('mouseleave',()=>el.style.transform='');
});

const stormObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){qs('.storm-line')?.animate([{strokeDashoffset:2000},{strokeDashoffset:0}],{duration:2200,easing:'ease-out',fill:'forwards'});stormObserver.disconnect()}}),{threshold:.3});const storm=qs('.storm');if(storm)stormObserver.observe(storm);

const form=qs('.contact-form'),formMessage=qs('.form-message');
form?.addEventListener('submit',e=>{e.preventDefault();const required=qsa('[required]',form);if(required.some(f=>!f.value.trim())){formMessage.textContent='Please add your name, phone number and suburb.';formMessage.style.color='var(--coral)';return}formMessage.textContent='Thank you. This concept form is ready to connect to the client’s CRM or inbox.';formMessage.style.color='var(--mint)';form.reset()});
