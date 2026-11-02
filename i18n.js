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
      'cover.guestFallback': 'Tamu Undangan',
      'cover.note': 'Mohon maaf bila ada kesalahan penulisan nama/gelar',
      'cover.open': 'Buka Undangan',
      'cover.hint': 'atau gulir ke bawah',
      'hero.eyebrow': 'Dengan restu kedua keluarga',
      'verse.translation': '"Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."',
      'verse.citation': 'QS. Ar-Rūm : 21',
      'kural.translation': '"Bila kehidupan berumah tangga dipenuhi cinta dan kebajikan, itulah keindahan sekaligus buahnya."',
      'kural.citation': 'Thirukkural 45 · Ilvāzhkkai',
      'verse.formal': 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami.',
      'couple.eyebrow': 'Mempelai',
      'couple.title': 'Bride & Groom',
      'profile.groom.role': 'Mempelai Pria',
      'profile.groom.parents': 'Putra dari Alm. Bapak Mariselvam & Ibu Subbulakshmi',
      'profile.bride.role': 'Mempelai Wanita',
      'profile.bride.parents': 'Putri dari Alm. Bapak Feru Firmansyah & Almh. Ibu Maryanah',
      'countdown.eyebrow': 'Save the Date',
      'countdown.title': 'Menuju Hari Bahagia',
      'countdown.today': 'Hari Ini Harinya!', 'countdown.todaySub': 'Kami menikah hari ini. Terima kasih atas doa Anda.',
      'countdown.done': 'Alhamdulillah, Resmi!', 'countdown.doneSub': 'Kami telah resmi menjadi suami istri. Terima kasih atas doa dan restunya.',
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
      'gift.copy': 'Salin Nomor Rekening', 'gift.copied': 'Tersalin!', 'gift.copyWallet': 'Salin Nomor', 'gift.swipe': 'Geser untuk rekening lainnya',
      'gift.accountNo': 'No. Rekening', 'gift.walletNo': 'No. eWallet', 'gift.showQR': 'QR', 'gift.showNumber': 'Nomor', 'gift.downloadQR': 'Unduh QR',
      'gift.qrHint': 'Pindai dengan aplikasi bank atau eWallet Malaysia mana pun',
      'gift.upiId': 'UPI ID', 'gift.copyUpi': 'Salin UPI ID', 'gift.upiHint': 'Pindai dengan aplikasi UPI India mana pun',
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
      'rsvp.note': 'Ucapan dan nomor telepon Anda hanya kami yang bisa melihat.',
      'rsvp.thanks.yes': 'Terima kasih, {name}! Kami tidak sabar merayakan bersama Anda. 🤍',
      'rsvp.thanks.no': 'Terima kasih sudah memberi tahu kami, {name}. Anda akan dirindukan!',
      'rsvp.error': 'Maaf, terjadi kesalahan — silakan coba lagi.',
      'closing.eyebrow': 'Terima Kasih',
      'closing.body': 'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.'
    },
    en: {
      'cover.weddingOf': 'The Wedding of',
      'names.couple': 'Jawahar & Ferina', 'names.groom': 'Jawahar Mariselvam', 'names.bride': 'Ferina Khansa Nabilah',
      'events.akad.venue': 'KUA Kecamatan Kemayoran', 'events.akad.addr': 'Jakarta Pusat, DKI Jakarta',
      'events.reception.venue': 'Ayda Hotel', 'events.reception.addr': 'Mangga Dua, Jakarta',
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
      'cover.guestFallback': 'Honoured Guest',
      'cover.note': 'Please forgive any misspelling of your name or title',
      'cover.open': 'Open Invitation',
      'cover.hint': 'or scroll down',
      'hero.eyebrow': 'With the blessings of our families',
      'verse.translation': '"And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He placed between you affection and mercy."',
      'verse.citation': "Qur'an, Ar-Rūm 30:21",
      'kural.translation': '"When married life is filled with love and virtue, that is its grace and its fruit."',
      'kural.citation': 'Thirukkural 45 · Ilvāzhkkai',
      'verse.formal': "With prayers for Allah's mercy and blessing, we warmly invite you to celebrate our wedding.",
      'couple.eyebrow': 'The Couple',
      'couple.title': 'Bride & Groom',
      'profile.groom.role': 'The Groom',
      'profile.groom.parents': 'Son of the late Mr. Mariselvam & Mrs. Subbulakshmi',
      'profile.bride.role': 'The Bride',
      'profile.bride.parents': 'Daughter of the late Mr. Feru Firmansyah & the late Mrs. Maryanah',
      'countdown.eyebrow': 'Save the Date',
      'countdown.title': 'Counting the Days',
      'countdown.today': "Today's the Day!", 'countdown.todaySub': "We're getting married today. Thank you for your prayers.",
      'countdown.done': 'Finally Official!', 'countdown.doneSub': "We're now husband and wife. Thank you for all your prayers and blessings.",
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
      'gift.copy': 'Copy Account Number', 'gift.copied': 'Copied!', 'gift.copyWallet': 'Copy Number', 'gift.swipe': 'Swipe for more',
      'gift.accountNo': 'Account No.', 'gift.walletNo': 'eWallet No.', 'gift.showQR': 'QR', 'gift.showNumber': 'Number', 'gift.downloadQR': 'Download QR',
      'gift.qrHint': 'Scan with any Malaysian banking app or eWallet',
      'gift.upiId': 'UPI ID', 'gift.copyUpi': 'Copy UPI ID', 'gift.upiHint': 'Scan with any Indian UPI app',
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
      'rsvp.note': 'Your wishes and phone number are only seen by us.',
      'rsvp.thanks.yes': "Thank you, {name}! We can't wait to celebrate with you. 🤍",
      'rsvp.thanks.no': "Thank you for letting us know, {name}. You'll be missed!",
      'rsvp.error': 'Something went wrong — please try again.',
      'closing.eyebrow': 'Thank You',
      'closing.body': 'It would be our joy and honour to have you with us, and to receive your prayers and blessings.'
    },
    ta: {
      'cover.weddingOf': 'திருமண அழைப்பிதழ்',
      'names.couple': 'ஜவஹர் & ஃபெரினா', 'names.groom': 'ஜவஹர் மாரிசெல்வம்', 'names.bride': 'ஃபெரினா கன்ஸா நபிலா',
      'events.akad.venue': 'கெமயோரான் மத விவகார அலுவலகம் (KUA)', 'events.akad.addr': 'மத்திய ஜகார்த்தா, ஜகார்த்தா, இந்தோனேசியா',
      'events.reception.venue': 'அய்டா ஹோட்டல்', 'events.reception.addr': 'மங்கா துவா, ஜகார்த்தா, இந்தோனேசியா',
      'cover.dear': 'அன்புடையீர்',
      'invite.body': 'மிகுந்த மரியாதையுடன், உங்களையும் உங்கள் குடும்பத்தினரையும் நண்பர்களையும் எங்கள் திருமண விழாவிற்கு அன்புடன் அழைக்கிறோம்.',
      'events.date': 'புதன், 11 நவம்பர் 2026',
      'events.time': 'நேரம்', 'events.place': 'இடம்',
      'events.akad.time': 'காலை 11:00 (WIB)', 'events.reception.time': 'மதியம் 12:00 – 3:00 (WIB)',
      'gallery.title': 'புகைப்படங்கள்',
      'gift.title': 'டிஜிட்டல் அன்பளிப்பு',
      'rsvp.title': 'வாழ்த்துங்கள்', 'rsvp.sub': 'உங்கள் வாழ்த்துகளையும் பிரார்த்தனைகளையும் பகிருங்கள்',
      'closing.signoff': 'அன்புடன்,',
      'footer.made': 'J6 & Fer அன்புடன் உருவாக்கியது',
      'desk.date': 'புதன்கிழமை, 11 . 11 . 2026',
      'doc.title': 'ஜவஹர் & ஃபெரினா திருமணம்',
      'cover.guestFallback': 'மதிப்பிற்குரிய விருந்தினர்',
      'cover.note': 'உங்கள் பெயரிலோ பட்டத்திலோ பிழை இருப்பின் மன்னிக்கவும்',
      'cover.open': 'அழைப்பிதழைத் திறக்க',
      'cover.hint': 'அல்லது கீழே உருட்டவும்',
      'hero.eyebrow': 'இரு குடும்பங்களின் ஆசியுடன்',
      'verse.translation': '"அவனுடைய அத்தாட்சிகளில் ஒன்று: நீங்கள் அமைதி பெறுவதற்காக உங்களிலிருந்தே உங்களுக்குத் துணைகளைப் படைத்து, உங்களுக்கிடையே அன்பையும் கருணையையும் ஏற்படுத்தியிருப்பது."',
      'verse.citation': 'திருக்குர்ஆன், அர்-ரூம் 30:21',
      'kural.translation': 'இல்லற வாழ்க்கை அன்பும் அறமும் உடையதாக இருந்தால், அதுவே அதன் பண்பும் பயனும் ஆகும்.',
      'kural.citation': 'திருக்குறள் 45 · இல்வாழ்க்கை',
      'verse.formal': 'அல்லாஹ்வின் அருளையும் கருணையையும் வேண்டி, எங்கள் திருமணத்திற்கு உங்களை அன்புடன் அழைக்கிறோம்.',
      'couple.eyebrow': 'மணமக்கள்',
      'couple.title': 'மணமகள் & மணமகன்',
      'profile.groom.role': 'மணமகன்',
      'profile.groom.parents': 'தெய்வத்திரு மாரிசெல்வம் – திருமதி. சுப்புலட்சுமி தம்பதியரின் மகன்',
      'profile.bride.role': 'மணமகள்',
      'profile.bride.parents': 'தெய்வத்திரு ஃபெரு ஃபிர்மான்ஷா – தெய்வத்திரு மரியானா தம்பதியரின் மகள்',
      'countdown.eyebrow': 'தேதியைக் குறித்துக்கொள்ளுங்கள்',
      'countdown.title': 'நாட்களை எண்ணுகிறோம்',
      'countdown.today': 'இன்றுதான் அந்த நாள்!', 'countdown.todaySub': 'இன்று எங்கள் திருமணம். உங்கள் பிரார்த்தனைகளுக்கு நன்றி.',
      'countdown.done': 'இனிதே நிறைவேறியது!', 'countdown.doneSub': 'நாங்கள் இப்போது கணவன் மனைவி. உங்கள் பிரார்த்தனைகளுக்கும் ஆசிகளுக்கும் நன்றி.',
      'countdown.calendar': 'நாட்காட்டியில் சேர்க்க',
      'footer.days': 'நாட்கள்', 'footer.hours': 'மணி', 'footer.mins': 'நிமிடம்', 'footer.secs': 'விநாடி',
      'events.eyebrow': 'விழா நிகழ்வுகள்',
      'events.heading': 'திருமண நிகழ்வுகள்',
      'events.akad.title': 'நிக்காஹ்',
      'events.reception.title': 'வரவேற்பு',
      'events.day': 'புதன்',
      'events.month': 'நவ',
      'events.mapBtn': 'இடத்தைப் பார்க்க',
      'story.eyebrow': 'எங்கள் கதை',
      'story.heading': 'காதல் கதை',
      'ch1.eyebrow': 'அத்தியாயம் ஒன்று', 'ch1.title': 'கை நழுவவிருந்த சந்திப்பு',
      'ch1.body': 'ஒரு டேட்டிங் செயலியில் எங்கள் பொருத்தம் அமைந்தது — ஆனால் முன்பின் தெரியாதவரைச் சந்திக்க அவள் தயங்கினாள். அதனால் நான் அவளை அழைத்துப் பேசி, மெல்ல மெல்ல சம்மதிக்க வைத்தேன்.',
      'ch2.title': 'இறுதியாக சந்தித்தோம்',
      'ch2.body': 'ஒரு சாதாரண சந்திப்பாகத் தொடங்கியது எல்லாவற்றின் தொடக்கமாக மாறியது. அன்று முதல் அதையே எங்கள் முதல் நாளாகக் கொண்டாடுகிறோம்.',
      'ch3.eyebrow': 'அடுத்த சில வாரங்கள்', 'ch3.title': 'காதலில் விழுந்தோம்',
      'ch3.body': 'நாங்கள் தொடர்ந்து சந்தித்தோம். அந்த வாரங்களில் எப்போதோ, யாரும் சொல்லாமலேயே, நாங்கள் காதலில் விழுந்திருந்தோம்.',
      'ch4.eyebrow': 'ஒவ்வொரு வார இறுதியும்', 'ch4.title': 'எங்கள் வார இறுதி சமையலறை',
      'ch4.body': 'ஒவ்வொரு வார இறுதியிலும் அவள் கோலாலம்பூர் வருவாள், நாங்கள் சேர்ந்து சமைப்போம். கேக்கும் ரொட்டியும் அவள் அருமையாகச் செய்வாள் — அவளின் அன்பால் நான் கொஞ்சம் (sikit) குண்டாகிவிட்டேன், அதில் எனக்கு வருத்தமே இல்லை.',
      'ch5.eyebrow': 'ஆகஸ்ட் 2025 · மலேசியா', 'ch5.title': 'மின்மினிப் பூச்சிகளும் KuaCham-உம்',
      'ch5.body': 'ஒரு இரவு மின்மினிப் பூச்சிகளைப் பார்க்கச் சென்றோம் — திரும்பி வரும்போது எங்கள் முதல் மீட்புப் பூனையான KuaCham என்ற காலிகோ பூனையுடன் வீடு திரும்பினோம்.',
      'ch6.eyebrow': 'ஆறு மாதங்களுக்குப் பிறகு', 'ch6.title': 'தொலைவிலிருந்து குடும்பச் சந்திப்பு',
      'ch6.body': 'இந்தியாவில் உள்ள என் குடும்பத்திற்கு ஃபெரினாவை வீடியோ அழைப்பில் அறிமுகப்படுத்தினேன் — தூரத்தில் தொலைவு, மனதில் நெருக்கம்.',
      'ch7.eyebrow': 'டிச 2025 – ஜூலை 2026', 'ch7.title': 'எங்கள் குடும்பம் பெருகியது',
      'ch7.body': 'Jessy வந்தாள், பிறகு Creamy, பிறகு Yuzu — நான்கு பூனைகள், ஒரு வீடு, எல்லையில்லா அன்பு.',
      'ch8.eyebrow': 'செப்டம்பர் 2026 · இந்தியா', 'ch8.title': 'இறுதியாக, வீட்டிற்கு',
      'ch8.body': 'என் புதுமனை புகுவிழாவிற்காக ஃபெரினாவை இந்தியா அழைத்துச் சென்றேன்; அங்கு முதன்முறையாக என் குடும்பத்தைச் சந்தித்தாள். எல்லோருக்கும் அவளைப் பிடித்துப்போனது — அப்போதுதான் நேரம் வந்துவிட்டது என்று உணர்ந்தோம்.',
      'gallery.eyebrow': 'புகைப்படங்கள்',
      'gallery.heading': 'எங்கள் தோட்டம்',
      'gift.eyebrow': 'அன்பின் அடையாளம்',
      'gift.heading': 'திருமண அன்பளிப்பு',
      'gift.body': 'உங்கள் பிரார்த்தனைகளும் ஆசிகளுமே எங்களுக்குப் பெரும் பரிசு. இருந்தாலும் அன்பளிப்பு அனுப்ப விரும்பினால், கீழே உள்ள வழிகளில் அனுப்பலாம்.',
      'gift.copy': 'கணக்கு எண்ணை நகலெடு', 'gift.copied': 'நகலெடுக்கப்பட்டது!', 'gift.copyWallet': 'எண்ணை நகலெடு', 'gift.swipe': 'மேலும் காண நகர்த்தவும்',
      'gift.accountNo': 'கணக்கு எண்', 'gift.walletNo': 'eWallet எண்', 'gift.showQR': 'QR', 'gift.showNumber': 'எண்', 'gift.downloadQR': 'QR பதிவிறக்கு',
      'gift.qrHint': 'மலேசிய வங்கி அல்லது eWallet செயலியில் ஸ்கேன் செய்யவும்',
      'gift.upiId': 'UPI ID', 'gift.copyUpi': 'UPI ID நகலெடு', 'gift.upiHint': 'எந்த UPI செயலியிலும் ஸ்கேன் செய்யவும்',
      'rsvp.eyebrow': 'நவம்பர் 8-க்குள் தெரிவிக்கவும்',
      'rsvp.heading': 'வாழ்த்துகள் & வருகை',
      'rsvp.lead': 'நீங்கள் வர இயலுமா என்று தெரிவித்து, எங்களுக்கு ஒரு வாழ்த்தையும் விட்டுச் செல்லுங்கள்.',
      'rsvp.countYes': 'வருகிறார்கள்', 'rsvp.countNo': 'வர இயலாது',
      'rsvp.name.label': 'பெயர்', 'rsvp.name.placeholder': 'உங்கள் பெயர்',
      'rsvp.attending.label': 'வருகை உறுதி',
      'rsvp.attending.yes': 'வருகிறேன்', 'rsvp.attending.no': 'வர இயலாது',
      'rsvp.guests.label': 'விருந்தினர் எண்ணிக்கை', 'rsvp.guests.placeholder': 'உ.ம். 2',
      'rsvp.phone.label': 'தொலைபேசி / WhatsApp', 'rsvp.phone.placeholder': 'விருப்பத்தேர்வு',
      'rsvp.message.label': 'வாழ்த்துகள் & பிரார்த்தனைகள்', 'rsvp.message.placeholder': 'உங்கள் வாழ்த்தை எழுதுங்கள்...',
      'rsvp.submit': 'அனுப்பு', 'rsvp.submitting': 'அனுப்புகிறது...',
      'rsvp.note': 'உங்கள் வாழ்த்தும் தொலைபேசி எண்ணும் எங்களுக்கு மட்டுமே தெரியும்.',
      'rsvp.thanks.yes': 'நன்றி, {name}! உங்களுடன் கொண்டாட ஆவலுடன் காத்திருக்கிறோம். 🤍',
      'rsvp.thanks.no': 'தெரிவித்ததற்கு நன்றி, {name}. உங்களை மிஸ் செய்வோம்!',
      'rsvp.error': 'ஏதோ தவறு நடந்துவிட்டது — மீண்டும் முயற்சிக்கவும்.',
      'closing.eyebrow': 'நன்றி',
      'closing.body': 'நீங்கள் வருகை தந்து உங்கள் பிரார்த்தனைகளையும் ஆசிகளையும் வழங்கினால், அதுவே எங்களுக்கு மகிழ்ச்சியும் பெருமையும் ஆகும்.'
    }
  };

  let currentLocale = 'en';
  function t(key){ return (STRINGS[currentLocale] && STRINGS[currentLocale][key]) || STRINGS.en[key] || key; }
  window.i18nText = t;

  function applyLocale(lang){
    if (!STRINGS[lang]) lang = 'en';
    currentLocale = lang;
    document.documentElement.lang = lang;
    document.title = t('doc.title');
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'))); });
    document.querySelectorAll('.lang-toggle button').forEach((btn) => { btn.classList.toggle('active', btn.getAttribute('data-lang') === lang); });
    const guestNameEl = document.getElementById('guestName');
    if (guestNameEl && !window.nikahGuestName) guestNameEl.textContent = t('cover.guestFallback');
    const salEl = document.getElementById('salutation');
    if (salEl && window.nikahSalutation) salEl.textContent = window.nikahSalutation;
    document.dispatchEvent(new CustomEvent('nikah:locale', { detail: lang }));
  }

  document.querySelectorAll('.lang-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLocale(btn.getAttribute('data-lang'));
      try { localStorage.setItem('nikah_locale', btn.getAttribute('data-lang')); } catch (e) {}
    });
  });

  // Link params ?to= (guest name) and ?s= (salutation). Capped in code units; Tamil letters like "கு"
  // are 2+ units, so cut at the last space (or, failing that, the last whole grapheme) to never show half a letter.
  function cleanParam(raw, max){
    const s = raw.trim().replace(/\s+/g, ' ');
    if (s.length <= max) return s;
    const sp = s.lastIndexOf(' ', max);
    if (sp > max / 2) return s.slice(0, sp);
    if (window.Intl && Intl.Segmenter){
      let out = '';
      for (const { segment } of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s)){
        if (out.length + segment.length > max) break;
        out += segment;
      }
      return out;
    }
    // No Segmenter (old browsers): drop the last Tamil letter + its vowel signs, which may be partial.
    return s.slice(0, max).replace(/[஀-௿][ஂா-்ௗ‌‍]*$/, '');
  }
  const params = new URLSearchParams(location.search);
  window.nikahGuestName = cleanParam(params.get('to') || '', 150);
  // ?s= replaces the default salutation line ("Dear" / "Kepada Yth. …" / "அன்புடையீர்") as written,
  // whatever the page language, so match it to ?lang= when making the link.
  window.nikahSalutation = cleanParam(params.get('s') || '', 60);

  // Locale: ?lang= link > the guest's own earlier choice > browser language preference
  // (first of Tamil / Indonesian / English in their preference list) > English.
  function pickLocale(){
    const q = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
    if (STRINGS[q]) return q;
    let saved = null;
    try { saved = localStorage.getItem('nikah_locale'); } catch (e) {}
    if (STRINGS[saved]) return saved;
    const prefs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en'];
    for (const raw of prefs){
      const l = String(raw).toLowerCase();
      if (l.startsWith('ta')) return 'ta';
      if (l.startsWith('id') || l.startsWith('in')) return 'id';   // 'in' = legacy code for Indonesian
      if (l.startsWith('en')) return 'en';
    }
    return 'en';
  }
  applyLocale(pickLocale());
})();
