import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Seed endpoint to initialize default data
export async function GET() {
  try {
    // Check if kasubag already exists
    const existingKasubag = await db.user.findFirst({
      where: { role: 'kasubag' },
    });

    if (!existingKasubag) {
      // Create default kasubag user with password 'admin123'
      const passwordHash = await bcrypt.hash('admin123', 10);
      await db.user.create({
        data: {
          namaLengkap: 'Kasubag Umum',
          nip: '198001012010011001',
          unitKerja: 'Bagian Umum',
          role: 'kasubag',
          passwordHash,
        },
      });
    }

    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'admin' },
    });

    if (!existingAdmin) {
      // Create default admin user with password 'admin123'
      const passwordHash = await bcrypt.hash('admin123', 10);
      await db.user.create({
        data: {
          namaLengkap: 'Administrator',
          nip: '197001011990011001',
          unitKerja: 'Bagian IT',
          role: 'admin',
          passwordHash,
        },
      });
    }

    // Create sample vehicles if none exist
    const existingVehicles = await db.kendaraan.count();
    if (existingVehicles === 0) {
      await db.kendaraan.createMany({
        data: [
          {
            platNomor: 'B 1234 CD',
            merkModel: 'Honda Vario 150',
            tahunPembelian: 2020,
            statusKendaraan: 'aktif',
          },
          {
            platNomor: 'B 5678 EF',
            merkModel: 'Yamaha NMAX',
            tahunPembelian: 2021,
            statusKendaraan: 'aktif',
          },
          {
            platNomor: 'B 9012 GH',
            merkModel: 'Honda PCX 160',
            tahunPembelian: 2022,
            statusKendaraan: 'aktif',
          },
          {
            platNomor: 'B 3456 IJ',
            merkModel: 'Yamaha Aerox',
            tahunPembelian: 2019,
            statusKendaraan: 'aktif',
          },
          {
            platNomor: 'B 7890 KL',
            merkModel: 'Suzuki Nex',
            tahunPembelian: 2018,
            statusKendaraan: 'service',
          },
        ],
      });
    }

    // Create sample pemohon users
    const existingPemohon = await db.user.count({
      where: { role: 'pemohon' },
    });

    if (existingPemohon === 0) {
      await db.user.createMany({
        data: [
          {
            namaLengkap: 'Budi Santoso',
            nip: '198505012010011002',
            unitKerja: 'Seksi Pemberdayaan Perempuan',
            role: 'pemohon',
          },
          {
            namaLengkap: 'Siti Rahayu',
            nip: '199001012015012001',
            unitKerja: 'Seksi Perlindungan Anak',
            role: 'pemohon',
          },
          {
            namaLengkap: 'Ahmad Hidayat',
            nip: '198702022012011003',
            unitKerja: 'Seksi Keluarga Berencana',
            role: 'pemohon',
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Data awal berhasil dibuat',
      credentials: {
        kasubag: { password: 'admin123' },
        admin: { password: 'admin123' },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat data awal' },
      { status: 500 }
    );
  }
}
