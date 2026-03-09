'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, User, UserRole } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User as UserIcon, 
  Lock, 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  History, 
  Car,
  LogOut,
  Download,
  Eye,
  Shield,
  Users,
  FileSpreadsheet,
  Printer,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateSuratPengajuan } from '@/lib/pdf-generator';

// Types
type ViewType = 'landing' | 'login-pemohon' | 'login-kasubag' | 'dashboard-pemohon' | 'dashboard-kasubag' | 'form-pengajuan' | 'detail-pengajuan' | 'riwayat-kasubag' | 'riwayat-pemohon' | 'data-kendaraan' | 'export-data' | 'settings';

interface Kendaraan {
  id: string;
  platNomor: string;
  merkModel: string;
  namaPengguna: string | null;
  tahunPembelian: number | null;
  statusKendaraan: string;
  lastServiceDate: string | null;
}

interface Pengajuan {
  id: string;
  userId: string;
  kendaraanId: string;
  detailKerusakan: string;
  tanggalRencana: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  ttdPemohon: string | null;
  ttdKasubag: string | null;
  alasanPenolakan: string | null;
  tanggalPengajuan: string;
  tanggalPutusan: string | null;
  kasubagId: string | null;
  nomorSurat?: string | null;
  user: {
    id: string;
    namaLengkap: string;
    nip: string | null;
    unitKerja: string | null;
  };
  kasubag: {
    id: string;
    namaLengkap: string;
  } | null;
  kendaraan: Kendaraan;
}

// Landing Page Component
function LandingPage({ onSelectRole }: { onSelectRole: (role: 'pemohon' | 'kasubag') => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">DP3AKB Kota Balikpapan</h1>
        <p className="text-lg text-gray-600">Aplikasi Pengajuan Service Kendaraan Dinas Roda 2</p>
        <p className="text-sm text-gray-500 mt-1">Dinas Perlindungan Perempuan, Anak, dan Keluarga Berencana</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Pemohon Card */}
        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-emerald-500 group" onClick={() => onSelectRole('pemohon')}>
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <UserIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-emerald-700">Saya Pemohon</CardTitle>
            <CardDescription>Staff Dinas</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-600">
            <p>Ajukan permohonan service kendaraan dinas</p>
            <p className="text-xs mt-1 text-gray-400">Login dengan Nama Lengkap</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              MASUK
            </Button>
          </CardFooter>
        </Card>

        {/* Kasubag Card */}
        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-amber-500 group" onClick={() => onSelectRole('kasubag')}>
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-amber-700">Saya Kasubag</CardTitle>
            <CardDescription>Verifikator</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-600">
            <p>Review dan setujui pengajuan service</p>
            <p className="text-xs mt-1 text-gray-400">Login dengan Password</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-amber-500 hover:bg-amber-600">
              MASUK
            </Button>
          </CardFooter>
        </Card>
      </div>

      <p className="text-xs text-gray-400 mt-8">© 2024 DP3AKB Kota Balikpapan</p>
    </div>
  );
}

// Login Pemohon Component
function LoginPemohon({ onBack, onLogin }: { onBack: () => void; onLogin: (user: User) => void }) {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      toast({ title: 'Error', description: 'Nama lengkap harus diisi', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaLengkap, role: 'pemohon' }),
      });
      const data = await res.json();
      
      if (data.success) {
        onLogin(data.user);
        toast({ title: 'Berhasil', description: `Selamat datang, ${data.user.namaLengkap}` });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan pada server', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit mb-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
          <CardTitle className="text-2xl text-emerald-700">Login Pemohon</CardTitle>
          <CardDescription>Silakan masukkan nama lengkap sesuai data pegawai</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama lengkap..."
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? 'Memproses...' : 'MASUK SEBAGAI PEMOHON'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Login Kasubag Component
function LoginKasubag({ onBack, onLogin }: { onBack: () => void; onLogin: (user: User) => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({ title: 'Error', description: 'Kata sandi harus diisi', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, role: 'kasubag' }),
      });
      const data = await res.json();
      
      if (data.success) {
        onLogin(data.user);
        toast({ title: 'Berhasil', description: `Selamat datang, ${data.user.namaLengkap}` });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan pada server', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button variant="ghost" size="sm" className="w-fit mb-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
          <CardTitle className="text-2xl text-amber-700">Akses Verifikator</CardTitle>
          <CardDescription>Masukkan kata sandi keamanan untuk mengakses</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={loading}>
              {loading ? 'Memproses...' : 'MASUK SEBAGAI KASUBAG'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Dashboard Pemohon Component
function DashboardPemohon({ 
  user, 
  pengajuanList, 
  onLogout, 
  onNewRequest, 
  onViewDetail,
  onRefresh 
}: { 
  user: User; 
  pengajuanList: Pengajuan[];
  onLogout: () => void;
  onNewRequest: () => void;
  onViewDetail: (pengajuan: Pengajuan) => void;
  onRefresh: () => void;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return <Badge className="bg-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> DISETUJUI</Badge>;
      case 'ditolak':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" /> DITOLAK</Badge>;
      default:
        return <Badge className="bg-amber-500"><Clock className="w-3 h-3 mr-1" /> MENUNGGU</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">DP3AKB</h2>
              <p className="text-xs text-gray-500">Service App</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-emerald-50 text-emerald-700">
            <FileText className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={onNewRequest}>
            <Plus className="w-4 h-4 mr-2" /> Ajukan Baru
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            <span className="font-semibold">DP3AKB</span>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-6 border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Dashboard Pemohon</CardTitle>
              <CardDescription>Halo, <span className="font-medium text-emerald-700">{user.namaLengkap}</span></CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {user.unitKerja && <span>Unit: {user.unitKerja}</span>}
              </p>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex gap-3 mb-6">
            <Button onClick={onNewRequest} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Ajukan Service Baru
            </Button>
            <Button variant="outline" onClick={onRefresh}>
              Refresh
            </Button>
          </div>

          {/* Status Pengajuan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" /> Status Pengajuan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pengajuanList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Belum ada pengajuan service</p>
                  <Button onClick={onNewRequest} variant="link" className="text-emerald-600">
                    Buat pengajuan pertama
                  </Button>
                </div>
              ) : (
                <ScrollArea className="max-h-96">
                  <div className="space-y-3">
                    {pengajuanList.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Car className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{item.kendaraan?.platNomor}</span>
                              <span className="text-sm text-gray-500">({item.kendaraan?.merkModel})</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.detailKerusakan}</p>
                            <p className="text-xs text-gray-400">
                              Tanggal Pengajuan: {new Date(item.tanggalPengajuan).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(item.status)}
                            <Button variant="outline" size="sm" onClick={() => onViewDetail(item)}>
                              <Eye className="w-3 h-3 mr-1" /> Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Form Pengajuan Component
function FormPengajuan({
  userId,
  onBack,
  onSuccess,
}: {
  userId: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [platNomor, setPlatNomor] = useState('');
  const [detailKerusakan, setDetailKerusakan] = useState('');
  const [tanggalRencana, setTanggalRencana] = useState('');
  const [ttdPemohon, setTtdPemohon] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platNomor.trim() || !detailKerusakan || !tanggalRencana || !ttdPemohon) {
      toast({ title: 'Error', description: 'Semua field harus diisi', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platNomor: platNomor.toUpperCase().trim(),
          detailKerusakan,
          tanggalRencana,
          ttdPemohon,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast({ title: 'Berhasil', description: 'Pengajuan berhasil dikirim' });
      onSuccess();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Gagal mengirim pengajuan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-emerald-700">Form Pengajuan Service Kendaraan</CardTitle>
            <CardDescription>Isi form berikut untuk mengajukan service kendaraan dinas</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Plat Nomor Kendaraan */}
              <div>
                <Label>Plat Nomor Kendaraan</Label>
                <Input
                  placeholder="Contoh: KT 1234 AB"
                  value={platNomor}
                  onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan plat nomor kendaraan dinas yang akan di-service.
                </p>
              </div>

              {/* Detail Kerusakan */}
              <div>
                <Label>Detail Kerusakan / Keluhan</Label>
                <Textarea
                  placeholder="Jelaskan kerusakan atau keluhan kendaraan..."
                  value={detailKerusakan}
                  onChange={(e) => setDetailKerusakan(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Tanggal Rencana Service */}
              <div>
                <Label>Tanggal Rencana Service</Label>
                <Input
                  type="date"
                  min={minDate}
                  value={tanggalRencana}
                  onChange={(e) => setTanggalRencana(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Tanda Tangan Digital */}
              <div>
                <Label>Tanda Tangan Digital (Nama Terang)</Label>
                <Input
                  placeholder="Ketik nama lengkap sebagai tanda tangan..."
                  value={ttdPemohon}
                  onChange={(e) => setTtdPemohon(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dengan mengetik nama lengkap, Anda menyatakan bahwa data yang diisi adalah benar.
                </p>
              </div>
            </CardContent>
            <CardFooter className="gap-3">
              <Button type="button" variant="outline" onClick={onBack}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? 'Mengirim...' : 'KIRIM PENGAJUAN'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Detail Pengajuan Component
function DetailPengajuan({
  pengajuan,
  user,
  onBack,
  onApprove,
  onReject,
}: {
  pengajuan: Pengajuan;
  user: User;
  onBack: () => void;
  onApprove: (ttdKasubag: string) => void;
  onReject: (alasan: string) => void;
}) {
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [ttdKasubag, setTtdKasubag] = useState('');
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!ttdKasubag.trim()) {
      toast({ title: 'Error', description: 'Tanda tangan harus diisi', variant: 'destructive' });
      return;
    }
    setLoading(true);
    await onApprove(ttdKasubag);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!alasanPenolakan.trim()) {
      toast({ title: 'Error', description: 'Alasan penolakan harus diisi', variant: 'destructive' });
      return;
    }
    setLoading(true);
    await onReject(alasanPenolakan);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return <Badge className="bg-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> DISETUJUI</Badge>;
      case 'ditolak':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" /> DITOLAK</Badge>;
      default:
        return <Badge className="bg-amber-500"><Clock className="w-3 h-3 mr-1" /> MENUNGGU</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-emerald-700">Detail Pengajuan Service</CardTitle>
              {getStatusBadge(pengajuan.status)}
            </div>
            <CardDescription>
              ID: {pengajuan.id.slice(0, 8).toUpperCase()}
              {pengajuan.nomorSurat && <span className="ml-2 text-emerald-600">• No. {pengajuan.nomorSurat}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info Pemohon */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Informasi Pemohon</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Nama:</span> {pengajuan.user?.namaLengkap}</p>
                  <p><span className="text-gray-500">NIP:</span> {pengajuan.user?.nip || '-'}</p>
                  <p><span className="text-gray-500">Unit Kerja:</span> {pengajuan.user?.unitKerja || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Informasi Kendaraan</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Plat Nomor:</span> {pengajuan.kendaraan?.platNomor}</p>
                  <p><span className="text-gray-500">Merk/Model:</span> {pengajuan.kendaraan?.merkModel}</p>
                  <p><span className="text-gray-500">Tahun:</span> {pengajuan.kendaraan?.tahunPembelian || '-'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detail Pengajuan */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Detail Pengajuan</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{pengajuan.detailKerusakan}</p>
              </div>
              <p className="text-sm"><span className="text-gray-500">Tanggal Rencana Service:</span> {new Date(pengajuan.tanggalRencana).toLocaleDateString('id-ID')}</p>
              <p className="text-sm"><span className="text-gray-500">Tanggal Pengajuan:</span> {new Date(pengajuan.tanggalPengajuan).toLocaleDateString('id-ID')}</p>
            </div>

            <Separator />

            {/* Tanda Tangan */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Tanda Tangan Pemohon</h4>
                <div className="p-3 border rounded-lg bg-white">
                  <p className="italic text-lg" style={{ fontFamily: 'Georgia, serif' }}>{pengajuan.ttdPemohon}</p>
                </div>
              </div>
              {pengajuan.ttdKasubag && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Tanda Tangan Kasubag</h4>
                  <div className="p-3 border rounded-lg bg-white">
                    <p className="italic text-lg" style={{ fontFamily: 'Georgia, serif' }}>{pengajuan.ttdKasubag}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Alasan Penolakan */}
            {pengajuan.status === 'ditolak' && pengajuan.alasanPenolakan && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Alasan Penolakan</h4>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{pengajuan.alasanPenolakan}</p>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons for Kasubag */}
            {user.role === 'kasubag' && pengajuan.status === 'menunggu' && (
              <>
                <Separator />
                <div className="space-y-4">
                  {!showApproveForm && !showRejectForm ? (
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => setShowApproveForm(true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Setujui
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => setShowRejectForm(true)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Tolak
                      </Button>
                    </div>
                  ) : showApproveForm ? (
                    <div className="space-y-3 p-4 border rounded-lg bg-emerald-50">
                      <h4 className="font-medium text-emerald-700">Setujui Pengajuan</h4>
                      <div>
                        <Label>Tanda Tangan Digital (Nama Terang)</Label>
                        <Input
                          placeholder="Ketik nama lengkap sebagai tanda tangan..."
                          value={ttdKasubag}
                          onChange={(e) => setTtdKasubag(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowApproveForm(false)}>Batal</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove} disabled={loading}>
                          {loading ? 'Memproses...' : 'Setujui'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 border rounded-lg bg-red-50">
                      <h4 className="font-medium text-red-700">Tolak Pengajuan</h4>
                      <div>
                        <Label>Alasan Penolakan</Label>
                        <Textarea
                          placeholder="Jelaskan alasan penolakan..."
                          value={alasanPenolakan}
                          onChange={(e) => setAlasanPenolakan(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowRejectForm(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={loading}>
                          {loading ? 'Memproses...' : 'Tolak'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Download PDF Button */}
            {pengajuan.status === 'disetujui' && (
              <>
                <Separator />
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    generateSuratPengajuan(pengajuan);
                    toast({ title: 'Berhasil', description: 'Surat PDF berhasil diunduh' });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" /> Download Surat PDF
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Settings Kasubag Component
function SettingsKasubag({
  user,
  onBack,
  onUpdated,
}: {
  user: User;
  onBack: () => void;
  onUpdated: (updatedUser: User) => void;
}) {
  const [namaLengkap, setNamaLengkap] = useState(user.namaLengkap);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      toast({ title: 'Error', description: 'Nama lengkap tidak boleh kosong', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          namaLengkap: namaLengkap.trim(),
        }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        onUpdated(data.user);
        toast({ title: 'Berhasil', description: 'Nama berhasil diperbarui' });
      } else {
        toast({ title: 'Error', description: data.error || 'Gagal memperbarui data', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Update error:', err);
      toast({ title: 'Error', description: 'Terjadi kesalahan pada server', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-amber-700 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Pengaturan
            </CardTitle>
            <CardDescription>Kelola informasi Kasubag Umum</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label>Nama Lengkap Kasubag</Label>
                <Input
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="mt-1"
                  placeholder="Masukkan nama lengkap..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nama ini akan digunakan untuk tanda tangan pada surat pengajuan service.
                </p>
              </div>
            </CardContent>
            <CardFooter className="gap-3">
              <Button type="button" variant="outline" onClick={onBack}>
                Batal
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={loading}>
                {loading ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Dashboard Kasubag Component
function DashboardKasubag({
  user,
  pengajuanList,
  onLogout,
  onViewDetail,
  onRiwayat,
  onDataKendaraan,
  onExport,
  onSettings,
  onRefresh,
}: {
  user: User;
  pengajuanList: Pengajuan[];
  onLogout: () => void;
  onViewDetail: (pengajuan: Pengajuan) => void;
  onRiwayat: () => void;
  onDataKendaraan: () => void;
  onExport: () => void;
  onSettings: () => void;
  onRefresh: () => void;
}) {
  const menungguCount = pengajuanList.filter(p => p.status === 'menunggu').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">DP3AKB</h2>
              <p className="text-xs text-gray-500">Kasubag Umum</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start bg-amber-50 text-amber-700">
            <FileText className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={onRiwayat}>
            <History className="w-4 h-4 mr-2" /> Riwayat
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={onDataKendaraan}>
            <Car className="w-4 h-4 mr-2" /> Data Kendaraan
          </Button>
          <Button variant="ghost" className="w-full justify-start text-emerald-600" onClick={onExport}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Data
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={onSettings}>
            <Settings className="w-4 h-4 mr-2" /> Pengaturan
          </Button>
          <Separator className="my-2" />
          <Button variant="ghost" className="w-full justify-start text-red-600" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-600" />
            <span className="font-semibold">Kasubag</span>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-6 border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Dashboard Kasubag Umum</CardTitle>
              <CardDescription>Halo, <span className="font-medium text-amber-700">{user.namaLengkap}</span></CardDescription>
            </CardHeader>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="text-center">
              <CardContent className="pt-4">
                <p className="text-3xl font-bold text-amber-600">{menungguCount}</p>
                <p className="text-xs text-gray-500">Menunggu</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <p className="text-3xl font-bold text-emerald-600">{pengajuanList.filter(p => p.status === 'disetujui').length}</p>
                <p className="text-xs text-gray-500">Disetujui</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <p className="text-3xl font-bold text-red-600">{pengajuanList.filter(p => p.status === 'ditolak').length}</p>
                <p className="text-xs text-gray-500">Ditolak</p>
              </CardContent>
            </Card>
          </div>

          {/* Antrean Persetujuan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" /> Antrean Persetujuan
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {pengajuanList.filter(p => p.status === 'menunggu').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                  <p>Tidak ada pengajuan menunggu persetujuan</p>
                </div>
              ) : (
                <ScrollArea className="max-h-96">
                  <div className="space-y-3">
                    {pengajuanList.filter(p => p.status === 'menunggu').map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-l-amber-400">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{item.user?.namaLengkap}</span>
                              <span className="text-sm text-gray-500">({item.kendaraan?.platNomor})</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.detailKerusakan}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(item.tanggalPengajuan).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => onViewDetail(item)}>
                            <Eye className="w-3 h-3 mr-1" /> LIHAT DETAIL
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Riwayat Kasubag Component
function RiwayatKasubag({
  pengajuanList,
  onBack,
}: {
  pengajuanList: Pengajuan[];
  onBack: () => void;
}) {
  const [filter, setFilter] = useState('semua');

  const filteredList = pengajuanList.filter(p => {
    if (filter === 'semua') return p.status !== 'menunggu';
    return p.status === filter;
  });

  const handlePrint = (pengajuan: Pengajuan) => {
    generateSuratPengajuan(pengajuan);
    toast({ title: 'Berhasil', description: 'Surat PDF berhasil diunduh' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5" /> Riwayat Keputusan
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant={filter === 'semua' ? 'default' : 'outline'}
                onClick={() => setFilter('semua')}
              >
                Semua
              </Button>
              <Button 
                size="sm" 
                variant={filter === 'disetujui' ? 'default' : 'outline'}
                onClick={() => setFilter('disetujui')}
                className={filter === 'disetujui' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                Disetujui
              </Button>
              <Button 
                size="sm" 
                variant={filter === 'ditolak' ? 'destructive' : 'outline'}
                onClick={() => setFilter('ditolak')}
              >
                Ditolak
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Belum ada riwayat keputusan</p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tanggal</th>
                      <th className="text-left p-2">Pemohon</th>
                      <th className="text-left p-2">Kendaraan</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(item.tanggalPutusan || item.tanggalPengajuan).toLocaleDateString('id-ID')}</td>
                        <td className="p-2">{item.user?.namaLengkap}</td>
                        <td className="p-2">{item.kendaraan?.platNomor}</td>
                        <td className="p-2">
                          {item.status === 'disetujui' ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Disetujui
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Ditolak
                            </span>
                          )}
                        </td>
                        <td className="p-2">
                          {item.status === 'disetujui' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                              onClick={() => handlePrint(item)}
                            >
                              <Printer className="w-3 h-3 mr-1" /> Cetak
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Data Kendaraan Component
function DataKendaraan({
  onBack,
}: {
  onBack: () => void;
}) {
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [platNomor, setPlatNomor] = useState('');
  const [merkModel, setMerkModel] = useState('');
  const [namaPengguna, setNamaPengguna] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchKendaraan = () => {
    setLoading(true);
    fetch('/api/kendaraan')
      .then(res => res.json())
      .then(data => {
        setKendaraanList(data);
        setLoading(false);
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Gagal memuat data kendaraan', variant: 'destructive' });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKendaraan();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platNomor.trim() || !merkModel.trim()) {
      toast({ title: 'Error', description: 'Plat nomor dan merk harus diisi', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/kendaraan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platNomor: platNomor.toUpperCase().trim(),
          merkModel: merkModel.trim(),
          namaPengguna: namaPengguna.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast({ title: 'Berhasil', description: 'Data kendaraan berhasil ditambahkan' });
      setPlatNomor('');
      setMerkModel('');
      setNamaPengguna('');
      setShowForm(false);
      fetchKendaraan();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Gagal menambahkan kendaraan', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge className="bg-emerald-500">Aktif</Badge>;
      case 'service':
        return <Badge className="bg-amber-500">Service</Badge>;
      default:
        return <Badge className="bg-gray-500">Afkir</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        {/* Form Input Kendaraan */}
        {showForm && (
          <Card className="mb-4 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                <Plus className="w-5 h-5" /> Tambah Data Kendaraan
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Plat Nomor *</Label>
                    <Input
                      placeholder="Contoh: KT 1234 AB"
                      value={platNomor}
                      onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Merk/Model *</Label>
                    <Input
                      placeholder="Contoh: Honda Beat"
                      value={merkModel}
                      onChange={(e) => setMerkModel(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Nama Pengguna</Label>
                    <Input
                      placeholder="Contoh: Ahmad"
                      value={namaPengguna}
                      onChange={(e) => setNamaPengguna(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'SIMPAN'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5" /> Data Kendaraan
                </CardTitle>
                <CardDescription>Master data kendaraan dinas roda 2</CardDescription>
              </div>
              {!showForm && (
                <Button 
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Kendaraan
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Memuat data...</div>
            ) : (
              <ScrollArea className="max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Plat Nomor</th>
                      <th className="text-left p-2">Merk/Model</th>
                      <th className="text-left p-2">Nama Pengguna</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kendaraanList.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{item.platNomor}</td>
                        <td className="p-2">{item.merkModel}</td>
                        <td className="p-2">{item.namaPengguna || '-'}</td>
                        <td className="p-2">{getStatusBadge(item.statusKendaraan)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export Data Component
function ExportData({
  pengajuanList,
  onBack,
}: {
  pengajuanList: Pengajuan[];
  onBack: () => void;
}) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    
    try {
      // Filter data based on selected filters
      let filteredData = [...pengajuanList];
      
      if (statusFilter !== 'semua') {
        filteredData = filteredData.filter(p => p.status === statusFilter);
      }
      
      if (dateFrom) {
        filteredData = filteredData.filter(p => 
          new Date(p.tanggalPengajuan) >= new Date(dateFrom)
        );
      }
      
      if (dateTo) {
        filteredData = filteredData.filter(p => 
          new Date(p.tanggalPengajuan) <= new Date(dateTo + 'T23:59:59')
        );
      }

      if (filteredData.length === 0) {
        toast({ title: 'Info', description: 'Tidak ada data untuk diexport', variant: 'destructive' });
        setExporting(false);
        return;
      }

      // Create CSV content
      const headers = [
        'No',
        'Nomor Surat',
        'Tanggal Pengajuan',
        'Nama Pemohon',
        'NIP Pemohon',
        'Unit Kerja',
        'Plat Nomor',
        'Merk/Model',
        'Detail Kerusakan',
        'Tanggal Rencana',
        'Status',
        'Tanggal Putusan',
        'Nama Kasubag',
        'Alasan Penolakan'
      ];

      const rows = filteredData.map((p, index) => [
        index + 1,
        p.nomorSurat || '-',
        new Date(p.tanggalPengajuan).toLocaleDateString('id-ID'),
        p.user?.namaLengkap || '-',
        p.user?.nip || '-',
        p.user?.unitKerja || '-',
        p.kendaraan?.platNomor || '-',
        p.kendaraan?.merkModel || '-',
        `"${p.detailKerusakan.replace(/"/g, '""')}"`,
        new Date(p.tanggalRencana).toLocaleDateString('id-ID'),
        p.status === 'menunggu' ? 'Menunggu' : p.status === 'disetujui' ? 'Disetujui' : 'Ditolak',
        p.tanggalPutusan ? new Date(p.tanggalPutusan).toLocaleDateString('id-ID') : '-',
        p.kasubag?.namaLengkap || '-',
        p.alasanPenolakan ? `"${p.alasanPenolakan.replace(/"/g, '""')}"` : '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Add BOM for Excel to recognize UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Data_Pengajuan_Service_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Berhasil', description: `Berhasil mengexport ${filteredData.length} data` });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengexport data', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    setExporting(true);
    
    try {
      // Filter data based on selected filters
      let filteredData = [...pengajuanList];
      
      if (statusFilter !== 'semua') {
        filteredData = filteredData.filter(p => p.status === statusFilter);
      }
      
      if (dateFrom) {
        filteredData = filteredData.filter(p => 
          new Date(p.tanggalPengajuan) >= new Date(dateFrom)
        );
      }
      
      if (dateTo) {
        filteredData = filteredData.filter(p => 
          new Date(p.tanggalPengajuan) <= new Date(dateTo + 'T23:59:59')
        );
      }

      if (filteredData.length === 0) {
        toast({ title: 'Info', description: 'Tidak ada data untuk diexport', variant: 'destructive' });
        setExporting(false);
        return;
      }

      // Create printable HTML
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({ title: 'Error', description: 'Popup diblokir. Mohon izinkan popup.', variant: 'destructive' });
        setExporting(false);
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Pengajuan Service - DP3AKB</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 10pt; margin: 20px; }
            h1 { text-align: center; font-size: 14pt; margin-bottom: 5px; }
            h2 { text-align: center; font-size: 12pt; font-weight: normal; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 4px 6px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .status-menunggu { background-color: #fff3cd; }
            .status-disetujui { background-color: #d4edda; }
            .status-ditolak { background-color: #f8d7da; }
            .footer { margin-top: 20px; text-align: right; font-size: 9pt; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>LAPORAN PENGAJUAN SERVICE KENDARAAN</h1>
          <h2>DP3AKB Kota Balikpapan</h2>
          <p>Periode: ${dateFrom ? new Date(dateFrom).toLocaleDateString('id-ID') : 'Semua'} - ${dateTo ? new Date(dateTo).toLocaleDateString('id-ID') : 'Sekarang'}</p>
          <p>Status: ${statusFilter === 'semua' ? 'Semua' : statusFilter === 'menunggu' ? 'Menunggu' : statusFilter === 'disetujui' ? 'Disetujui' : 'Ditolak'}</p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>No. Surat</th>
                <th>Tanggal</th>
                <th>Nama Pemohon</th>
                <th>Plat Nomor</th>
                <th>Kerusakan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((p, i) => `
                <tr class="status-${p.status}">
                  <td>${i + 1}</td>
                  <td>${p.nomorSurat || '-'}</td>
                  <td>${new Date(p.tanggalPengajuan).toLocaleDateString('id-ID')}</td>
                  <td>${p.user?.namaLengkap || '-'}</td>
                  <td>${p.kendaraan?.platNomor || '-'}</td>
                  <td>${p.detailKerusakan.substring(0, 50)}${p.detailKerusakan.length > 50 ? '...' : ''}</td>
                  <td>${p.status === 'menunggu' ? 'Menunggu' : p.status === 'disetujui' ? 'Disetujui' : 'Ditolak'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 10px;"><strong>Total: ${filteredData.length} pengajuan</strong></p>
          <div class="footer">
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      toast({ title: 'Berhasil', description: `Berhasil menyiapkan laporan ${filteredData.length} data` });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal membuat laporan', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" /> Export Data Pengajuan
            </CardTitle>
            <CardDescription>Export data pengajuan service ke CSV atau cetak laporan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Tanggal Mulai</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tanggal Akhir</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Status</SelectItem>
                    <SelectItem value="menunggu">Menunggu</SelectItem>
                    <SelectItem value="disetujui">Disetujui</SelectItem>
                    <SelectItem value="ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">{pengajuanList.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{pengajuanList.filter(p => p.status === 'menunggu').length}</p>
                <p className="text-xs text-gray-500">Menunggu</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{pengajuanList.filter(p => p.status === 'disetujui').length}</p>
                <p className="text-xs text-gray-500">Disetujui</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{pengajuanList.filter(p => p.status === 'ditolak').length}</p>
                <p className="text-xs text-gray-500">Ditolak</p>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                onClick={exportToCSV}
                disabled={exporting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" /> 
                {exporting ? 'Memproses...' : 'Export ke CSV (Excel)'}
              </Button>
              <Button 
                onClick={exportToPDF}
                disabled={exporting}
                variant="outline"
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" /> 
                {exporting ? 'Memproses...' : 'Cetak Laporan (PDF)'}
              </Button>
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              <p><strong>Petunjuk:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Export CSV: Data akan diunduh dalam format CSV yang bisa dibuka di Excel</li>
                <li>Cetak Laporan: Akan membuka jendela baru untuk mencetak laporan</li>
                <li>Gunakan filter tanggal dan status untuk memilih data yang diinginkan</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main App Component
export default function Home() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const [view, setView] = useState<ViewType>('landing');
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'pemohon') {
        setView('dashboard-pemohon');
        fetchPengajuan(user.id);
      } else if (user.role === 'kasubag') {
        setView('dashboard-kasubag');
        fetchPengajuan();
      }
    }
  }, [isAuthenticated, user]);

  const fetchPengajuan = async (userId?: string) => {
    const url = userId ? `/api/pengajuan?userId=${userId}` : '/api/pengajuan';
    try {
      const res = await fetch(url);
      const data = await res.json();
      setPengajuanList(data);
    } catch {
      toast({ title: 'Error', description: 'Gagal memuat data pengajuan', variant: 'destructive' });
    }
  };

  const handleSelectRole = (role: 'pemohon' | 'kasubag') => {
    setView(role === 'pemohon' ? 'login-pemohon' : 'login-kasubag');
  };

  const handleLogin = (loggedInUser: User) => {
    login(loggedInUser);
    if (loggedInUser.role === 'pemohon') {
      setView('dashboard-pemohon');
      fetchPengajuan(loggedInUser.id);
    } else {
      setView('dashboard-kasubag');
      fetchPengajuan();
    }
  };

  const handleLogout = () => {
    logout();
    setView('landing');
    setPengajuanList([]);
    setSelectedPengajuan(null);
  };

  const handleApprove = async (ttdKasubag: string) => {
    if (!selectedPengajuan || !user) return;
    
    try {
      const res = await fetch('/api/pengajuan/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pengajuanId: selectedPengajuan.id,
          kasubagId: user.id,
          ttdKasubag,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast({ title: 'Berhasil', description: 'Pengajuan berhasil disetujui' });
      setSelectedPengajuan(null);
      setView('dashboard-kasubag');
      fetchPengajuan();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Gagal menyetujui pengajuan', variant: 'destructive' });
    }
  };

  const handleReject = async (alasanPenolakan: string) => {
    if (!selectedPengajuan || !user) return;
    
    try {
      const res = await fetch('/api/pengajuan/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pengajuanId: selectedPengajuan.id,
          kasubagId: user.id,
          alasanPenolakan,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast({ title: 'Berhasil', description: 'Pengajuan telah ditolak' });
      setSelectedPengajuan(null);
      setView('dashboard-kasubag');
      fetchPengajuan();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Gagal menolak pengajuan', variant: 'destructive' });
    }
  };

  // Render based on current view
  if (view === 'landing') {
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  if (view === 'login-pemohon') {
    return <LoginPemohon onBack={() => setView('landing')} onLogin={handleLogin} />;
  }

  if (view === 'login-kasubag') {
    return <LoginKasubag onBack={() => setView('landing')} onLogin={handleLogin} />;
  }

  if (view === 'dashboard-pemohon' && user) {
    return (
      <DashboardPemohon
        user={user}
        pengajuanList={pengajuanList}
        onLogout={handleLogout}
        onNewRequest={() => setView('form-pengajuan')}
        onViewDetail={(pengajuan) => {
          setSelectedPengajuan(pengajuan);
          setView('detail-pengajuan');
        }}
        onRefresh={() => fetchPengajuan(user.id)}
      />
    );
  }

  if (view === 'form-pengajuan' && user) {
    return (
      <FormPengajuan
        userId={user.id}
        onBack={() => {
          setView('dashboard-pemohon');
          fetchPengajuan(user.id);
        }}
        onSuccess={() => {
          setView('dashboard-pemohon');
          fetchPengajuan(user.id);
        }}
      />
    );
  }

  if (view === 'dashboard-kasubag' && user) {
    return (
      <DashboardKasubag
        user={user}
        pengajuanList={pengajuanList}
        onLogout={handleLogout}
        onViewDetail={(pengajuan) => {
          setSelectedPengajuan(pengajuan);
          setView('detail-pengajuan');
        }}
        onRiwayat={() => setView('riwayat-kasubag')}
        onDataKendaraan={() => setView('data-kendaraan')}
        onExport={() => setView('export-data')}
        onSettings={() => setView('settings')}
        onRefresh={() => fetchPengajuan()}
      />
    );
  }

  if (view === 'detail-pengajuan' && selectedPengajuan && user) {
    return (
      <DetailPengajuan
        pengajuan={selectedPengajuan}
        user={user}
        onBack={() => {
          setSelectedPengajuan(null);
          setView(user.role === 'kasubag' ? 'dashboard-kasubag' : 'dashboard-pemohon');
          fetchPengajuan(user.role === 'kasubag' ? undefined : user.id);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }

  if (view === 'riwayat-kasubag') {
    return (
      <RiwayatKasubag
        pengajuanList={pengajuanList}
        onBack={() => setView('dashboard-kasubag')}
      />
    );
  }

  if (view === 'data-kendaraan') {
    return (
      <DataKendaraan
        onBack={() => setView('dashboard-kasubag')}
      />
    );
  }

  if (view === 'export-data') {
    return (
      <ExportData
        pengajuanList={pengajuanList}
        onBack={() => setView('dashboard-kasubag')}
      />
    );
  }

  if (view === 'settings' && user) {
    return (
      <SettingsKasubag
        user={user}
        onBack={() => setView('dashboard-kasubag')}
        onUpdated={(updatedUser) => {
          updateUser(updatedUser);
          setView('dashboard-kasubag');
        }}
      />
    );
  }

  // Default fallback
  return <LandingPage onSelectRole={handleSelectRole} />;
}
