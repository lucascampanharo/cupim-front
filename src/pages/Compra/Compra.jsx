import "./compra.css";
import { salvarPedidoDoUsuario } from "../../utils/orderStorage";

import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/auth-context";
import { CartContext } from "../../context/cart-context";

function Compra() {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext);

  const [formaPagamento, setFormaPagamento] = useState("Cartão de Crédito");
  const [loading, setLoading] = useState(false);

  const valorPedido = cart.reduce((acc, item) => {
    return acc + item.preco * item.quantidade;
  }, 0);

  const frete = 27.9;
  const valorTotal = valorPedido + frete;
  const parcela = valorTotal / 12;

  async function finalizarCompra() {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      navigate("/");
      return;
    }

    try {
      setLoading(true);

      const novoPedido = {
        id: Date.now(),
        produtos: cart.map((item) => ({
          idProduto: item.idProduto || item.id_produto || item.id,
          nome: item.nomeCompleto || item.nome,
          quantidade: item.quantidade,
        })),
        formaPagamento,
        valorTotal,
        data: new Date().toLocaleDateString("pt-BR"),
      };

      const pedidoSalvo = await salvarPedidoDoUsuario(user, novoPedido, cart);

      clearCart();

      alert(
        pedidoSalvo.apiSync
          ? "Compra finalizada com sucesso!"
          : "Compra finalizada localmente. A API não confirmou o pedido agora."
      );

      navigate("/perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="compra-page">
      <section className="compra-left">
        <button className="voltar-compra" onClick={() => navigate("/carrinho")}>
          ←
        </button>

        <h2>Confirme seu endereço</h2>

        <form className="endereco-form">
          <div className="form-group full">
            <label>
              <span>*</span>Endereço:
            </label>

            <input
              defaultValue={user?.endereco || "Rua 31 de novembro"}
              placeholder="Endereço"
            />
          </div>

          <div className="form-group">
            <label>
              <span>*</span>Número:
            </label>

            <input defaultValue={user?.numero || "1695"} placeholder="Número" />
          </div>

          <div className="form-group">
            <label>
              <span>*</span>CEP:
            </label>

            <input defaultValue={user?.cep || "98695-788"} placeholder="CEP" />
          </div>

          <div className="form-group">
            <label>
              <span>*</span>Bairro:
            </label>

            <input
              defaultValue={user?.bairro || "Júlio César"}
              placeholder="Bairro"
            />
          </div>

          <div className="form-group">
            <label>Complemento:</label>

            <input
              defaultValue={user?.complemento || "Apto 12"}
              placeholder="Complemento"
            />
          </div>
        </form>

        <h3>
          <span>*</span>Formas de pagamento
        </h3>

        <div className="pagamento-area">
          <div className="pagamento-opcoes">
            {[
              "Cartão de Crédito",
              "Depósito",
              "Pix",
              "Cartão de Débito",
              "Boleto",
            ].map((opcao) => (
              <label key={opcao}>
                <input
                  type="radio"
                  checked={formaPagamento === opcao}
                  onChange={() => setFormaPagamento(opcao)}
                />
                {opcao}
              </label>
            ))}
          </div>

          <div className="parcelas-box">
            <label>Nº Parcelas:</label>

            <input
              value={`12x de R$ ${parcela.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}`}
              readOnly
            />
          </div>
        </div>
      </section>

      <section className="compra-right">
        <h1>Cupim</h1>

        <div className="resumo-valores">
          <p>
            Valor do pedido:
            <strong>
              R${" "}
              {valorPedido.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>

          <p>
            Valor do frete:
            <strong>
              R${" "}
              {frete.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>

          <p>
            Valor total:
            <strong>
              R${" "}
              {valorTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>
        </div>

        <div className="entrega-box">
          <p>
            Previsão de chegada:
            <strong>20/06/2026</strong>
          </p>

          <p>
            Número de parcelas:
            <strong>12 vezes</strong>
          </p>

          <p>
            Valor da parcela:
            <strong>
              R${" "}
              {parcela.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>
        </div>

        <button
          className="finalizar-btn"
          onClick={finalizarCompra}
          disabled={loading}
        >
          {loading ? "Finalizando..." : "Finalizar compra"}
        </button>
      </section>
    </main>
  );
}

export default Compra;
