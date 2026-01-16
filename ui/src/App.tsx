import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";

// mevcut sayfaların:
import CustomerPage from "./pages/customers/CustomerPage";
import RolePage from "./pages/roles/RolePage";
import UserPage from "./pages/users/UserPage";
import DairePage from "./pages/daireler/DairePage";
import UcretTypePage from "./pages/ucrettypes/UcretTypePage";
import KasaPage from "./pages/kasa/KasaPage";
import DuyuruPage from "./pages/duyurular/DuyuruPage";
import YapilacakPage from "./pages/yapilacaklar/YapilacakPage";
import KasaHareketSelectPage from "./pages/kasaHareket/KasaHareketSelectPage";
import KasaHareketPage from "./pages/kasaHareket/KasaHareketPage"; // sende path farklıysa düzelt


// opsiyonel: kasa hareket route’un varsa (kasaid ile)
// import KasaHareketPage from "./pages/kasaHareket/KasaHareketPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/roles" element={<RolePage />} />
          <Route path="/users" element={<UserPage />} />
          <Route path="/daireler" element={<DairePage />} />
          <Route path="/ucrettypes" element={<UcretTypePage />} />
          <Route path="/kasa" element={<KasaPage />} />
          <Route path="/duyurular" element={<DuyuruPage />} />
          <Route path="/yapilacaklar" element={<YapilacakPage />} />
          <Route path="/kasa-hareket" element={<KasaHareketSelectPage />} />
          <Route path="/kasa/:kasaid/hareket" element={<KasaHareketPage />} />

          {/* Kasa hareketi böyle kullanacaksak: */}
          {/* <Route path="/kasa/:kasaid/hareket" element={<KasaHareketPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
