import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST reject pengajuan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pengajuanId, kasubagId, alasanPenolakan } = body;

    if (!pengajuanId || !kasubagId || !alasanPenolakan) {
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
        status: 'ditolak',
        alasanPenolakan,
        kasubagId,
        tanggalPutusan: new Date(),
      },
      include: {
        user: true,
        kendaraan: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        pengajuanId: pengajuan.id,
        actorName: kasubag.namaLengkap,
        action: 'REJECT',
        userId: kasubagId,
      },
    });

    return NextResponse.json(pengajuan);
  } catch (error) {
    console.error('Reject pengajuan error:', error);
    return NextResponse.json(
      { error: 'Gagal menolak pengajuan' },
      { status: 500 }
    );
  }
}
