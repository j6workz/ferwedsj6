import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, orderBy, limit, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAt20QdTZTO0bTW06Qu8ln-Nxzklwf1p7o",
  authDomain: "rendezvous-now.firebaseapp.com",
  projectId: "rendezvous-now",
  storageBucket: "rendezvous-now.firebasestorage.app",
  messagingSenderId: "615898334762",
  appId: "1:615898334762:web:8ab7c05a746d2e81d7a553"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('rsvpSubmit');
const status = document.getElementById('rsvpStatus');
const wishesList = document.getElementById('wishesList');
const countYesEl = document.getElementById('countYes');
const countNoEl = document.getElementById('countNo');

function escapeHtml(str){
  return str.replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function renderWishes(docs){
  const t = window.i18nText || ((k) => k);
  if (!docs.length){
    wishesList.innerHTML = `<div class="wishes-empty">${escapeHtml(t('rsvp.empty'))}</div>`;
    return;
  }
  let yes = 0, no = 0;
  const html = docs.map((d) => {
    if (d.attending === 'yes') yes += Math.max(1, d.guests || 1); else no++;
    const tagClass = d.attending === 'yes' ? 'yes' : 'no';
    const tagText = d.attending === 'yes' ? t('rsvp.countYes') : t('rsvp.countNo');
    const msg = (d.message || '').trim();
    return `<div class="wish">
      <div class="name">${escapeHtml(d.name || '')}<span class="tag ${tagClass}">${escapeHtml(tagText)}</span></div>
      ${msg ? `<div class="msg">${escapeHtml(msg)}</div>` : ''}
    </div>`;
  }).join('');
  wishesList.innerHTML = html;
  if (countYesEl) countYesEl.textContent = String(yes);
  if (countNoEl) countNoEl.textContent = String(no);
}

try {
  const wishesQuery = query(collection(db, 'wishes'), orderBy('submitted_at', 'desc'), limit(40));
  onSnapshot(wishesQuery, (snap) => {
    const docs = [];
    snap.forEach((doc) => docs.push(doc.data()));
    renderWishes(docs);
  }, () => {
    renderWishes([]);
  });
} catch (e) {
  renderWishes([]);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const name = (fd.get('name') || '').toString().trim();
  const attending = fd.get('attending');
  const guestsRaw = (fd.get('guests') || '').toString().trim();
  const guests = guestsRaw ? Math.max(0, Math.min(20, parseInt(guestsRaw, 10) || 0)) : (attending === 'yes' ? 1 : 0);
  const phone = (fd.get('phone') || '').toString().trim();
  const message = (fd.get('message') || '').toString().trim();

  if (!name || !attending) return;

  const t = window.i18nText || ((k) => k);
  submitBtn.disabled = true;
  submitBtn.textContent = t('rsvp.submitting');
  status.className = 'rsvp-status';

  try {
    await addDoc(collection(db, 'wishes'), {
      name, attending, guests, message,
      source: 'v4',
      submitted_at: serverTimestamp()
    });
    if (phone) {
      await addDoc(collection(db, 'rsvp_contacts'), {
        name, phone, source: 'v4', submitted_at: serverTimestamp()
      });
    }
    form.reset();
    form.style.display = 'none';
    status.textContent = t(attending === 'yes' ? 'rsvp.thanks.yes' : 'rsvp.thanks.no').replace('{name}', name);
    status.classList.add('show', 'ok');
  } catch (err) {
    status.textContent = t('rsvp.error');
    status.classList.add('show', 'err');
    submitBtn.disabled = false;
    submitBtn.textContent = t('rsvp.submit');
  }
});
