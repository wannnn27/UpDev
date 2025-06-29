# Student SuperApp

SuperApp untuk mahasiswa yang menggabungkan manajemen tugas, pencatatan kuliah, pengelolaan keuangan, dan asisten AI dalam satu aplikasi.

## 🚀 Fitur Utama

### 📊 Dashboard
- Ringkasan tugas yang belum selesai
- Monitor keuangan real-time
- Quote motivasi harian
- Aksi cepat untuk membuat tugas dan catatan baru

### ✅ Task Manager
- Buat, edit, dan hapus tugas
- Set deadline dan prioritas
- Filter berdasarkan status (Belum Dikerjakan, Dikerjakan, Selesai)
- Sorting otomatis berdasarkan deadline dan prioritas

### 📝 Note Taking
- Catatan terorganisir berdasarkan mata kuliah
- Editor rich text untuk format yang lebih baik
- Pencarian cepat melalui semua catatan
- Auto-save untuk mencegah kehilangan data

### 💰 Finance Manager
- Tracking pemasukan dan pengeluaran
- Kalkulasi saldo otomatis
- Riwayat transaksi lengkap
- Visualisasi finansial dengan card summary

### 🤖 AI Assistant
- Chat dengan AI untuk bantuan akademik
- Reminder tugas yang akan jatuh tempo
- Saran prioritas berdasarkan deadline
- Motivasi dan tips produktivitas

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 18, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **AI Service**: Google Gemini API
- **Build Tool**: React Scripts
- **Styling**: Tailwind CSS dengan custom utilities

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstall:
- Node.js (versi 16 atau lebih baru)
- npm atau yarn
- Account Firebase
- API Key Google Gemini (opsional untuk fitur AI)

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/student-superapp.git
cd student-superapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Firebase
1. Buat project baru di [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Anonymous)
4. Copy konfigurasi Firebase Anda

### 4. Konfigurasi Environment
Buat file `.env.local` di root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Jalankan Aplikasi
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── common/           # Komponen reusable
│   │   ├── EmptyState.js
│   │   └── Icons.js
│   └── layout/           # Komponen layout
│       ├── Sidebar.js
│       └── MainLayout.js
├── features/             # Feature modules
│   ├── dashboard/
│   ├── tasks/
│   ├── notes/
│   ├── finance/
│   └── ai/
├── hooks/                # Custom React hooks
│   ├── useAuth.js
│   ├── useTasks.js
│   ├── useNotes.js
│   ├── useTransactions.js
│   └── useFirestore.js
├── services/             # External services
│   ├── firebase.js
│   └── geminiAPI.js
├── utils/                # Utility functions
│   ├── constants.js
│   ├── helpers.js
│   └── dateUtils.js
├── styles/               # CSS files
│   └── index.css
└── App.js               # Main application
```

## 🔧 Konfigurasi Firebase Security Rules

Tambahkan rules berikut di Firestore Database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Build untuk Production

```bash
npm run build
```

Files hasil build akan tersimpan di folder `build/`

## 🧪 Testing

```bash
npm test
```

## 📝 TODO / Roadmap

- [ ] Notifikasi push untuk deadline tugas
- [ ] Export catatan ke PDF
- [ ] Sync dengan Google Calendar
- [ ] Dark/Light mode toggle
- [ ] Mobile app dengan React Native
- [ ] Collaboration features untuk grup study
- [ ] Advanced analytics untuk produktivitas

## 🤝 Contributing

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini dilisensikan under MIT License. Lihat file `LICENSE` untuk detail lebih lanjut.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) untuk backend service
- [Tailwind CSS](https://tailwindcss.com/) untuk styling framework
- [Google Gemini](https://ai.google.dev/) untuk AI capabilities
- [Lucide Icons](https://lucide.dev/) untuk icon set

# UpDev
