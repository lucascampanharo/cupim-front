import Header from "../../components/Header/Header";
import "./detalhes.css";

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { buscarProdutoPorId } from "../../services/productService";
import { CartContext } from "../../context/cart-context";

function Detalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quantidade, setQuantidade] = useState(1);
  const [imagemSelecionada, setImagemSelecionada] = useState("");

  useEffect(() => {
    async function carregarProduto() {
      try {
        const produtoDaApi = await buscarProdutoPorId(id);

        setProduct(produtoDaApi);
        setImagemSelecionada(produtoDaApi?.imagem || "");
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarProduto();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />

        <main className="detalhes-container">
          <h2>Carregando produto...</h2>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />

        <main className="detalhes-container">
          <h2>Produto não encontrado.</h2>

          <button className="voltar-btn" onClick={() => navigate("/")}>
            ← Voltar para Home
          </button>
        </main>
      </>
    );
  }

  const imagensProduto = product.imagens?.length
    ? product.imagens
    : [product.imagem];

  function aumentarQuantidade() {
    setQuantidade(quantidade + 1);
  }

  function diminuirQuantidade() {
    if (quantidade > 1) {
      setQuantidade(quantidade - 1);
    }
  }

  function adicionarProdutoAoCarrinho() {
    addToCart(product, quantidade);
  }

  return (
    <>
      <Header />

      <main className="detalhes-container">
        <button className="voltar-btn" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <section className="detalhes-grid">
          <div className="detalhes-left">
            <img
              className="produto-imagem-principal"
              src={imagemSelecionada}
              alt={product.nomeCompleto || product.nome}
            />

            <div className="miniaturas">
              {imagensProduto.map((imagem, index) => (
                <button
                  key={index}
                  className={`miniatura-btn ${
                    imagemSelecionada === imagem ? "miniatura-ativa" : ""
                  }`}
                  onClick={() => setImagemSelecionada(imagem)}
                >
                  <img
                    src={imagem}
                    alt={`${product.nomeCompleto || product.nome} ${index + 1}`}
                  />
                </button>
              ))}
            </div>

            <div className="detalhes-texto">
              <h2>Detalhes</h2>

              <p>{product.descricao}</p>
            </div>
          </div>

          <div className="detalhes-right">
            <div className="produto-titulo-area">
              <h1>{product.nome}</h1>

              <p className="produto-subtitulo">
                {product.subtitulo || product.categoria}
              </p>

              <div className="estrelas">
                ★ ★ ★ ★ ☆
              </div>
            </div>

            <div className="produto-compra-area">
              <p className="produto-preco">
                R${" "}
                {Number(product.preco).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>

              <div className="compra-controles">
                <div className="quantidade-box">
                  <button onClick={diminuirQuantidade}>
                    −
                  </button>

                  <span>{quantidade}</span>

                  <button onClick={aumentarQuantidade}>
                    +
                  </button>
                </div>

                <button
                  className="adicionar-carrinho-btn"
                  onClick={adicionarProdutoAoCarrinho}
                >
                  Adicionar ao carrinho 🛒
                </button>
              </div>
            </div>

            <div className="info-produto">
              <h3>Informações sobre o produto</h3>

              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descrição</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Tipo de Madeira</td>
                    <td>{product.tipoMadeira}</td>
                  </tr>

                  <tr>
                    <td>Acabamento</td>
                    <td>{product.acabamento}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="detalhes-footer">
        Copyright 2026 - Grupo 3
      </footer>
    </>
  );
}

export default Detalhes;
