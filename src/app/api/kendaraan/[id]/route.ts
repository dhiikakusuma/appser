import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single kendaraan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kendaraan = await db.kendaraan.findUnique({
      where: { id },
    });

    if (!kendaraan) {
      return NextResponse.json(
        { error: 'Kendaraan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(kendaraan);
  } catch (error) {
    console.error('Get kendaraan error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kendaraan' },
      { status: 500 }
    );
  }
}

// PUT update kendaraan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { platNomor, merkModel, tahunPembelian, statusKendaraan, lastServiceDate } = body;

    const kendaraan = await db.kendaraan.update({
      where: { id },
      data: {
        platNomor: platNomor?.toUpperCase(),
        merkModel,
        tahunPembelian: tahunPembelian ? parseInt(tahunPembelian) : null,
        statusKendaraan,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
      },
    });

    return NextResponse.json(kendaraan);
  } catch (error) {
    console.error('Update kendaraan error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate data kendaraan' },
      { status: 500 }
    );
  }
}

// DELETE kendaraan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.kendaraan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete kendaraan error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data kendaraan' },
      { status: 500 }
    );
  }
}
