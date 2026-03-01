import { BarChart3 } from "lucide-react";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <div className="footer-brand">
                            <img src="/logo-icon.png" alt="SimbisData Logo" width={24} height={24} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "10px" }} />
                            SimbisData
                        </div>
                        <p className="footer-desc">
                            Platform analisis data penjualan UMKM dengan Machine Learning dan AI.
                            Bantu seller UMKM Indonesia mengambil keputusan bisnis berbasis data.
                        </p>
                    </div>

                    <div>
                        <h4 className="footer-title">Produk</h4>
                        <ul className="footer-links">
                            <li><a href="#features">Fitur</a></li>
                            <li><a href="#algorithms">Algoritma</a></li>
                            <li><a href="#pricing">Harga</a></li>
                            <li><a href="/dashboard">Dashboard</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Perusahaan</h4>
                        <ul className="footer-links">
                            <li><a href="#">Tentang Kami</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Karir</a></li>
                            <li><a href="#">Kontak</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-title">Legal</h4>
                        <ul className="footer-links">
                            <li><a href="#">Kebijakan Privasi</a></li>
                            <li><a href="#">Syarat & Ketentuan</a></li>
                            <li><a href="#">FAQ</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} SimbisData. build by hengki setiawan
                </div>
            </div>
        </footer>
    );
}
