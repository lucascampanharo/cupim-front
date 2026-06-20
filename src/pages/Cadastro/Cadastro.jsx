import "./cadastro.css";

import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

function Cadastro() {
  const navigate = useNavigate();
  const location = useLocation();

  const { register } = useContext(AuthContext);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    if (senha.length < 6) {
      alert("A senha precisa ter no mínimo 6 dígitos!");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      setLoading(true);

      const userData = {
        nome,
        email,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        cep,
        senha,
      };

      await register(userData);

      alert("Conta criada com sucesso!");

      navigate("/login", {
        state: {
          from: location.state?.from || "/carrinho",
        },
      });
    } catch (error) {
      alert(error.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="cadastro-page">
      <section className="cadastro-hero">
        <h1>Cupim</h1>
      </section>

      <section className="cadastro-content">
        <h2>
          Crie uma conta e aproveite todas as nossas ofertas!
        </h2>

        <form onSubmit={handleRegister} className="cadastro-form">
          <div className="form-group large">
            <label>
              <span>*</span> Nome Completo:
            </label>

            <input
              placeholder="Nome Completo"
              value={nome}
              required
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="form-group large">
            <label>
              <span>*</span> Email
            </label>

            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group large">
            <label>
              <span>*</span> Endereço
            </label>

            <input
              placeholder="Endereço"
              value={endereco}
              required
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          <div className="form-row-double">
            <div className="form-group small">
              <label>
                <span>*</span> Número
              </label>

              <input
                placeholder="Número"
                value={numero}
                required
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>

            <div className="form-group complement">
              <label>Complemento</label>

              <input
                placeholder="Complemento"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group medium">
            <label>
              <span>*</span> Bairro
            </label>

            <input
              placeholder="Bairro"
              value={bairro}
              required
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>

          <div className="form-group medium">
            <label>
              <span>*</span> Cidade
            </label>

            <input
              placeholder="Cidade"
              value={cidade}
              required
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div className="form-group medium">
            <label>
              <span>*</span> CEP
            </label>

            <input
              placeholder="CEP"
              value={cep}
              required
              onChange={(e) => setCep(e.target.value)}
            />
          </div>

          <div className="form-group medium">
            <label>
              <span>*</span> Senha
            </label>

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              required
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="form-group medium">
            <label>
              <span>*</span> Confirme a senha
            </label>

            <input
              type="password"
              placeholder="Confirme a senha"
              value={confirmarSenha}
              required
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>

          <div className="password-rules">
            <p>* Mínimo 6 dígitos</p>
            <p>* Pelo menos um caractere especial</p>
            <p>* Pelo menos uma letra maiúscula</p>
            <p>* Pelo menos uma letra minúscula</p>
          </div>

          <button type="submit" className="cadastro-btn" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar-se"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Cadastro;