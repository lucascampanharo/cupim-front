import "./admin.css";

import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";

function AdminLayout({ children }) {
  const navigate = useNavigate();

  const { logout } = useContext(AuthContext);

  function handleLogout() {
    logout();

    navigate("/login");
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h1 onClick={() => navigate("/admin/produtos")}>Cupim</h1>

        <button onClick={handleLogout}>Sair</button>
      </header>

      <nav className="admin-tabs">
        <NavLink to="/admin/produtos">Produtos</NavLink>
        <NavLink to="/admin/categorias">Categorias</NavLink>
        <NavLink to="/admin/estoque">Estoque</NavLink>
        <NavLink to="/admin/pedidos">Pedidos</NavLink>
        <NavLink to="/admin/usuarios">Usuários</NavLink>
      </nav>

      <section className="admin-content">
        {children}
      </section>

      <footer className="admin-footer">
        Copyright 2026 - Grupo 3
      </footer>
    </main>
  );
}

export default AdminLayout;