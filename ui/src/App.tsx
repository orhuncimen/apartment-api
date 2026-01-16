import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerPage from "./pages/customers/CustomerPage";
import CustomerDetailPage from "./pages/customers/CustomerDetailPage";
import UserPage from "./pages/users/UserPage";
import UserDetailPage from "./pages/users/UserDetailPage";
import DairePage from "./pages/daireler/DairePage";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
