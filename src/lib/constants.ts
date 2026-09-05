export interface DemoVideoPreset {
  id: string;
  title: string;
  author: string;
  url: string;
  category: string;
  durationFormatted: string;
  thumbnail: string;
  description: string;
  sampleTranscript: string;
}

export const DEMO_PRESETS: DemoVideoPreset[] = [
  {
    id: 'demo-ai-future',
    title: 'Masa Depan AI, Agen Otonom, dan Peluang Emas 2026',
    author: 'Tech Innovator ID',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Teknologi & AI',
    durationFormatted: '18:42',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    description: 'Diskusi mendalam tentang lompatan teknologi AI agen otonom, otomatisasi video, dan bagaimana kreator masa kini memanfaatkannya.',
    sampleTranscript: `
Host: Banyak orang takut AI akan menggantikan kreator. Tapi menurut saya, yang digantikan adalah mereka yang menolak beradaptasi.
Narasumber: Betul sekali! Kuncinya ada di 3 detik pertama sebuah video. Jika Anda tidak bisa menghentikan scrolling audiens dalam 3 detik, riset berjam-jam Anda akan sia-sia.
Host: Apa rumus hook paling ampuh yang pernah Anda uji?
Narasumber: Rumusnya sederhana: 'Pola Kontras'. Contohnya: 'Jangan pernah lakukan X jika ingin mencapai Y'. Otak manusia diprogram secara evolusioner untuk menghindari bahaya dan kerugian. Ketika Anda memberi peringatan bernilai tinggi, retensi naik hingga 300%.
Host: Luar biasa. Dan bagaimana dengan peran vertical video seperti Shorts dan TikTok?
Narasumber: Algoritma saat ini memprioritaskan completion rate dan share to friends. Jika klip Anda bisa membuat seseorang mengirimkannya ke grup WhatsApp temannya, video itu dipastikan meledak secara viral.
    `.trim(),
  },
  {
    id: 'demo-productivity',
    title: 'Rahasia Konsistensi & Menghancurkan Rasa Malas Tanpa Motivasi',
    author: 'Mindset Juara',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    category: 'Produktivitas & Mindset',
    durationFormatted: '14:15',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    description: 'Metode neurologis mengatasi prokrastinasi dan membangun kebiasaan produktif tanpa bergantung pada mood.',
    sampleTranscript: `
Pembicara: Berhenti menunggu motivasi datang. Motivasi adalah emosi yang sangat tidak bisa diandalkan.
Terapkan 'Aturan 2 Menit'. Mulai saja selama 120 detik pertama.
Ketika Anda mulai membuka laptop dan menulis satu kalimat, sistem dopamin di otak Anda akan bergeser dari status 'stagnan' menjadi 'momentum'.
Kebanyakan orang gagal bukan karena mereka tidak punya waktu, tapi karena energi mental mereka habis untuk memikirkan kapan harus memulai.
Lakukan hal terberat di pagi hari sebelum memeriksa notifikasi smartphone Anda. Itulah pembeda antara 1% orang sukses dan 99% yang hanya berencana.
    `.trim(),
  },
  {
    id: 'demo-business-creator',
    title: 'Strategi Membangun Audiens dan Bisnis 100 Juta Pertama dari Konten',
    author: 'Creator Mastery Hub',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    category: 'Bisnis & Creator',
    durationFormatted: '22:10',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    description: 'Blueprint lengkap mengubah viewers media sosial menjadi komunitas loyal dan pembeli produk berulang.',
    sampleTranscript: `
Mentor: Jangan kejar views jutaan tanpa strategi konversi. 10.000 followers yang tepat bernilai jauh lebih tinggi daripada 1 juta penonton acak.
Fokus pada satu masalah spesifik yang dialami target pasar Anda.
Buat klip-klip pendek berdurasi 30-45 detik yang membedah studi kasus nyata. Berikan solusi praktis di video, lalu ajak mereka untuk mengakses template atau panduan lengkap di link bio Anda.
Ini bukan sekadar bermain media sosial, ini membangun saluran distribusi bisnis pribadi yang tidak bisa dihentikan siapa pun.
    `.trim(),
  },
];

export const SOCIAL_PLATFORMS_INFO = [
  {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    iconName: 'Youtube',
    color: '#FF0000',
    bgColor: 'bg-red-50 text-red-700 border-red-200',
    badgeBg: 'bg-red-600',
    desc: 'Format 9:16 vertikal, maks 60 detik, terhubung ke YouTube Data API v3',
    charLimit: 100,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    iconName: 'Flame',
    color: '#000000',
    bgColor: 'bg-slate-100 text-slate-900 border-slate-300',
    badgeBg: 'bg-slate-900',
    desc: 'Optimasi algoritma FYP, format caption santai & trending sound',
    charLimit: 2200,
  },
  {
    id: 'instagram_reels',
    name: 'Instagram Reels',
    iconName: 'Instagram',
    color: '#E1306C',
    bgColor: 'bg-pink-50 text-pink-700 border-pink-200',
    badgeBg: 'bg-gradient-to-r from-purple-600 to-pink-600',
    desc: 'Audio rekomendasi, cover frame kustom & integrasi Meta Graph API',
    charLimit: 2200,
  },
  {
    id: 'x_twitter',
    name: 'X (Twitter)',
    iconName: 'Twitter',
    color: '#1DA1F2',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeBg: 'bg-blue-500',
    desc: 'Format tweet video tajam dengan link diskusi & thread',
    charLimit: 280,
  },
  {
    id: 'custom_webhook',
    name: 'Automation Webhook',
    iconName: 'Webhook',
    color: '#10B981',
    bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeBg: 'bg-emerald-600',
    desc: 'Dispatch payload ber-signature HMAC-SHA256 ke Make / Zapier / n8n',
    charLimit: 10000,
  },
] as const;
