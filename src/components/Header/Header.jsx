import "./Header.css";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../../context/auth-context";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);

  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  function handleLogout() {
    logout();

    alert("Você saiu da conta!");

    navigate("/");
  }

  return (
    <header className="header">
      <Link to="/">
        <h1>Cupim</h1>
      </Link>

      <div className="header-right">
        <input type="text" placeholder="Pesquisar" />

        <nav>
          {!isHomePage && (
            <Link to="/">
              Home
            </Link>
          )}

          <Link to="/carrinho">
            Carrinho
          </Link>

          {user && (
            <Link to="/perfil">
              Perfil
            </Link>
          )}

          {!user && (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/cadastro">
                Cadastrar
              </Link>
            </>
          )}

          {user && (
            <button className="logout-btn" onClick={handleLogout}>
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
