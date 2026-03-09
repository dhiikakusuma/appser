import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all kendaraan
export async function GET() {
  try {
    const kendaraan = await db.kendaraan.findMany({
      orderBy: { platNomor: 'asc' },
    });
    return NextResponse.json(kendaraan);
  } catch (error) {
    console.error('Get kendaraan error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kendaraan' },
      { status: 500 }
    );
  }
}

// POST create new kendaraan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platNomor, merkModel, namaPengguna, tahunPembelian, statusKendaraan } = body;

    if (!platNomor || !merkModel) {
      return NextResponse.json(
        { error: 'Plat nomor dan merk/model harus diisi' },
        { status: 400 }
      );
    }

    // Check if platNomor already exists
    const existing = await db.kendaraan.findUnique({
      where: { platNomor: platNomor.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Plat nomor sudah terdaftar' },
        { status: 400 }
      );
    }

    const kendaraan = await db.kendaraan.create({
      data: {
        platNomor: platNomor.toUpperCase(),
        merkModel,
        namaPengguna: namaPengguna || null,
        tahunPembelian: tahunPembelian ? parseInt(tahunPembelian) : null,
        statusKendaraan: statusKendaraan || 'aktif',
      },
    });

    return NextResponse.json(kendaraan, { status: 201 });
  } catch (error) {
    console.error('Create kendaraan error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat data kendaraan' },
      { status: 500 }
    );
  }
}
