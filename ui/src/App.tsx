import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerPage from "./pages/customers/CustomerPage";
import CustomerDetailPage from "./pages/customers/CustomerDetailPage";
import UserPage from "./pages/users/UserPage";
import UserDetailPage from "./pages/users/UserDetailPage";
import DairePage from "./pages/daireler/DairePage";
import UcretTypePage from "./pages/ucrettypes/UcretTypePage";
import KasaPage from "./pages/kasa/KasaPage";
import KasaHareketPage from "./pages/kasaHareket/KasaHareketPage";
import DuyuruPage from "./pages/duyurular/DuyuruPage";
import YapilacakPage from "./pages/yapilacaklar/YapilacakPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/customers" />} />

        <Route path="/customers" element={<CustomerPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />

        <Route path="/users" element={<UserPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />

        <Route path="/daireler" element={<DairePage />} />

        <Route path="/ucrettypes" element={<UcretTypePage />} />


        <Route path="/kasa" element={<KasaPage />} />

        <Route path="/kasa/:kasaid/hareket" element={<KasaHareketPage />} />

        <Route path="/duyurular" element={<DuyuruPage />} />

        <Route path="/yapilacaklar" element={<YapilacakPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
