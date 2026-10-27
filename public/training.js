(() => {
  const logo=document.querySelector('.brand img');
  const setLogo=()=>{logo.src=document.documentElement.dataset.theme==='dark'?'assets/logo-black.png':'assets/logo-color.png';};
  setLogo();
  new MutationObserver(setLogo).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.querySelectorAll('.navlinks,.mobile-panel').forEach(nav=>{
    const link=document.createElement('a');link.href='#academy';link.textContent='Training';nav.insertBefore(link,nav.children[nav.children.length-1]);
    link.addEventListener('click',()=>{document.querySelector('.mobile-panel').classList.remove('open');document.querySelector('.menu').setAttribute('aria-expanded','false');});
  });
  const form=document.querySelector('#training-form'),status=document.querySelector('#registration-status'),button=form.querySelector('button');
  let id=crypto.randomUUID();
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form));
    const phone=String(data.phone).replace(/[\s()-]/g,'');
    if(!/^(?:\+251|0)[79]\d{8}$/.test(phone)){status.textContent='Please enter a valid Ethiopian phone number.';form.elements.phone.focus();return;}
    button.disabled=true;button.textContent='Saving your application…';status.textContent='';
    try{
      const response=await fetch('/api/training',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id,consent:data.consent==='on'}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Unable to save your application. Please try again.');
      status.dataset.state='success';status.textContent=`Application received. Your reference: ${result.reference}. Please save this reference. Bella Studio will contact you to discuss availability, fees, and enrollment.`;
      form.reset();id=crypto.randomUUID();status.focus();
    }catch(error){status.dataset.state='error';status.textContent=error.name==='TimeoutError'?'The request timed out. Please retry; your application will not be duplicated.':error.message||'Unable to connect. Please try again or call the studio.';status.focus();}
    finally{button.disabled=false;button.textContent='Submit application ↗';}
  });
})();
