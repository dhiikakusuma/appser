import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST approve pengajuan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pengajuanId, kasubagId, ttdKasubag } = body;

    if (!pengajuanId || !kasubagId || !ttdKasubag) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Get kasubag info
    const kasubag = await db.user.findUnique({
      where: { id: kasubagId },
    });

    if (!kasubag) {
      return NextResponse.json(
        { error: 'Kasubag tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update pengajuan
    const pengajuan = await db.pengajuan.update({
      where: { id: pengajuanId },
      data: {
        status: 'disetujui',
        ttdKasubag,
        kasubagId,
        tanggalPutusan: new Date(),
      },
      include: {
        user: true,
        kendaraan: true,
      },
    });

    // Update kendaraan status to service
    await db.kendaraan.update({
      where: { id: pengajuan.kendaraanId },
      data: {
        statusKendaraan: 'service',
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        pengajuanId: pengajuan.id,
        actorName: kasubag.namaLengkap,
        action: 'APPROVE',
        userId: kasubagId,
      },
    });

    return NextResponse.json(pengajuan);
  } catch (error) {
    console.error('Approve pengajuan error:', error);
    return NextResponse.json(
      { error: 'Gagal menyetujui pengajuan' },
      { status: 500 }
    );
  }
}
