document.addEventListener('DOMContentLoaded', ()=>{

  // Storage keys
  const DB_ACCOUNTS = 'my_portal_accounts_v2';
  const DB_CURRENT = 'my_portal_current_v2';
  
  function loadAccounts(){try{return JSON.parse(localStorage.getItem(DB_ACCOUNTS)||'[]')}catch(e){return[]}}
  function saveAccounts(a){localStorage.setItem(DB_ACCOUNTS,JSON.stringify(a))}

  const avatarEl = document.getElementById('avatar');
  const authModal = document.getElementById('authModal');
  const fakeGoogle = document.getElementById('fakeGoogle');
  const nameForm = document.getElementById('nameForm');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const createAcc = document.getElementById('createAcc');
  const cancelAuth = document.getElementById('cancelAuth');

  let tempAvatarData = null;

  fakeGoogle.addEventListener('click', ()=>{ 
      nameForm.style.display='block'; 
      fakeGoogle.style.display='none';
  });

  cancelAuth.addEventListener('click', ()=>{
      authModal.style.display='none'; 
      fakeGoogle.style.display='block'; 
      nameForm.style.display='none';
  });

  function rand10(){let s='';while(s.length<10){s+=Math.floor(Math.random()*10)}return s}
  function uniqueCode(){const a=loadAccounts();let c=rand10();while(a.find(x=>x.code===c))c=rand10();return c}

  createAcc.addEventListener('click', ()=>{
      const fn=firstName.value.trim(), ln=lastName.value.trim();
      if(!fn || !ln){alert('Enter first and last name'); return;}
      const acc={code:uniqueCode(),first:fn,last:ln,avatar:tempAvatarData||null,posts:[]};
      const accs=loadAccounts(); accs.push(acc); saveAccounts(accs);
      localStorage.setItem(DB_CURRENT,acc.code);
      authModal.style.display='none'; fakeGoogle.style.display='block'; nameForm.style.display='none';
      renderAvatar();
  });

  function renderAvatar(){
      const cur=localStorage.getItem(DB_CURRENT); 
      if(!cur){avatarEl.style.background='#000'; avatarEl.textContent=''; return}
      const a = loadAccounts().find(x=>x.code===cur);
      if(!a){avatarEl.style.background='#000'; avatarEl.textContent=''; return}
      if(a.avatar){avatarEl.style.background='url('+a.avatar+') center/cover no-repeat'; avatarEl.textContent=''} 
      else{avatarEl.style.background='#222'; avatarEl.textContent=(a.first[0]||'').toUpperCase()+(a.last[0]||'').toUpperCase()}
  }

  avatarEl.addEventListener('click', ()=>{
      const cur=localStorage.getItem(DB_CURRENT);
      if(!cur){authModal.style.display='flex'} 
      else{alert('Open menu here (to implement)');}
  });

});
