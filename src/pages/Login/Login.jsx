import "./login.css";

import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await login(email, senha);

      alert("Login realizado com sucesso!");

      navigate(location.state?.from || "/");
    } catch (error) {
      alert(error.message || "Email ou senha incorretos!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-image-area"></section>

      <section className="login-form-area">
        <h1>Cupim</h1>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            required
            onChange={(e) => setSenha(e.target.value)}
          />

          <label className="show-password">
            Mostrar senha
            <input
              type="checkbox"
              checked={mostrarSenha}
              onChange={() => setMostrarSenha(!mostrarSenha)}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link
          to="/cadastro"
          state={{ from: location.state?.from || "/carrinho" }}
          className="login-register-link"
        >
          Cadastre-se
        </Link>
      </section>
    </main>
  );
}

export default Login;