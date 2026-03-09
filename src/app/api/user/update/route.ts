import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST update user name
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, namaLengkap } = body;

    if (!userId || !namaLengkap || !namaLengkap.trim()) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Update user
    const user = await db.user.update({
      where: { id: userId },
      data: {
        namaLengkap: namaLengkap.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        namaLengkap: user.namaLengkap,
        nip: user.nip,
        unitKerja: user.unitKerja,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate data user' },
      { status: 500 }
    );
  }
}
