import Header from "../../components/Header/Header";
import "./perfil.css";

import { useContext, useMemo } from "react";
import { AuthContext } from "../../context/auth-context";

import { getPedidosDoUsuario } from "../../utils/orderStorage";

function Perfil() {
  const { user } = useContext(AuthContext);

  const pedidos = useMemo(() => {
    if (!user) return [];

    return getPedidosDoUsuario(user);
  }, [user]);

  return (
    <>
      <Header />

      <main className="perfil-container">
        <section className="perfil-content">
          <h1>Perfil</h1>

          <div className="perfil-dados">
            <div className="perfil-campo">
              <label>Nome completo</label>

              <input
                type="text"
                value={user?.nome || ""}
                readOnly
              />
            </div>

            <div className="perfil-campo">
              <label>Email</label>

              <input
                type="email"
                value={user?.email || ""}
                readOnly
              />
            </div>
          </div>

          <div className="perfil-botoes">
            <button>Alterar senha</button>

            <button>Alterar endereço</button>
          </div>

          <h2>Histórico de Pedidos</h2>

          <div className="historico-lista">
            {pedidos.length === 0 ? (
              <div className="pedido-card pedido-vazio">
                <p>Você ainda não possui pedidos.</p>
              </div>
            ) : (
              pedidos.map((pedido) => (
                <div className="pedido-card" key={pedido.id}>
                  <div className="pedido-produtos">
                    <h3>Produtos:</h3>

                    {pedido.produtos.map((produto, index) => (
                      <p key={index}>
                        {produto.quantidade} {produto.nome}
                      </p>
                    ))}
                  </div>

                  <div className="pedido-resumo">
                    <p>
                      Forma de Pagamento:
                      <strong> {pedido.formaPagamento}</strong>
                    </p>

                    <p>
                      Valor total:
                      <strong>
                        {" "}
                        R${" "}
                        {Number(pedido.valorTotal).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </strong>
                    </p>

                    {pedido.data && (
                      <p>
                        Data:
                        <strong> {pedido.data}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="perfil-footer">
        Copyright 2026 - Grupo 3
      </footer>
    </>
  );
}

export default Perfil;
