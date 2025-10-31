// Storage keys
const DB_ACCOUNTS = 'my_portal_accounts_v2';
const DB_CURRENT = 'my_portal_current_v2';
const DB_GLOBALPOSTS = 'my_portal_posts_v2';

// Load & Save
function loadAccounts() { try { return JSON.parse(localStorage.getItem(DB_ACCOUNTS)||'[]'); } catch(e){return []} }
function saveAccounts(a) { localStorage.setItem(DB_ACCOUNTS,JSON.stringify(a)); }
function loadPosts() { try { return JSON.parse(localStorage.getItem(DB_GLOBALPOSTS)||'[]'); } catch(e){return []} }
function savePosts(p) { localStorage.setItem(DB_GLOBALPOSTS,JSON.stringify(p)); }

// Avatar & Auth Elements
const avatarEl = document.getElementById('avatar');
const avatarMenu = document.getElementById('avatarMenu');
const authModal = document.getElementById('authModal');
const fakeGoogle = document.getElementById('fakeGoogle');
const nameForm = document.getElementById('nameForm');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const avatarUpload = document.getElementById('avatarUpload');
const createAcc = document.getElementById('createAcc');
const cancelAuth = document.getElementById('cancelAuth');
let tempAvatarData = null;

// Avatar upload preview
avatarUpload.addEventListener('change', e => {
  const f = e.target.files[0]; 
  if(!f) return; 
  const r = new FileReader(); 
  r.onload = ()=> { tempAvatarData = r.result; }; 
  r.readAsDataURL(f);
});

// Show name form
fakeGoogle.addEventListener('click', ()=> {
  nameForm.style.display='block'; 
  fakeGoogle.style.display='none';
});
cancelAuth.addEventListener('click', ()=> {
  authModal.style.display='none'; 
  fakeGoogle.style.display='block'; 
  nameForm.style.display='none';
});

// Generate random 10-digit code
function rand10(){let s=''; while(s.length<10){s+=Math.floor(Math.random()*10)} return s;}
function uniqueCode(){const a=loadAccounts(); let c=rand10(); while(a.find(x=>x.code===c)) c=rand10(); return c;}

// Create account
createAcc.addEventListener('click', ()=>{
  const fn = firstName.value.trim(), ln = lastName.value.trim();
  if(!fn || !ln){alert('Please enter first and last name'); return;}
  const acc = {code:uniqueCode(), first:fn, last:ln, avatar:tempAvatarData||null, posts:[]};
  const accs = loadAccounts(); accs.push(acc); saveAccounts(accs);
  localStorage.setItem(DB_CURRENT, acc.code);
  authModal.style.display='none'; fakeGoogle.style.display='block'; nameForm.style.display='none';
  tempAvatarData=null; firstName.value=''; lastName.value=''; avatarUpload.value=null;
  alert('Account created! Your code: '+acc.code);
  renderAvatar(); renderFeed();
});

// Avatar click & menu
avatarEl.addEventListener('click', ()=>{
  const cur = localStorage.getItem(DB_CURRENT);
  if(!cur){ authModal.style.display='flex'; }
  else { toggleMenu(); }
});
function toggleMenu(){ if(avatarMenu.style.display==='block'){avatarMenu.style.display='none';} 
  else { buildMenu(); avatarMenu.style.display='block'; } }
function buildMenu(){
  avatarMenu.innerHTML=''; 
  const cur = localStorage.getItem(DB_CURRENT);
  if(!cur){ avatarMenu.innerHTML='<a href="#" id="mLogin">Login / Sign Up</a>';
    document.getElementById('mLogin').onclick=(e)=>{e.preventDefault();authModal.style.display='flex';avatarMenu.style.display='none'};
    return;
  }
  const a = loadAccounts().find(x=>x.code===cur);
  if(!a){localStorage.removeItem(DB_CURRENT); renderAvatar(); return;}
  const posts = document.createElement('a'); posts.href='#'; posts.textContent='Posts'; posts.onclick=(e)=>{e.preventDefault(); openView(a); avatarMenu.style.display='none';};
  const newPost = document.createElement('a'); newPost.href='#'; newPost.textContent='New Post'; newPost.onclick=(e)=>{e.preventDefault(); openPostModal(); avatarMenu.style.display='none';};
  const friends = document.createElement('a'); friends.href='#'; friends.textContent='Friends'; friends.onclick=(e)=>{e.preventDefault(); alert('Friends section (prototype)'); avatarMenu.style.display='none';};
  const logout = document.createElement('a'); logout.href='#'; logout.textContent='Logout'; logout.onclick=(e)=>{e.preventDefault(); localStorage.removeItem(DB_CURRENT); renderAvatar(); avatarMenu.style.display='none'; renderFeed();};
  avatarMenu.appendChild(posts); avatarMenu.appendChild(newPost); avatarMenu.appendChild(friends); avatarMenu.appendChild(logout);
}

// Render avatar
function renderAvatar(){
  const cur = localStorage.getItem(DB_CURRENT); 
  if(!cur){avatarEl.style.background='#000'; avatarEl.textContent=''; return;}
  const a = loadAccounts().find(x=>x.code===cur);
  if(!a){avatarEl.style.background='#000'; avatarEl.textContent=''; return;}
  if(a.avatar){avatarEl.style.background='url('+a.avatar+') center/cover no-repeat'; avatarEl.textContent='';}
  else{avatarEl.style.background='#222'; avatarEl.textContent=(a.first[0]||'').toUpperCase()+(a.last[0]||'').toUpperCase();}
}

// Post modal
const postModal = document.getElementById('postModal');
const postType = document.getElementById('postType');
const eventFields = document.getElementById('eventFields');
const postImage = document.getElementById('postImage');
const postTitle = document.getElementById('postTitle');
const postDesc = document.getElementById('postDesc');
const eventName = document.getElementById('eventName');
const eventPlace = document.getElementById('eventPlace');
const savePost = document.getElementById('savePost');
const cancelPost = document.getElementById('cancelPost');
let tempPostImage = null;

postImage.addEventListener('change', e=>{const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{tempPostImage=r.result}; r.readAsDataURL(f);});
postType.addEventListener('change', ()=>{ if(postType.value==='event'){eventFields.style.display='block'; postTitle.placeholder='Headline (for news) — optional';} else{eventFields.style.display='none'; postTitle.placeholder='Title (for news)';}});

function openPostModal(){const cur=localStorage.getItem(DB_CURRENT); if(!cur){alert('Please login first'); return;} postModal.style.display='flex';}
cancelPost.addEventListener('click', ()=>{postModal.style.display='none'; clearPostForm();});

savePost.addEventListener('click', ()=>{
  const cur = localStorage.getItem(DB_CURRENT); if(!cur){alert('Please login first'); return;}
  const accounts = loadAccounts(); const accIdx = accounts.findIndex(x=>x.code===cur); if(accIdx<0){alert('Account not found'); return;}
  const type = postType.value; const title = postTitle.value.trim(); const desc = postDesc.value.trim();
  const eName = eventName.value.trim(); const place = eventPlace.value.trim();
  if(type==='news' && !desc && !title){alert('Description or title needed'); return;}
  if(type==='event' && !eName && !desc){alert('Event name or description needed'); return;}
  const post={id:Date.now().toString(), author:cur, type:type, title:title, desc:desc, eventName:eName, eventPlace:place, image:tempPostImage||null, ts:new Date().toISOString()};
  const posts = loadPosts(); posts.unshift(post); savePosts(posts);
  accounts[accIdx].posts.unshift(post); saveAccounts(accounts);
  postModal.style.display='none'; clearPostForm(); renderFeed();
});

function clearPostForm(){postImage.value=null; postTitle.value=''; postDesc.value=''; eventName.value=''; eventPlace.value=''; tempPostImage=null;}

// View others' posts
const viewBtn = document.getElementById('viewBtn');
const viewModal = document.getElementById('viewModal');
const viewFeed = document.getElementById('viewFeed');
const closeView = document.getElementById('closeView');

viewBtn.addEventListener('click', ()=>{
  const code = document.getElementById('viewCode').value.trim(); 
  if(!code){alert('Enter code'); return;}
  const acc = loadAccounts().find(x=>x.code===code); if(!acc){alert('Account not found'); return;}
  openView(acc);
});

function openView(acc){
  viewFeed.innerHTML=''; viewModal.style.display='flex';
  viewTitle.textContent='Posts of '+acc.first+' '+acc.last+' — ('+acc.code+')';
  const posts = acc.posts||[]; 
  if(posts.length===0){viewFeed.innerHTML='<div class="hint">No posts</div>'} 
  else{posts.forEach(p=>{viewFeed.appendChild(renderPostElement(p));});}
}
closeView.addEventListener('click', ()=>{viewModal.style.display='none';});

// Render feed
const feedEl = document.getElementById('feed');
function renderFeed(){
  feedEl.innerHTML=''; const posts=loadPosts();
  const news = posts.filter(p=>p.type==='news'); const events = posts.filter(p=>p.type==='event');
  if(news.length===0 && events.length===0){feedEl.innerHTML='<div class="card">No posts yet</div>'; return;}
  if(news.length){ const h=document.createElement('div'); h.className='small'; h.textContent='News'; feedEl.appendChild(h); news.forEach(p=>feedEl.appendChild(renderPostElement(p))); }
  if(events.length){ const h=document.createElement('div'); h.className='small'; h.style.marginTop='12px'; h.textContent='Events'; feedEl.appendChild(h); events.forEach(p=>feedEl.appendChild(renderPostElement(p))); }
}

// Post layout
function renderPostElement(p){
  const card=document.createElement('div'); card.className='card';
  const head=document.createElement('div'); head.className='post-head';
  const authorWrap=document.createElement('div'); authorWrap.className='post-author';
  const a = loadAccounts().find(x=>x.code===p.author) || {first:'User',last:'',avatar:null};
  const mini=document.createElement('div'); mini.className='mini-avatar'; if(a.avatar){mini.style.background='url('+a.avatar+') center/cover no-repeat';} else{mini.textContent=(a.first[0]||'').toUpperCase();}
  const titleBlock=document.createElement('div');
  const title=document.createElement('div'); title.className='post-title'; title.textContent = p.type==='event' ? (p.eventName||'Unnamed Event') : (p.title||'No title');
  const meta=document.createElement('div'); meta.className='small'; meta.textContent = a.first+' '+a.last+' • '+(new Date(p.ts)).toLocaleString('en-US');
  titleBlock.appendChild(title); titleBlock.appendChild(meta);
  authorWrap.appendChild(mini); authorWrap.appendChild(titleBlock);
  head.appendChild(authorWrap); card.appendChild(head);
  if(p.image){const im=document.createElement('img'); im.className='post-image'; im.src=p.image; card.appendChild(im);}
  const desc=document.createElement('div'); desc.className='post-desc'; desc.textContent=p.desc||''; card.appendChild(desc);
  if(p.type==='event'){const evInfo=document.createElement('div'); evInfo.className='small'; evInfo.style.marginTop='8px'; evInfo.textContent='Place: '+(p.eventPlace||'—'); card.appendChild(evInfo);}
  return card;
}

// Init app
function initApp(){
  renderAvatar(); renderFeed();
  document.addEventListener('click',(e)=>{if(!avatarMenu.contains(e.target) && e.target!==avatarEl) avatarMenu.style.display='none';});
  // nav buttons
  document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active')); 
    b.classList.add('active'); 
    if(b.dataset.tab==='news'){renderFeed();} 
    else {renderOnlyEvents();}
  }));
}
function renderOnlyEvents(){feedEl.innerHTML=''; const posts=loadPosts(); const events = posts.filter(p=>p.type==='event'); const h = document.createElement('div'); h.className='small'; h.textContent='Events'; feedEl.appendChild(h); if(events.length===0){feedEl.appendChild(Object.assign(document.createElement('div'),{className:'card',textContent:'No events'})); return;} events.forEach(p=>feedEl.appendChild(renderPostElement(p));)}

// Seed empty posts if none
(function seed(){if(localStorage.getItem(DB_GLOBALPOSTS)) return; savePosts([]);})();

window.onload=initApp;
