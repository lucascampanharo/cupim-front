import Header from "../../components/Header/Header";
import "./carrinho.css";

import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { CartContext } from "../../context/CartContext";

function Carrinho() {
  const navigate = useNavigate();

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useContext(CartContext);

  function irParaCompra() {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    navigate("/compra");
  }

  return (
    <>
      <Header />

      <main className="carrinho-container">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <h2>Seu carrinho está vazio.</h2>

            <button onClick={() => navigate("/")}>
              Voltar para Home
            </button>
          </div>
        ) : (
          <>
            {cart.map((item) => (
              <div className="cart-card" key={item.id}>
                <img
                  src={item.imagem}
                  alt={item.nomeCompleto || item.nome}
                />

                <div className="cart-info">
                  <h2>{item.nomeCompleto || item.nome}</h2>

                  <span>
                    R${" "}
                    {item.preco.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="cart-actions">
                  <div className="quantity">
                    <button onClick={() => decreaseQuantity(item.id)}>
                      −
                    </button>

                    <span>{item.quantidade}</span>

                    <button onClick={() => increaseQuantity(item.id)}>
                      +
                    </button>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}

            <button className="comprar-btn" onClick={irParaCompra}>
              Comprar
            </button>
          </>
        )}
      </main>

      <footer className="carrinho-footer">
        Copyright 2026 - Grupo 3
      </footer>
    </>
  );
}

export default Carrinho;