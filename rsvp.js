import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp
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

// RSVP alert: a Google Apps Script relay (tools/rsvp-telegram.gs) under Jawahar's account sends it to Telegram and
// copies it to a Google Sheet. The bot token lives only there, never in this page. Fire-and-forget: Firestore is
// the record; if the alert fails the guest still sees the thank-you.
const NOTIFY_URL = 'https://script.google.com/macros/s/AKfycbw922XOvv9O8FceqwEKQRaip21QJXJUqPQr0iMZN0icE6osr7uhCWnlNdtBwMSGGy_y/exec';
function notify(data){
  try {
    fetch(NOTIFY_URL, { method: 'POST', mode: 'no-cors', keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // "simple" request: no CORS preflight
      body: JSON.stringify(data) }).catch(() => {});
  } catch (e) {}
}

const form = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('rsvpSubmit');
const status = document.getElementById('rsvpStatus');

// Guests only send; other guests' wishes are never shown or read (Firestore rules deny reads too).

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const name = (fd.get('name') || '').toString().trim();
  const attending = fd.get('attending');
  const guestsRaw = (fd.get('guests') || '').toString().trim();
  // stepper gives 1–10; someone who can't attend brings no guests
  const guests = attending === 'yes' ? Math.max(1, Math.min(10, parseInt(guestsRaw, 10) || 1)) : 0;
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
    const page = (location.pathname.replace(/\/|\.html$/g, '') || 'main') + ' · ' + (document.documentElement.lang || '');
    notify({ name, attending, guests, message, phone, page });
    // thank-you replaces the form for a few seconds, then the form fades back in, reset, for the next response
    form.reset();
    form.classList.add('hidden');
    status.textContent = t(attending === 'yes' ? 'rsvp.thanks.yes' : 'rsvp.thanks.no').replace('{name}', name);
    status.className = 'rsvp-status show ok';
    setTimeout(() => {
      status.className = 'rsvp-status';
      submitBtn.disabled = false;
      submitBtn.textContent = t('rsvp.submit');
      form.classList.add('fade'); form.classList.remove('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => form.classList.remove('fade')));
    }, 5000);
  } catch (err) {
    status.textContent = t('rsvp.error');
    status.classList.add('show', 'err');
    submitBtn.disabled = false;
    submitBtn.textContent = t('rsvp.submit');
  }
});
