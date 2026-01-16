from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_policy_pdf():
    policy_dir = "policies"
    if not os.path.exists(policy_dir):
        os.makedirs(policy_dir)
        
    path = os.path.join(policy_dir, "Company_Policy_2024.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter

    # Title
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2.0, height - 50, "PT INTI TEKNOLOGI - KEBIJAKAN KARYAWAN 2024")

    c.setFont("Helvetica", 12)
    text_lines = [
        "1. JAM KERJA",
        "Waktu kerja standar adalah Senin sampai Jumat, pukul 09:00 hingga 18:00.",
        "Karyawan diberikan waktu istirahat selama 1 jam antara pukul 12:00 hingga 13:00.",
        "",
        "2. CUTI TAHUNAN",
        "Karyawan berhak mendapatkan cuti tahunan sebanyak 12 hari kerja setelah masa kerja 1 tahun.",
        "Pengajuan cuti harus dilakukan melalui portal HR minimal 3 hari sebelumnya.",
        "",
        "3. PAKAIAN (DRESS CODE)",
        "Senin - Kamis: Smart Casual (Kemeja atau Polo, Celana Kain/Chino, Sepatu Tertutup).",
        "Jumat: Bebas dan Sopan (Kaos diperbolehkan, dilarang menggunakan sandal).",
        "",
        "4. TUNJANGAN & FASILITAS",
        "- Asuransi Kesehatan (BPJS & Swasta) ditanggung perusahaan.",
        "- Makan siang gratis disediakan setiap hari Jumat di pantry.",
        "- Tunjangan transportasi untuk karyawan yang lembur di atas pukul 20:00.",
        "",
        "5. KETENTUAN SAKIT",
        "Karyawan yang sakit wajib memberikan informasi kepada atasan langsung.",
        "Surat keterangan dokter wajib dilampirkan jika tidak masuk lebih dari 2 hari.",
        "",
        "6. KONTAK DARURAT",
        "Jika ada keadaan darurat di kantor, hubungi Bagian Umum di ekstensi 101 atau 0812-XXXX-XXXX."
    ]

    y_position = height - 100
    for line in text_lines:
        c.drawString(72, y_position, line)
        y_position -= 20
        if y_position < 50:
            c.showPage()
            y_position = height - 50

    c.save()
    print(f"Dummy policy created at: {path}")

if __name__ == "__main__":
    create_policy_pdf()
