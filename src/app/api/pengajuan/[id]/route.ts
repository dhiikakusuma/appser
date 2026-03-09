import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single pengajuan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pengajuan = await db.pengajuan.findUnique({
      where: { id },
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
        auditLogs: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!pengajuan) {
      return NextResponse.json(
        { error: 'Pengajuan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(pengajuan);
  } catch (error) {
    console.error('Get pengajuan error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengajuan' },
      { status: 500 }
    );
  }
}

// DELETE pengajuan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Delete audit logs first
    await db.auditLog.deleteMany({
      where: { pengajuanId: id },
    });
    
    // Delete pengajuan
    await db.pengajuan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete pengajuan error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengajuan' },
      { status: 500 }
    );
  }
}
