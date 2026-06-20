import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import Detalhes from "./pages/Detalhes/Detalhes";
import Carrinho from "./pages/Carrinho/Carrinho";
import Compra from "./pages/Compra/Compra";
import Perfil from "./pages/Perfil/Perfil";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import AdminProdutos from "./pages/Admin/AdminProdutos";
import AdminAdicionarProduto from "./pages/Admin/AdminAdicionarProduto";
import AdminCategorias from "./pages/Admin/AdminCategorias";
import AdminEstoque from "./pages/Admin/AdminEstoque";
import AdminPedidos from "./pages/Admin/AdminPedidos";
import AdminUsuarios from "./pages/Admin/AdminUsuarios";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={1800} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/detalhes/:id" element={<Detalhes />} />

        <Route
          path="/carrinho"
          element={
            <ProtectedRoute>
              <Carrinho />
            </ProtectedRoute>
          }
        />

        <Route
          path="/compra"
          element={
            <ProtectedRoute>
              <Compra />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminProdutos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/produtos"
          element={
            <ProtectedRoute>
              <AdminProdutos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/produtos/novo"
          element={
            <ProtectedRoute>
              <AdminAdicionarProduto />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categorias"
          element={
            <ProtectedRoute>
              <AdminCategorias />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/estoque"
          element={
            <ProtectedRoute>
              <AdminEstoque />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute>
              <AdminPedidos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute>
              <AdminUsuarios />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;