# Aplikasi Pengajuan Service Kendaraan DP3AKB Kota Balikpapan

Aplikasi web untuk mengajukan permohonan service kendaraan dinas roda 2 di Dinas Pemberdayaan Perempuan, Perlindungan Anak, dan Keluarga Berencana (DP3AKB) Kota Balikpapan.

## 🚀 Fitur Utama

### Untuk Pemohon (Staff)
- Login dengan nama lengkap
- Mengajukan permohonan service kendaraan dengan input plat nomor manual
- Melihat status pengajuan (Menunggu, Disetujui, Ditolak)
- Mendownload surat pengantar service (PDF) untuk pengajuan yang disetujui
- Tanda tangan digital (nama terang)

### Untuk Kasubag Umum
- Login dengan password (default: `admin123`)
- Dashboard dengan ringkasan pengajuan
- Menyetujui/menolak pengajuan dengan tanda tangan digital
- Riwayat keputusan dengan fitur cetak surat
- Manajemen data kendaraan (tambah kendaraan manual)
- Export data ke CSV/PDF
- Pengaturan nama Kasubag

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Database**: SQLite (Prisma ORM)
- **PDF Generation**: jsPDF
- **State Management**: Zustand

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/username/dp3akb-service-kendaraan.git
cd dp3akb-service-kendaraan
```

### 2. Install Dependencies
```bash
bun install
# atau
npm install
```

### 3. Setup Environment
Buat file `.env` di root project:
```env
DATABASE_URL="file:./db/custom.db"
```

### 4. Setup Database
```bash
# Generate Prisma client
bunx prisma generate

# Push schema ke database
bunx prisma db push

# Seed data awal (membuat user kasubag, admin, pemohon sample)
curl http://localhost:3000/api/seed
# atau akses di browser: http://localhost:3000/api/seed
```

### 5. Jalankan Aplikasi
```bash
bun run dev
# atau
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🔐 Kredensial Default

| Role | Username/Password |
|------|-------------------|
| Kasubag Umum | Password: `admin123` |
| Admin | Password: `admin123` |
| Pemohon | Login dengan nama lengkap (contoh: "Budi Santoso") |

## 📁 Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Autentikasi login
│   │   ├── pengajuan/     # CRUD pengajuan service
│   │   ├── kendaraan/     # CRUD data kendaraan
│   │   ├── user/          # Update user
│   │   └── seed/          # Seed data awal
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Halaman utama (single page app)
├── components/
│   └── ui/                # shadcn/ui components
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.ts
└── lib/
    ├── auth-store.ts      # Zustand store untuk auth
    ├── db.ts              # Prisma client
    ├── pdf-generator.ts   # Generator surat PDF
    └── utils.ts
prisma/
└── schema.prisma          # Database schema
```

## 📄 Format Surat PDF

Surat pengantar service yang dihasilkan mengikuti format resmi:
- Kop surat DP3AKB Kota Balikpapan
- Tabel data kendaraan (OPD, Jenis, Merk/Type, No. Polisi, Keterangan)
- Tanda tangan digital pemohon dan kasubag
- Catatan ketentuan pemeliharaan

## 🚀 Deployment

### Vercel (Recommended)
1. Push ke GitHub
2. Connect repository di [vercel.com](https://vercel.com)
3. Set environment variable `DATABASE_URL`
4. Deploy

### Manual / VPS
```bash
# Build
bun run build

# Start production
bun start
```

## 📝 Catatan

- Database menggunakan SQLite untuk kemudahan development
- Untuk production, pertimbangkan menggunakan PostgreSQL atau MySQL
- File database tersimpan di `db/custom.db`

## 📄 License

MIT License

---

Developed for DP3AKB Kota Balikpapan
