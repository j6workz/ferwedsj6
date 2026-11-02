(function(){
  const STRINGS = {
    id: {
      'cover.dear': 'Kepada Yth. Bapak/Ibu/Saudara/i',
      'invite.body': 'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami.',
      'events.date': 'Rabu, 11 November 2026',
      'events.time': 'Pukul', 'events.place': 'Tempat',
      'events.akad.time': '11.00 WIB', 'events.reception.time': '12.00 – 15.00 WIB',
      'gallery.title': 'Galeri',
      'gift.title': 'Amplop Digital',
      'rsvp.title': 'Ucapkan Sesuatu', 'rsvp.sub': 'Berikan Ucapan & Doa Restu',
      'closing.signoff': 'Kami yang berbahagia,',
      'footer.made': 'Dibuat dengan cinta oleh J6 & Fer',
      'desk.date': 'Rabu, 11 . 11 . 2026',
      'doc.title': 'The Wedding of Jawahar & Ferina',
      'cover.to': 'Bapak/Ibu/Saudara/i',
      'cover.guestFallback': 'Tamu Undangan',
      'cover.note': 'Mohon maaf bila ada kesalahan penulisan nama/gelar',
      'cover.open': 'Buka Undangan',
      'hero.eyebrow': 'Dengan restu kedua keluarga',
      'verse.translation': '"Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."',
      'verse.citation': 'QS. Ar-Rūm : 21',
      'verse.formal': 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami.',
      'couple.eyebrow': 'Mempelai',
      'couple.title': 'Bride & Groom',
      'profile.groom.role': 'Mempelai Pria',
      'profile.groom.parents': 'Putra dari Bapak [nama] & Ibu [nama]',
      'profile.bride.role': 'Mempelai Wanita',
      'profile.bride.parents': 'Putri dari Bapak [nama] & Ibu [nama]',
      'countdown.eyebrow': 'Save the Date',
      'countdown.title': 'Menuju Hari Bahagia',
      'countdown.calendar': 'Simpan ke Kalender',
      'footer.days': 'HARI', 'footer.hours': 'JAM', 'footer.mins': 'MENIT', 'footer.secs': 'DETIK',
      'events.eyebrow': 'Rangkaian Acara',
      'events.heading': 'Acara Pernikahan',
      'events.akad.title': 'Akad Nikah',
      'events.reception.title': 'Resepsi',
      'events.day': 'Rabu',
      'events.month': 'Nov',
      'events.mapBtn': 'Lihat Lokasi',
      'story.eyebrow': 'Kisah Kami',
      'story.heading': 'Love Story',
      'ch1.eyebrow': 'Bab Satu', 'ch1.title': 'Pertemuan yang Hampir Tak Terjadi',
      'ch1.body': 'Kami bertemu lewat aplikasi kencan — tapi dia ragu untuk bertemu orang asing. Jadi aku meneleponnya, dan perlahan meyakinkannya untuk bilang iya.',
      'ch2.title': 'Akhirnya Kami Bertemu',
      'ch2.body': 'Yang awalnya hanya pertemuan biasa menjadi awal dari segalanya. Sejak itu, kami menganggapnya hari pertama kami.',
      'ch3.eyebrow': 'Minggu-minggu setelahnya', 'ch3.title': 'Jatuh Cinta',
      'ch3.body': 'Kami terus bertemu. Entah sejak kapan, tanpa kami sadari, kami sudah jatuh cinta.',
      'ch4.eyebrow': 'Setiap akhir pekan', 'ch4.title': 'Dapur Akhir Pekan Kami',
      'ch4.body': 'Setiap akhir pekan dia datang ke Kuala Lumpur dan kami memasak bersama. Dia pandai membuat kue dan roti — aku jadi sedikit gemuk karena cintanya, dan tidak menyesal sama sekali.',
      'ch5.eyebrow': 'Agustus 2025 · Malaysia', 'ch5.title': 'Kunang-kunang & KuaCham',
      'ch5.body': 'Suatu malam kami pergi melihat kunang-kunang — dan pulang membawa kucing penyelamatan pertama kami, seekor calico bernama KuaCham.',
      'ch6.eyebrow': 'Enam bulan kemudian', 'ch6.title': 'Bertemu Keluarga dari Jauh',
      'ch6.body': 'Aku mengenalkan Ferina kepada keluargaku di India lewat panggilan video — jauh secara jarak, namun dekat di hati.',
      'ch7.eyebrow': 'Des 2025 – Jul 2026', 'ch7.title': 'Keluarga Kami Bertambah',
      'ch7.body': 'Jessy datang, lalu Creamy, lalu Yuzu — empat kucing, satu rumah, cinta tanpa batas.',
      'ch8.eyebrow': 'September 2026 · India', 'ch8.title': 'Akhirnya, Pulang',
      'ch8.body': 'Aku membawa Ferina ke India untuk syukuran rumah baruku, dan dia bertemu keluargaku untuk pertama kalinya. Semua jatuh hati padanya — saat itulah kami tahu, sudah waktunya.',
      'gallery.eyebrow': 'Galeri',
      'gallery.heading': 'Taman Kami',
      'gift.eyebrow': 'Tanda Kasih',
      'gift.heading': 'Wedding Gift',
      'gift.body': 'Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi adalah ungkapan tanda kasih, Anda dapat memberi kado secara cashless.',
      'gift.copy': 'Salin Nomor Rekening', 'gift.copied': 'Tersalin!',
      'rsvp.eyebrow': 'Mohon konfirmasi sebelum 8 November',
      'rsvp.heading': 'Wishes & RSVP',
      'rsvp.lead': 'Beri tahu kami jika Anda bisa hadir, dan tinggalkan doa untuk kami.',
      'rsvp.countYes': 'Hadir', 'rsvp.countNo': 'Tidak Hadir',
      'rsvp.name.label': 'Nama', 'rsvp.name.placeholder': 'Nama Anda',
      'rsvp.attending.label': 'Konfirmasi kehadiran',
      'rsvp.attending.yes': 'Hadir', 'rsvp.attending.no': 'Tidak bisa hadir',
      'rsvp.guests.label': 'Jumlah tamu', 'rsvp.guests.placeholder': 'misalnya 2',
      'rsvp.phone.label': 'Telepon / WhatsApp', 'rsvp.phone.placeholder': 'Opsional',
      'rsvp.message.label': 'Ucapan & doa', 'rsvp.message.placeholder': 'Tulis ucapan untuk kami...',
      'rsvp.submit': 'Kirim', 'rsvp.submitting': 'Mengirim...',
      'rsvp.note': 'Nomor telepon hanya terlihat oleh kami.',
      'rsvp.loading': 'Memuat ucapan...', 'rsvp.empty': 'Jadilah yang pertama mengirim ucapan!',
      'rsvp.thanks.yes': 'Terima kasih, {name}! Kami tidak sabar merayakan bersama Anda. 🤍',
      'rsvp.thanks.no': 'Terima kasih sudah memberi tahu kami, {name}. Anda akan dirindukan!',
      'rsvp.error': 'Maaf, terjadi kesalahan — silakan coba lagi.',
      'closing.eyebrow': 'Terima Kasih',
      'closing.body': 'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.'
    },
    en: {
      'cover.dear': 'Dear',
      'invite.body': 'With the utmost respect, we invite you, your family and friends to join us at our wedding celebration.',
      'events.date': 'Wednesday, 11 November 2026',
      'events.time': 'Time', 'events.place': 'Venue',
      'events.akad.time': '11:00 WIB', 'events.reception.time': '12:00 – 15:00 WIB',
      'gallery.title': 'Gallery',
      'gift.title': 'Digital Gift',
      'rsvp.title': 'Send Your Wishes', 'rsvp.sub': 'Share your wishes & prayers',
      'closing.signoff': 'With love,',
      'footer.made': 'Made with love by J6 & Fer',
      'desk.date': 'Wednesday, 11 . 11 . 2026',
      'doc.title': 'The Wedding of Jawahar & Ferina',
      'cover.to': 'Dear',
      'cover.guestFallback': 'Honoured Guest',
      'cover.note': 'Please forgive any misspelling of your name or title',
      'cover.open': 'Open Invitation',
      'hero.eyebrow': 'With the blessings of our families',
      'verse.translation': '"And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He placed between you affection and mercy."',
      'verse.citation': "Qur'an, Ar-Rūm 30:21",
      'verse.formal': "With prayers for Allah's mercy and blessing, we warmly invite you to celebrate our wedding.",
      'couple.eyebrow': 'The Couple',
      'couple.title': 'Bride & Groom',
      'profile.groom.role': 'The Groom',
      'profile.groom.parents': 'Son of Mr. [name] & Mrs. [name]',
      'profile.bride.role': 'The Bride',
      'profile.bride.parents': 'Daughter of Mr. [name] & Mrs. [name]',
      'countdown.eyebrow': 'Save the Date',
      'countdown.title': 'Counting the Days',
      'countdown.calendar': 'Save to Calendar',
      'footer.days': 'DAYS', 'footer.hours': 'HOURS', 'footer.mins': 'MINUTES', 'footer.secs': 'SECONDS',
      'events.eyebrow': 'The Celebrations',
      'events.heading': 'Wedding Events',
      'events.akad.title': 'Akad Nikah',
      'events.reception.title': 'Reception',
      'events.day': 'Wednesday',
      'events.month': 'Nov',
      'events.mapBtn': 'View Location',
      'story.eyebrow': 'Our Story',
      'story.heading': 'Love Story',
      'ch1.eyebrow': 'Chapter One', 'ch1.title': 'A Match, Almost Missed',
      'ch1.body': "We matched on a dating app — but she wasn't sure about meeting a stranger. So I called her, and gently talked her into saying yes.",
      'ch2.title': 'We Finally Met',
      'ch2.body': "What began as a simple meeting became the start of everything. We've counted it as our day one ever since.",
      'ch3.eyebrow': 'The weeks after', 'ch3.title': 'Falling in Love',
      'ch3.body': 'We kept meeting. Somewhere in those weeks, without either of us saying it, we had already fallen in love.',
      'ch4.eyebrow': 'Every weekend', 'ch4.title': 'Our Weekend Kitchen',
      'ch4.body': "Every weekend she'd come over to Kuala Lumpur and we'd cook together. She bakes the best cakes and bread — I've gotten a little (sikit) fat on her love, and I regret nothing.",
      'ch5.eyebrow': 'August 2025 · Malaysia', 'ch5.title': 'Fireflies & KuaCham',
      'ch5.body': 'We went out one night to watch fireflies — and came home with our first rescue, a calico we named KuaCham.',
      'ch6.eyebrow': 'Six months in', 'ch6.title': 'Meeting Family from Afar',
      'ch6.body': 'I introduced Ferina to my family in India over a video call — far in distance, close at heart.',
      'ch7.eyebrow': 'Dec 2025 – Jul 2026', 'ch7.title': 'Our Family Grew',
      'ch7.body': 'Jessy joined us, then Creamy, then Yuzu — four cats, one home, endless love.',
      'ch8.eyebrow': 'September 2026 · India', 'ch8.title': 'Home, at Last',
      'ch8.body': "I brought Ferina to India for my housewarming, and she met my family for the first time. Everyone fell for her — that's when we knew it was time.",
      'gallery.eyebrow': 'Gallery',
      'gallery.heading': 'Our Garden',
      'gift.eyebrow': 'A Token of Love',
      'gift.heading': 'Wedding Gift',
      'gift.body': "Your prayers and blessings mean the world to us. But if you'd like to send a gift, you're welcome to do so cashlessly.",
      'gift.copy': 'Copy Account Number', 'gift.copied': 'Copied!',
      'rsvp.eyebrow': 'Kindly respond by 8 November',
      'rsvp.heading': 'Wishes & RSVP',
      'rsvp.lead': "Let us know if you'll be able to join us, and leave us a wish.",
      'rsvp.countYes': 'Attending', 'rsvp.countNo': "Can't Attend",
      'rsvp.name.label': 'Name', 'rsvp.name.placeholder': 'Your name',
      'rsvp.attending.label': 'Will you attend?',
      'rsvp.attending.yes': 'Attending', 'rsvp.attending.no': "Can't make it",
      'rsvp.guests.label': 'Number of guests', 'rsvp.guests.placeholder': 'e.g. 2',
      'rsvp.phone.label': 'Phone / WhatsApp', 'rsvp.phone.placeholder': 'Optional',
      'rsvp.message.label': 'Wishes & prayers', 'rsvp.message.placeholder': 'Leave us a note...',
      'rsvp.submit': 'Send', 'rsvp.submitting': 'Sending...',
      'rsvp.note': 'Phone numbers are only visible to us.',
      'rsvp.loading': 'Loading wishes...', 'rsvp.empty': 'Be the first to leave a wish!',
      'rsvp.thanks.yes': "Thank you, {name}! We can't wait to celebrate with you. 🤍",
      'rsvp.thanks.no': "Thank you for letting us know, {name}. You'll be missed!",
      'rsvp.error': 'Something went wrong — please try again.',
      'closing.eyebrow': 'Thank You',
      'closing.body': 'It would be our joy and honour to have you with us, and to receive your prayers and blessings.'
    }
  };

  let currentLocale = 'id';
  function t(key){ return (STRINGS[currentLocale] && STRINGS[currentLocale][key]) || STRINGS.id[key] || key; }
  window.i18nText = t;

  function applyLocale(lang){
    if (!STRINGS[lang]) lang = 'id';
    currentLocale = lang;
    document.documentElement.lang = lang;
    document.title = t('doc.title');
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'))); });
    document.querySelectorAll('.lang-toggle button').forEach((btn) => { btn.classList.toggle('active', btn.getAttribute('data-lang') === lang); });
    const guestNameEl = document.getElementById('guestName');
    if (guestNameEl && !window.nikahGuestName) guestNameEl.textContent = t('cover.guestFallback');
    document.dispatchEvent(new CustomEvent('nikah:locale', { detail: lang }));
  }

  document.querySelectorAll('.lang-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLocale(btn.getAttribute('data-lang'));
      try { localStorage.setItem('nikah_locale', btn.getAttribute('data-lang')); } catch (e) {}
    });
  });

  window.nikahGuestName = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 80);

  let saved = null;
  try { saved = localStorage.getItem('nikah_locale'); } catch (e) {}
  if (saved === 'en' || saved === 'id') {
    applyLocale(saved);
  } else {
    const browserLang = (navigator.language || 'id').toLowerCase();
    applyLocale(browserLang.startsWith('id') || browserLang.startsWith('ms') ? 'id' : 'en');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    fetch('https://get.geojs.io/v1/ip/country.json', { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { clearTimeout(timer); if (d && d.country === 'ID') applyLocale('id'); })
      .catch(() => {});
  }
})();
