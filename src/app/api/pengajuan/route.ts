import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all pengajuan with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: {
      userId?: string;
      status?: string;
    } = {};

    if (userId) {
      where.userId = userId;
    }

    if (status && status !== 'semua') {
      where.status = status;
    }

    const pengajuan = await db.pengajuan.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            namaLengkap: true,
            nip: true,
            unitKerja: true,
          },
        },
        kasubag: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        kendaraan: true,
      },
      orderBy: {
        tanggalPengajuan: 'desc',
      },
    });

    return NextResponse.json(pengajuan);
  } catch (error) {
    console.error('Get pengajuan error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengajuan' },
      { status: 500 }
    );
  }
}

// POST create new pengajuan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, platNomor, detailKerusakan, tanggalRencana, ttdPemohon } = body;

    if (!userId || !platNomor || !detailKerusakan || !tanggalRencana || !ttdPemohon) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Find or create kendaraan by platNomor
    let kendaraan = await db.kendaraan.findUnique({
      where: { platNomor: platNomor.toUpperCase() },
    });

    if (!kendaraan) {
      // Create new kendaraan entry if not exists
      kendaraan = await db.kendaraan.create({
        data: {
          platNomor: platNomor.toUpperCase(),
          merkModel: 'Manual Entry',
          statusKendaraan: 'aktif',
        },
      });
    }

    // Create pengajuan
    const pengajuan = await db.pengajuan.create({
      data: {
        userId,
        kendaraanId: kendaraan.id,
        detailKerusakan,
        tanggalRencana: new Date(tanggalRencana),
        ttdPemohon,
        status: 'menunggu',
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
        actorName: pengajuan.user.namaLengkap,
        action: 'SUBMIT',
        userId: userId,
      },
    });

    return NextResponse.json(pengajuan, { status: 201 });
  } catch (error) {
    console.error('Create pengajuan error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pengajuan' },
      { status: 500 }
    );
  }
}
