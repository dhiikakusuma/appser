import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface LoginRequest {
  namaLengkap?: string;
  password?: string;
  role: 'pemohon' | 'kasubag' | 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { namaLengkap, password, role } = body;

    if (role === 'pemohon') {
      // Login for Pemohon - only needs name
      if (!namaLengkap || namaLengkap.trim() === '') {
        return NextResponse.json(
          { error: 'Nama lengkap harus diisi' },
          { status: 400 }
        );
      }

      // Find user by name (case-insensitive using contains for SQLite)
      let user = await db.user.findFirst({
        where: {
          namaLengkap: namaLengkap.trim(),
          role: 'pemohon',
        },
      });

      // If user doesn't exist, create a new one (for demo purposes)
      if (!user) {
        user = await db.user.create({
          data: {
            namaLengkap: namaLengkap.trim(),
            role: 'pemohon',
          },
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          nip: user.nip,
          namaLengkap: user.namaLengkap,
          unitKerja: user.unitKerja,
          role: user.role,
        },
      });
    } else if (role === 'kasubag' || role === 'admin') {
      // Login for Kasubag/Admin - needs password
      if (!password || password.trim() === '') {
        return NextResponse.json(
          { error: 'Kata sandi harus diisi' },
          { status: 400 }
        );
      }

      // Find kasubag/admin user
      const user = await db.user.findFirst({
        where: {
          role: role,
        },
      });

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { error: 'Akun tidak ditemukan' },
          { status: 401 }
        );
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Kata sandi salah' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          nip: user.nip,
          namaLengkap: user.namaLengkap,
          unitKerja: user.unitKerja,
          role: user.role,
        },
      });
    }

    return NextResponse.json(
      { error: 'Role tidak valid' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
