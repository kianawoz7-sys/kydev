# PRODUCT REQUIREMENTS DOCUMENT

## Website Jasa Pembuatan Name Tag Mahasiswa Baru

**Nama produk sementara:** MabaTag
**Versi dokumen:** 1.0
**Jenis produk:** Website pemesanan jasa
**Target platform:** Website desktop dan mobile
**Model bisnis:** Jasa pembuatan name tag atau ID card untuk mahasiswa baru
**Status pengembangan:** MVP

---

# 1. Product Overview

MabaTag merupakan website yang membantu mahasiswa baru memesan jasa pembuatan name tag atau ID card untuk kegiatan kampus seperti PKKMB, IMM Teknik, IONIK, ospek fakultas, dan kegiatan organisasi mahasiswa lainnya.

Melalui website ini, mahasiswa dapat memilih jenis jasa, membaca persyaratan, mengisi data, mengunggah foto, melihat QRIS pembayaran, mengunggah bukti pembayaran, lalu menghubungi admin melalui WhatsApp.

Admin dapat mengelola jenis jasa, melihat pesanan yang masuk, memverifikasi pembayaran, mengubah status pengerjaan, mencari pesanan, serta menyortir pesanan berdasarkan fakultas, program studi, jenis jasa, dan status pesanan.

Website tidak dimaksudkan sebagai website resmi kampus atau panitia kegiatan. Website hanya menjadi platform pemesanan jasa pembuatan name tag secara mandiri.

---

# 2. Problem Statement

Sistem pemesanan name tag yang dilakukan sepenuhnya melalui WhatsApp memiliki beberapa masalah.

## 2.1 Masalah dari sisi pelanggan

Mahasiswa baru harus menyalin format pemesanan secara manual.

Contoh:

* Nama
* Program studi
* Kelompok
* Tempat dan tanggal lahir
* Alamat
* Motto hidup
* Foto

Pelanggan sering lupa mengisi beberapa data atau mengirim foto yang tidak sesuai ketentuan.

Pelanggan juga tidak mengetahui:

* Apakah pembayaran sudah diterima.
* Apakah data sudah lengkap.
* Apakah name tag sedang dikerjakan.
* Kapan pesanan selesai.
* Apakah masih tersedia slot pemesanan.

Akibatnya, pelanggan harus berulang kali menanyakan status melalui WhatsApp.

## 2.2 Masalah dari sisi admin

Admin menerima data pelanggan dalam format yang berbeda-beda.

Contohnya, satu program studi dapat ditulis dengan beberapa cara:

* Teknik Informatika
* Informatika
* TI
* Teknik informatika

Hal tersebut membuat pesanan sulit dikelompokkan dan disortir.

Admin juga harus mencari secara manual:

* Foto pelanggan.
* Bukti pembayaran.
* Data name tag.
* Percakapan pelanggan.
* Status pengerjaan.

Ketika pesanan bertambah banyak, admin berisiko:

* Kehilangan data.
* Salah memasukkan data.
* Melewatkan pembayaran.
* Membuat pesanan dua kali.
* Tidak mengetahui pesanan yang belum selesai.
* Kesulitan menghitung jumlah pesanan.
* Kesulitan mengelompokkan pesanan untuk proses cetak.

## 2.3 Kesimpulan masalah

Dibutuhkan sebuah website yang dapat mengumpulkan semua data pesanan dalam format yang terstruktur dan menyediakan dashboard sederhana untuk membantu admin mengelola pesanan.

---

# 3. Product Goals

## 3.1 Tujuan utama

Membuat proses pemesanan name tag lebih mudah bagi mahasiswa baru dan lebih terorganisasi bagi admin.

## 3.2 Tujuan pelanggan

Pelanggan dapat:

* Melihat jasa yang tersedia.
* Mengetahui harga dan kuota.
* Membaca persyaratan.
* Mengisi data dengan format yang benar.
* Mengunggah foto.
* Melakukan pembayaran menggunakan QRIS.
* Mengunggah bukti pembayaran.
* Mendapatkan kode pesanan.
* Menghubungi admin melalui WhatsApp.
* Memeriksa status pesanan.

## 3.3 Tujuan admin

Admin dapat:

* Menambahkan jasa baru.
* Mengubah informasi jasa.
* Menonaktifkan jasa.
* Melihat semua pesanan.
* Memverifikasi pembayaran.
* Mengubah status pesanan.
* Mengedit data pesanan.
* Mengelompokkan pesanan berdasarkan fakultas dan program studi.
* Mencari pesanan berdasarkan nama, nomor WhatsApp, atau kode pesanan.
* Melihat jumlah pesanan masuk dan selesai.
* Mengunduh data pesanan dalam format CSV atau Excel.
* Mengunduh foto pelanggan untuk kebutuhan desain dan cetak.

## 3.4 Tujuan bisnis

Website diharapkan dapat:

* Mengurangi waktu yang dibutuhkan untuk melayani satu pelanggan.
* Mengurangi kesalahan data.
* Membantu menerima lebih banyak pesanan.
* Membuat jasa dapat digunakan kembali setiap tahun.
* Mempermudah pembukaan jasa untuk kegiatan kampus yang berbeda.
* Meningkatkan kepercayaan pelanggan melalui alur pemesanan yang jelas.

---

# 4. Success Metrics

MVP dianggap berhasil apabila:

* Minimal 80% pelanggan dapat menyelesaikan pemesanan tanpa bantuan admin.
* Semua pesanan masuk tersimpan di database.
* Admin dapat menemukan pesanan dalam waktu kurang dari 30 detik.
* Admin dapat menyortir pesanan berdasarkan fakultas dan program studi.
* Tidak ada pesanan tanpa kode pesanan.
* Data dan foto pelanggan dapat diakses dari halaman detail pesanan.
* Admin dapat mengetahui jumlah pesanan yang belum selesai.
* Pelanggan dapat mengetahui status pesanan tanpa bertanya melalui WhatsApp.
* Website dapat digunakan dengan baik melalui perangkat mobile.

---

# 5. Target Users

## 5.1 Mahasiswa baru

Mahasiswa baru merupakan target pengguna utama.

Karakteristik:

* Berusia sekitar 17–22 tahun.
* Mengakses website melalui smartphone.
* Membutuhkan name tag dalam waktu dekat.
* Tidak memiliki waktu atau kemampuan untuk membuat desain sendiri.
* Lebih sering menggunakan WhatsApp.
* Menginginkan proses pemesanan yang cepat.
* Lebih menyukai pembayaran menggunakan QRIS atau transfer.

Kebutuhan:

* Proses pemesanan sederhana.
* Informasi harga yang jelas.
* Persyaratan foto yang mudah dipahami.
* Tidak perlu membuat akun.
* Dapat langsung menghubungi admin.
* Dapat mengetahui status pesanan.

## 5.2 Admin atau pemilik jasa

Admin adalah orang yang menerima dan mengerjakan pesanan.

Karakteristik:

* Mengelola semua pesanan.
* Memeriksa pembayaran.
* Mengunduh foto pelanggan.
* Membuat atau mencetak name tag.
* Berkomunikasi dengan pelanggan melalui WhatsApp.
* Membutuhkan dashboard yang sederhana.

Kebutuhan:

* Login admin yang aman.
* Tabel pesanan.
* Filter dan pencarian.
* Detail data pelanggan.
* Pengelolaan status.
* Pengelolaan jasa.
* Rekap jumlah pesanan.
* Export data.

## 5.3 Staf tambahan

Staf tambahan bersifat opsional dan belum menjadi prioritas MVP.

Contohnya:

* Bagian desain.
* Bagian cetak.
* Bagian pengambilan barang.

Pada versi berikutnya, staf dapat diberikan akun dengan akses terbatas.

---

# 6. User Flow

## 6.1 Alur pelanggan

1. Pelanggan membuka website.
2. Pelanggan melihat daftar jasa yang tersedia.
3. Pelanggan memilih salah satu jasa.
4. Pelanggan membaca:

   * Harga.
   * Kuota.
   * Deadline.
   * Ketentuan.
   * Contoh desain.
5. Pelanggan menekan tombol “Pesan Sekarang”.
6. Pelanggan mengisi data.
7. Pelanggan mengunggah foto.
8. Pelanggan memeriksa ringkasan pesanan.
9. Pelanggan menyetujui syarat dan ketentuan.
10. Pelanggan melihat QRIS.
11. Pelanggan melakukan pembayaran.
12. Pelanggan mengunggah bukti pembayaran.
13. Sistem menyimpan pesanan.
14. Sistem membuat kode pesanan.
15. Pelanggan diarahkan ke halaman pesanan berhasil.
16. Pelanggan dapat menekan tombol konfirmasi melalui WhatsApp.
17. Admin memeriksa pembayaran.
18. Admin mengubah status pesanan.
19. Pelanggan dapat memeriksa status menggunakan kode pesanan.
20. Pesanan diselesaikan dan diserahkan kepada pelanggan.

## 6.2 Alur admin

1. Admin membuka halaman login.
2. Admin memasukkan email dan password.
3. Admin masuk ke dashboard.
4. Admin melihat ringkasan pesanan.
5. Admin melihat pesanan yang menunggu verifikasi.
6. Admin membuka detail pesanan.
7. Admin memeriksa data, foto, dan bukti pembayaran.
8. Admin mengonfirmasi atau menolak pembayaran.
9. Admin mengubah status pengerjaan.
10. Admin menyortir pesanan berdasarkan fakultas dan program studi.
11. Admin mengunduh foto atau data pesanan.
12. Admin mengubah status menjadi selesai.
13. Admin dapat menghubungi pelanggan melalui WhatsApp.

---

# 7. User Stories

## 7.1 User stories pelanggan

### Melihat jasa

Sebagai mahasiswa baru, saya ingin melihat jasa name tag yang sedang tersedia agar saya dapat memilih jasa yang sesuai dengan kegiatan kampus saya.

### Melihat harga

Sebagai mahasiswa baru, saya ingin melihat harga jasa dengan jelas agar saya mengetahui jumlah yang harus dibayar.

### Melihat kuota

Sebagai mahasiswa baru, saya ingin mengetahui jumlah slot yang tersisa agar saya tidak memesan ketika kuota sudah penuh.

### Membaca persyaratan

Sebagai mahasiswa baru, saya ingin membaca ketentuan foto dan data agar pesanan saya tidak ditolak.

### Mengisi data

Sebagai mahasiswa baru, saya ingin mengisi data melalui formulir agar saya tidak perlu menyalin format pemesanan melalui WhatsApp.

### Memilih fakultas dan jurusan

Sebagai mahasiswa baru, saya ingin memilih fakultas dan program studi dari daftar yang tersedia agar data saya tercatat dengan benar.

### Mengunggah foto

Sebagai mahasiswa baru, saya ingin mengunggah foto langsung melalui website agar admin dapat menggunakannya untuk membuat name tag.

### Melakukan pembayaran

Sebagai mahasiswa baru, saya ingin melihat QRIS agar dapat membayar pesanan dengan mudah.

### Mengunggah bukti pembayaran

Sebagai mahasiswa baru, saya ingin mengunggah bukti pembayaran agar admin dapat memverifikasi pembayaran saya.

### Mendapatkan kode pesanan

Sebagai mahasiswa baru, saya ingin mendapatkan kode pesanan agar dapat menyimpan dan memeriksa pesanan saya.

### Menghubungi admin

Sebagai mahasiswa baru, saya ingin menghubungi admin melalui tombol WhatsApp tanpa mengetik ulang data pesanan.

### Mengecek status

Sebagai mahasiswa baru, saya ingin mengecek status pesanan agar tidak perlu terus bertanya kepada admin.

## 7.2 User stories admin

### Login

Sebagai admin, saya ingin masuk menggunakan email dan password agar hanya orang yang berwenang yang dapat membuka dashboard.

### Melihat ringkasan

Sebagai admin, saya ingin melihat jumlah pesanan masuk, diproses, dan selesai agar mengetahui kondisi operasional saat ini.

### Melihat daftar pesanan

Sebagai admin, saya ingin melihat seluruh pesanan dalam sebuah tabel agar mudah mengelolanya.

### Melihat detail pesanan

Sebagai admin, saya ingin melihat data pelanggan, foto, jasa, dan bukti pembayaran dalam satu halaman.

### Memverifikasi pembayaran

Sebagai admin, saya ingin mengubah status pembayaran agar dapat membedakan pesanan yang sudah membayar dan belum membayar.

### Mengubah status pengerjaan

Sebagai admin, saya ingin mengubah status pesanan agar pelanggan mengetahui perkembangan pesanannya.

### Mengedit data

Sebagai admin, saya ingin memperbaiki data pesanan jika pelanggan melakukan kesalahan atau meminta perubahan.

### Menghubungi pelanggan

Sebagai admin, saya ingin membuka WhatsApp pelanggan langsung dari dashboard agar komunikasi lebih cepat.

### Melakukan filter

Sebagai admin, saya ingin menyortir pesanan berdasarkan fakultas, program studi, jasa, dan status agar proses produksi lebih teratur.

### Mencari pesanan

Sebagai admin, saya ingin mencari pesanan berdasarkan nama, kode pesanan, atau nomor WhatsApp.

### Export data

Sebagai admin, saya ingin mengekspor data pesanan agar dapat menggunakannya untuk proses desain, cetak, atau pencatatan.

### Mengelola jasa

Sebagai admin, saya ingin menambah dan mengubah jasa agar website dapat digunakan untuk berbagai kegiatan dan tahun yang berbeda.

---

# 8. Functional Requirements

## 8.1 Landing page

Sistem harus menyediakan halaman utama yang berisi:

* Nama atau logo jasa.
* Deskripsi singkat.
* Penjelasan cara pemesanan.
* Daftar jasa yang sedang aktif.
* Tombol WhatsApp.
* Informasi kontak.
* Syarat dan ketentuan umum.
* Pernyataan bahwa jasa tidak berafiliasi resmi dengan kampus.

Setiap kartu jasa harus menampilkan:

* Nama jasa.
* Gambar atau contoh desain.
* Harga.
* Kuota.
* Sisa slot.
* Deadline.
* Status tersedia atau penuh.
* Tombol lihat detail.

## 8.2 Halaman detail jasa

Halaman detail jasa harus menampilkan:

* Nama jasa.
* Deskripsi.
* Contoh desain.
* Harga.
* Isi paket.
* Kuota.
* Sisa slot.
* Deadline pemesanan.
* Estimasi pengerjaan.
* Ketentuan foto.
* Ketentuan data.
* Metode penyerahan.
* Kebijakan revisi.
* Tombol pesan sekarang.

Apabila kuota penuh atau deadline sudah lewat, tombol pesan harus dinonaktifkan.

## 8.3 Formulir pemesanan

Formulir harus mendukung data berikut:

* Nama lengkap.
* Nomor WhatsApp.
* Fakultas.
* Program studi.
* Kelompok.
* Tempat lahir.
* Tanggal lahir.
* Alamat.
* Motto hidup.
* Catatan tambahan.
* Upload foto.

Tidak semua field harus selalu digunakan.

Admin harus dapat menentukan field:

* Wajib diisi.
* Opsional.
* Tidak ditampilkan.

Validasi formulir:

* Nama tidak boleh kosong.
* Nomor WhatsApp harus menggunakan format yang valid.
* Fakultas harus dipilih.
* Program studi harus dipilih.
* Foto harus menggunakan format yang didukung.
* Ukuran foto harus dibatasi.
* Data wajib harus terisi sebelum formulir dilanjutkan.

## 8.4 Upload foto

Sistem harus menerima format:

* JPG.
* JPEG.
* PNG.
* WEBP.

Ukuran maksimal foto disarankan 5 MB.

Sistem harus:

* Menampilkan preview foto.
* Memungkinkan pelanggan mengganti foto sebelum mengirim pesanan.
* Menolak file yang bukan gambar.
* Menyimpan foto dengan nama file yang unik.

## 8.5 Ringkasan pesanan

Sebelum pembayaran, pelanggan harus melihat ringkasan:

* Nama.
* Fakultas.
* Program studi.
* Kelompok.
* Jasa.
* Harga.
* Data tambahan.
* Foto.

Pelanggan harus menyetujui pernyataan:

“Saya sudah memastikan seluruh data yang dimasukkan benar.”

## 8.6 Halaman pembayaran

Halaman pembayaran harus menampilkan:

* Gambar QRIS.
* Nama penerima pembayaran.
* Total pembayaran.
* Instruksi pembayaran.
* Batas waktu pembayaran.
* Upload bukti pembayaran.
* Tombol konfirmasi pesanan.

Pada MVP, nominal pembayaran belum harus dibuat secara otomatis di dalam QRIS.

QRIS dapat berupa gambar QRIS statis yang dikelola admin.

## 8.7 Upload bukti pembayaran

Bukti pembayaran harus:

* Berupa gambar.
* Memiliki ukuran maksimal.
* Dapat dilihat admin.
* Dihubungkan ke pesanan yang benar.

Setelah bukti pembayaran dikirim, status pembayaran menjadi:

“Menunggu verifikasi.”

## 8.8 Pembuatan kode pesanan

Setiap pesanan harus memiliki kode unik.

Format yang disarankan:

`NT-TANGGAL-NOMOR`

Contoh:

`NT-260718-001`

Kode tidak boleh sama dengan pesanan lainnya.

## 8.9 Halaman pesanan berhasil

Halaman harus menampilkan:

* Pesan bahwa pesanan berhasil dikirim.
* Kode pesanan.
* Nama pelanggan.
* Jenis jasa.
* Total pembayaran.
* Status pembayaran.
* Tombol cek status.
* Tombol WhatsApp.

Pesan WhatsApp harus dibuat otomatis.

Contoh:

“Halo Kak, saya sudah melakukan pemesanan Name Tag PKKMB. Kode pesanan saya NT-260718-001. Bukti pembayaran sudah saya upload melalui website.”

## 8.10 Cek status pesanan

Pelanggan dapat memeriksa pesanan menggunakan:

* Kode pesanan.
* Nomor WhatsApp.

Sistem harus menampilkan:

* Nama pelanggan.
* Jenis jasa.
* Tanggal pemesanan.
* Status pembayaran.
* Status pengerjaan.
* Catatan dari admin.
* Waktu pembaruan terakhir.

Status pengerjaan:

* Menunggu pembayaran.
* Menunggu verifikasi.
* Data perlu diperbaiki.
* Pesanan diterima.
* Sedang didesain.
* Sedang dicetak.
* Selesai.
* Sudah diserahkan.
* Dibatalkan.

Sistem tidak boleh menampilkan data sensitif secara lengkap di halaman publik.

## 8.11 Login admin

Admin harus login menggunakan:

* Email.
* Password.

Tidak tersedia pendaftaran admin secara publik.

Akun admin dibuat langsung melalui sistem autentikasi atau database.

## 8.12 Dashboard admin

Dashboard harus menampilkan kartu ringkasan:

* Total pesanan.
* Pesanan hari ini.
* Menunggu verifikasi pembayaran.
* Sedang dikerjakan.
* Pesanan selesai.
* Pesanan dibatalkan.
* Total pendapatan terverifikasi.

## 8.13 Manajemen pesanan

Admin dapat:

* Melihat daftar pesanan.
* Membuka detail pesanan.
* Menambahkan pesanan secara manual.
* Mengubah data pesanan.
* Mengubah status pembayaran.
* Mengubah status pengerjaan.
* Menambahkan catatan admin.
* Mengunduh foto.
* Mengunduh bukti pembayaran.
* Membuka WhatsApp pelanggan.
* Membatalkan pesanan.
* Menghapus pesanan.

Penghapusan pesanan sebaiknya menggunakan soft delete agar data tidak langsung hilang permanen.

## 8.14 Tabel pesanan

Tabel harus memiliki kolom:

* Kode pesanan.
* Nama.
* Nomor WhatsApp.
* Fakultas.
* Program studi.
* Kelompok.
* Jasa.
* Total.
* Status pembayaran.
* Status pengerjaan.
* Tanggal pemesanan.
* Aksi.

Admin dapat mengurutkan data berdasarkan:

* Pesanan terbaru.
* Pesanan terlama.
* Nama.
* Fakultas.
* Program studi.
* Status.
* Deadline.

## 8.15 Filter pesanan

Admin dapat memfilter berdasarkan:

* Jasa.
* Fakultas.
* Program studi.
* Kelompok.
* Status pembayaran.
* Status pengerjaan.
* Tanggal pemesanan.

Filter dapat digunakan secara bersamaan.

Contoh:

* Fakultas Teknik.
* Program Studi Informatika.
* Pembayaran terverifikasi.
* Status sedang didesain.

## 8.16 Pencarian pesanan

Pencarian harus mendukung:

* Kode pesanan.
* Nama pelanggan.
* Nomor WhatsApp.

## 8.17 Detail pesanan admin

Halaman detail harus menampilkan:

* Kode pesanan.
* Identitas pelanggan.
* Nomor WhatsApp.
* Fakultas.
* Program studi.
* Kelompok.
* Data name tag.
* Foto pelanggan.
* Bukti pembayaran.
* Harga.
* Status pembayaran.
* Status pengerjaan.
* Catatan pelanggan.
* Catatan admin.
* Tanggal pemesanan.
* Riwayat perubahan status.

## 8.18 Manajemen jasa

Admin dapat melakukan CRUD jasa.

Admin dapat:

* Membuat jasa.
* Melihat jasa.
* Mengedit jasa.
* Menonaktifkan jasa.
* Menghapus jasa jika belum memiliki pesanan.
* Menduplikasi jasa lama.

Data jasa meliputi:

* Nama jasa.
* Slug.
* Kategori.
* Deskripsi.
* Harga.
* Kuota.
* Deadline.
* Estimasi selesai.
* Gambar contoh.
* Ketentuan foto.
* Isi paket.
* Status aktif.
* Daftar field pemesanan.
* Urutan tampilan.

## 8.19 Manajemen fakultas dan program studi

Admin dapat:

* Menambahkan fakultas.
* Mengubah nama fakultas.
* Menonaktifkan fakultas.
* Menambahkan program studi.
* Menghubungkan program studi dengan fakultas.
* Menonaktifkan program studi.

Program studi harus mengikuti fakultas yang dipilih pelanggan.

Contoh:

Fakultas Teknik:

* Informatika.
* Teknik Sipil.
* Teknik Industri.
* Teknik Mesin.

## 8.20 Manajemen QRIS

Admin dapat:

* Upload gambar QRIS.
* Mengubah nama pemilik QRIS.
* Mengubah instruksi pembayaran.
* Mengaktifkan atau menonaktifkan metode pembayaran.
* Mengubah nomor rekening atau e-wallet tambahan.

## 8.21 Export data

Admin dapat mengekspor pesanan ke format CSV.

Data export minimal:

* Kode pesanan.
* Nama.
* Fakultas.
* Program studi.
* Kelompok.
* Data name tag.
* Nomor WhatsApp.
* Status pembayaran.
* Status pengerjaan.
* Tanggal pemesanan.

Export harus mengikuti filter yang sedang digunakan.

Contoh:

Jika admin memfilter “Informatika dan pembayaran terverifikasi”, file export hanya berisi pesanan tersebut.

## 8.22 Pengelolaan kuota

Sistem harus:

* Menyimpan jumlah kuota setiap jasa.
* Menghitung jumlah pesanan aktif.
* Menampilkan sisa kuota.
* Menutup formulir ketika kuota habis.

Pesanan yang dibatalkan tidak dihitung sebagai kuota terpakai.

Untuk menghindari pesanan berlebih, sistem harus memeriksa kuota kembali ketika pelanggan mengirim formulir.

---

# 9. Non-Functional Requirements

## 9.1 Performance

* Landing page harus dapat dimuat dengan cepat.
* Waktu muat awal ditargetkan kurang dari 3 detik pada jaringan normal.
* Gambar harus dikompresi.
* Data tabel harus menggunakan pagination jika jumlah pesanan banyak.
* Sistem tidak boleh memuat seluruh foto pelanggan secara bersamaan.
* Foto hanya dimuat ketika diperlukan.

## 9.2 Responsiveness

Website harus dapat digunakan pada:

* Smartphone.
* Tablet.
* Laptop.
* Desktop.

Prioritas desain adalah mobile karena sebagian besar mahasiswa akan memesan melalui smartphone.

## 9.3 Security

* Dashboard hanya dapat diakses admin yang sudah login.
* Password tidak boleh disimpan secara langsung di database.
* Foto pelanggan dan bukti pembayaran tidak boleh menggunakan akses publik permanen.
* Sistem harus menggunakan signed URL atau mekanisme akses terbatas.
* Validasi harus dilakukan di sisi frontend dan backend.
* Pengguna tidak boleh dapat mengubah harga melalui browser.
* Pengguna tidak boleh dapat melihat pesanan milik orang lain.
* Endpoint admin harus dilindungi.
* File upload harus diperiksa berdasarkan tipe dan ukuran.
* Sistem harus memiliki perlindungan dasar dari spam.

## 9.4 Privacy

Website akan menyimpan data pribadi seperti:

* Nama.
* Nomor WhatsApp.
* Tanggal lahir.
* Alamat.
* Foto.
* Bukti pembayaran.

Website harus:

* Menjelaskan penggunaan data.
* Mengambil data hanya yang diperlukan.
* Tidak membagikan data kepada pihak lain.
* Menghapus atau mengarsipkan data lama sesuai kebijakan.
* Membatasi akses data hanya untuk admin.

Disarankan data foto dan bukti pembayaran dihapus 30–60 hari setelah pesanan selesai, kecuali masih dibutuhkan untuk penyelesaian masalah.

## 9.5 Reliability

* Pesanan tidak boleh hilang setelah pelanggan menekan tombol konfirmasi.
* Kode pesanan harus unik.
* Perubahan status harus tersimpan.
* File harus terhubung ke pesanan yang benar.
* Sistem harus memberi pesan kesalahan jika upload gagal.
* Pelanggan tidak boleh melihat halaman sukses jika data belum tersimpan.

## 9.6 Usability

* Pelanggan tidak perlu membuat akun.
* Proses pemesanan maksimal terdiri dari beberapa langkah sederhana.
* Tombol utama harus terlihat jelas.
* Bahasa yang digunakan harus mudah dipahami mahasiswa baru.
* Formulir harus memberi tahu field yang belum lengkap.
* Ketentuan foto sebaiknya dilengkapi contoh.
* Nominal pembayaran harus terlihat jelas.
* Kode pesanan harus mudah disalin.

## 9.7 Compatibility

Website harus mendukung versi terbaru:

* Google Chrome.
* Microsoft Edge.
* Safari.
* Firefox.
* Browser bawaan Android yang menggunakan Chromium.

## 9.8 Maintainability

* Struktur kode harus terpisah berdasarkan fitur.
* Data fakultas dan program studi tidak ditulis langsung di komponen.
* Status pesanan harus menggunakan nilai yang konsisten.
* Konfigurasi QRIS harus dapat diubah tanpa mengedit kode.
* Website harus mudah diperbarui untuk kegiatan atau tahun berikutnya.

## 9.9 Scalability

MVP setidaknya harus mampu mengelola:

* 500–1.000 pesanan dalam satu periode.
* Beberapa jenis jasa aktif secara bersamaan.
* Banyak foto dan bukti pembayaran.
* Beberapa fakultas dan program studi.

## 9.10 Accessibility

* Teks harus memiliki kontras yang cukup.
* Input memiliki label.
* Pesan kesalahan tidak hanya dibedakan menggunakan warna.
* Tombol dapat digunakan melalui layar sentuh.
* Ukuran teks tidak terlalu kecil.
* Foto memiliki teks alternatif jika diperlukan.

---

# 10. Scope

## 10.1 In Scope MVP

Fitur yang termasuk dalam versi pertama:

### Halaman pelanggan

* Landing page.
* Daftar jasa.
* Detail jasa.
* Informasi harga.
* Informasi kuota.
* Informasi deadline.
* Ketentuan foto.
* Form pemesanan.
* Pilihan fakultas.
* Pilihan program studi.
* Upload foto.
* Ringkasan pesanan.
* Halaman pembayaran QRIS.
* Upload bukti pembayaran.
* Kode pesanan.
* Halaman pesanan berhasil.
* Tombol WhatsApp otomatis.
* Halaman cek status.

### Halaman admin

* Login admin.
* Dashboard ringkasan.
* Tabel pesanan.
* Detail pesanan.
* Tambah pesanan manual.
* Edit pesanan.
* Hapus atau batalkan pesanan.
* Verifikasi pembayaran.
* Ubah status pengerjaan.
* Catatan admin.
* Filter fakultas.
* Filter program studi.
* Filter jasa.
* Filter status.
* Pencarian pesanan.
* Download foto.
* Download bukti pembayaran.
* Export CSV.
* CRUD jasa.
* CRUD fakultas.
* CRUD program studi.
* Pengaturan QRIS.
* Pengaturan nomor WhatsApp.

## 10.2 Out of Scope MVP

Fitur berikut belum dikerjakan pada versi pertama:

* Akun pelanggan.
* Login pelanggan.
* Payment gateway otomatis.
* QRIS dinamis.
* Verifikasi pembayaran otomatis.
* Pengiriman otomatis ke percetakan.
* Integrasi ekspedisi.
* Ongkos kirim otomatis.
* Sistem chat di dalam website.
* Aplikasi Android atau iOS.
* Notifikasi WhatsApp API otomatis.
* Notifikasi SMS.
* Notifikasi email otomatis.
* Sistem voucher.
* Sistem referral.
* Poin pelanggan.
* Multi-vendor.
* Banyak cabang.
* Akun staf dengan role berbeda.
* Editor desain name tag secara online.
* Generator name tag otomatis.
* Preview desain final secara otomatis.
* Pembayaran cicilan.
* Refund otomatis.
* Laporan keuangan kompleks.
* Integrasi akuntansi.

Fitur tersebut dapat dipertimbangkan setelah MVP digunakan dan jumlah pesanan mulai meningkat.

---

# 11. Business Rules

* Pelanggan tidak perlu login.
* Admin wajib login.
* Setiap pesanan memiliki satu kode unik.
* Satu pesanan hanya terhubung ke satu jasa.
* Harga pesanan disimpan ketika pesanan dibuat.
* Perubahan harga jasa tidak mengubah harga pesanan lama.
* Pesanan belum dianggap lunas sebelum diverifikasi admin.
* Pesanan dengan pembayaran ditolak dapat mengunggah bukti baru.
* Pesanan hanya mengurangi kuota jika tidak dibatalkan.
* Admin dapat menutup jasa secara manual.
* Jasa otomatis tidak dapat dipesan setelah deadline.
* Pelanggan wajib menyetujui kebenaran data sebelum pembayaran.
* Perubahan data setelah proses desain dimulai dapat dikenakan biaya tambahan.
* Kesalahan akibat data yang diberikan pelanggan menjadi tanggung jawab pelanggan.
* Kesalahan produksi dari admin dapat memperoleh revisi sesuai ketentuan jasa.

---

# 12. Order Status Definition

## Status pembayaran

### Belum bayar

Pelanggan belum mengunggah bukti pembayaran.

### Menunggu verifikasi

Pelanggan sudah mengunggah bukti pembayaran dan menunggu pemeriksaan admin.

### Terverifikasi

Admin sudah memastikan pembayaran diterima.

### Ditolak

Bukti pembayaran tidak valid, tidak jelas, atau pembayaran belum diterima.

### Dikembalikan

Pembayaran telah dikembalikan secara manual oleh admin.

## Status pengerjaan

### Pesanan masuk

Data pesanan sudah tersimpan.

### Data perlu diperbaiki

Data atau foto pelanggan belum memenuhi ketentuan.

### Pesanan diterima

Pembayaran dan data sudah diverifikasi.

### Sedang didesain

Admin sedang membuat desain name tag.

### Sedang dicetak

Desain sudah selesai dan masuk proses produksi.

### Selesai

Name tag sudah selesai dibuat.

### Sudah diserahkan

Name tag sudah diterima pelanggan.

### Dibatalkan

Pesanan tidak dilanjutkan.

---

# 13. Suggested Technology

Teknologi yang disarankan:

## Frontend dan backend

* Next.js.
* TypeScript.
* Tailwind CSS.

## Database dan autentikasi

* Supabase PostgreSQL.
* Supabase Auth untuk admin.

## File storage

* Supabase Storage.

## Hosting

* Vercel.

## Tambahan

* React Hook Form untuk formulir.
* Zod untuk validasi.
* TanStack Table untuk tabel admin jika diperlukan.
* Papa Parse atau library serupa untuk export CSV.

Pelanggan tidak menggunakan Supabase Auth. Hanya admin yang memiliki akun.

---

# 14. Suggested Database Entities

## Services

Menyimpan jenis jasa.

Data utama:

* ID.
* Nama jasa.
* Slug.
* Deskripsi.
* Harga.
* Kuota.
* Deadline.
* Gambar.
* Ketentuan.
* Status aktif.
* Konfigurasi field formulir.
* Created at.
* Updated at.

## Orders

Menyimpan pesanan pelanggan.

Data utama:

* ID.
* Kode pesanan.
* Service ID.
* Nama.
* Nomor WhatsApp.
* Faculty ID.
* Study program ID.
* Kelompok.
* Tempat lahir.
* Tanggal lahir.
* Alamat.
* Motto hidup.
* Catatan.
* Harga saat pemesanan.
* Status pembayaran.
* Status pengerjaan.
* Catatan admin.
* Created at.
* Updated at.
* Completed at.
* Deleted at.

## Order Files

Menyimpan file pesanan.

Data utama:

* ID.
* Order ID.
* Tipe file.
* Lokasi file.
* Nama file.
* Ukuran file.
* Created at.

Jenis file:

* Foto pelanggan.
* Bukti pembayaran.
* File desain.
* File final.

## Faculties

Menyimpan fakultas.

Data utama:

* ID.
* Nama fakultas.
* Status aktif.

## Study Programs

Menyimpan program studi.

Data utama:

* ID.
* Faculty ID.
* Nama program studi.
* Status aktif.

## Order Status History

Menyimpan riwayat perubahan status.

Data utama:

* ID.
* Order ID.
* Status lama.
* Status baru.
* Catatan.
* Waktu perubahan.
* Admin yang melakukan perubahan.

## Settings

Menyimpan pengaturan website.

Data utama:

* Nomor WhatsApp.
* Nama bisnis.
* Gambar QRIS.
* Nama penerima pembayaran.
* Instruksi pembayaran.
* Pesan WhatsApp default.
* Kebijakan privasi.
* Syarat dan ketentuan.

---

# 15. MVP Development Priority

## Prioritas 1 — Wajib berfungsi

* Database.
* CRUD jasa.
* Form pemesanan.
* Upload foto.
* Upload bukti pembayaran.
* Penyimpanan pesanan.
* Kode pesanan.
* Login admin.
* Tabel pesanan.
* Detail pesanan.
* Verifikasi pembayaran.
* Perubahan status.
* Filter fakultas dan program studi.

## Prioritas 2 — Sangat penting

* Halaman cek status.
* Tombol WhatsApp otomatis.
* Export CSV.
* Pengelolaan QRIS.
* Pengelolaan fakultas dan program studi.
* Perhitungan kuota.
* Dashboard ringkasan.

## Prioritas 3 — Penyempurnaan

* Riwayat perubahan status.
* Tambah pesanan manual.
* Duplikasi jasa.
* Penghapusan file lama.
* Optimasi gambar.
* Proteksi spam.
* Tampilan statistik pendapatan.

---

# 16. Definition of Done

MVP dapat dinyatakan selesai apabila:

* Admin dapat login.
* Admin dapat membuat jasa.
* Jasa aktif muncul di landing page.
* Pelanggan dapat membuka detail jasa.
* Pelanggan dapat mengisi formulir.
* Pelanggan dapat mengunggah foto.
* Pelanggan dapat melihat QRIS.
* Pelanggan dapat mengunggah bukti pembayaran.
* Pesanan tersimpan di database.
* Sistem menghasilkan kode pesanan.
* Pesanan muncul di dashboard admin.
* Admin dapat membuka detail pesanan.
* Admin dapat melihat foto dan bukti pembayaran.
* Admin dapat memverifikasi pembayaran.
* Admin dapat mengubah status pengerjaan.
* Pelanggan dapat mengecek status pesanan.
* Admin dapat memfilter pesanan berdasarkan fakultas dan program studi.
* Admin dapat mengekspor data pesanan.
* Website dapat digunakan dengan baik melalui smartphone.
* Pengguna tidak dapat membuka halaman admin tanpa login.
* Pesanan satu pelanggan tidak dapat dilihat pelanggan lain.
