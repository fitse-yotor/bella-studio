(() => {
  const hero=document.querySelector('.hero-visual');
  const original=hero.querySelector('img');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  hero.setAttribute('role','region');hero.setAttribute('aria-roledescription','carousel');hero.setAttribute('aria-label','Bella Studio photography');
  const track=document.createElement('div');track.className='hero-slides';hero.insertBefore(track,original);
  document.querySelectorAll('.navlinks a[href="#portfolio"],.mobile-panel a[href="#portfolio"]').forEach(link=>link.textContent='Gallery');
  const items=Array.from(document.querySelectorAll('.gallery .tile')).map(tile=>[
    tile.dataset.full,tile.querySelector('img').alt,tile.dataset.cat==='newborn'?'25% center':'center'
  ]);
  const slides=items.map(([src,alt,position],i)=>{
    const frame=document.createElement('div');frame.className='hero-slide'+(i===0?' is-active':'');frame.setAttribute('role','group');frame.setAttribute('aria-roledescription','slide');frame.setAttribute('aria-label',`${i+1} of ${items.length}`);frame.setAttribute('aria-hidden',String(i!==0));
    const img=i===0?original:new Image();img.src=src;img.alt=alt;img.style.objectPosition=position;img.decoding='async';if(i>0)img.loading='lazy';frame.append(img);track.append(frame);return frame;
  });
  const controls=document.createElement('div');controls.className='slider-controls';
  const button=(label,text,cls)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.textContent=text;return b;};
  const prev=button('Previous photo','←','slider-arrow'),next=button('Next photo','→','slider-arrow'),pause=button('Pause slideshow','Pause','slider-pause');
  const dots=document.createElement('div');dots.className='slider-dots';dots.setAttribute('role','group');dots.setAttribute('aria-label','Choose a photo');
  const dotButtons=items.map((item,i)=>{const b=button(`Show photo ${i+1}: ${item[1]}`,'','slider-dot');b.setAttribute('aria-current',String(i===0));b.addEventListener('click',()=>go(i,true));dots.append(b);return b;});
  controls.append(prev,dots,next,pause);hero.append(controls);
  const announce=document.createElement('span');announce.className='slider-announcement';announce.setAttribute('aria-live','polite');announce.setAttribute('aria-atomic','true');hero.append(announce);
  let active=0,playing=!motion.matches,timer,hovered=false,visible=true,version=0;
  function sync(){pause.textContent=playing?'Pause':'Play';pause.setAttribute('aria-label',playing?'Pause slideshow':'Play slideshow');}
  function schedule(){clearTimeout(timer);if(playing&&!motion.matches&&!hovered&&visible&&!document.hidden&&!hero.contains(document.activeElement))timer=setTimeout(()=>go((active+1)%slides.length,false),6000);}
  async function go(index,manual){
    if(manual){playing=false;sync();}clearTimeout(timer);
    const ticket=++version;
    const img=slides[index].querySelector('img');img.loading='eager';
    try{await img.decode();}catch{if(manual)announce.textContent='This photo could not load. Please try another.';schedule();return;}
    if(ticket!==version)return;
    slides[active].classList.remove('is-active');slides[active].setAttribute('aria-hidden','true');dotButtons[active].setAttribute('aria-current','false');
    active=index;slides[active].classList.add('is-active');slides[active].setAttribute('aria-hidden','false');dotButtons[active].setAttribute('aria-current','true');
    if(manual)announce.textContent=`Photo ${active+1} of ${slides.length}: ${items[active][1]}`;schedule();
  }
  prev.addEventListener('click',()=>go((active+slides.length-1)%slides.length,true));next.addEventListener('click',()=>go((active+1)%slides.length,true));
  pause.addEventListener('click',()=>{playing=!playing;sync();schedule();});
  hero.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go((active+(e.key==='ArrowLeft'?slides.length-1:1))%slides.length,true);}});
  hero.addEventListener('mouseenter',()=>{hovered=true;schedule();});hero.addEventListener('mouseleave',()=>{hovered=false;schedule();});
  hero.addEventListener('focusin',()=>clearTimeout(timer));hero.addEventListener('focusout',()=>setTimeout(schedule,0));
  let start;
  track.addEventListener('touchstart',e=>{if(e.touches.length===1){start={x:e.touches[0].clientX,y:e.touches[0].clientY};clearTimeout(timer);}},{passive:true});
  track.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))go((active+(dx<0?1:slides.length-1))%slides.length,true);else schedule();},{passive:true});
  track.addEventListener('touchcancel',()=>{start=null;schedule();},{passive:true});
  document.addEventListener('visibilitychange',schedule);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(hero);
  motion.addEventListener('change',()=>{if(motion.matches)playing=false;sync();schedule();});
  // Reduced-motion visitors can browse every photo manually, without auto-rotation.
  if(motion.matches)pause.hidden=true;
  motion.addEventListener('change',()=>{pause.hidden=motion.matches;});
  sync();schedule();
})();
