import Header from "../../components/Header/Header";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./home.css";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listarProdutos } from "../../services/productService";

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [ordenacao, setOrdenacao] = useState("");

  useEffect(() => {
    async function carregarProdutos() {
      setLoading(true);

      try {
        const data = await listarProdutos();

        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();
  }, []);

  const produtosFiltrados = useMemo(() => {
    try {
      const lista = [...produtos];

      let listaFiltrada = lista;

      if (categoriaSelecionada) {
        listaFiltrada = listaFiltrada.filter((produto) =>
          produto.categoria
            ?.toLowerCase()
            .includes(categoriaSelecionada.toLowerCase())
        );
      }

      if (ordenacao === "menor-preco") {
        listaFiltrada.sort((a, b) => Number(a.preco) - Number(b.preco));
      }

      if (ordenacao === "maior-preco") {
        listaFiltrada.sort((a, b) => Number(b.preco) - Number(a.preco));
      }

      if (ordenacao === "nome") {
        listaFiltrada.sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
      }

      return listaFiltrada;
    } catch (error) {
      console.error("Erro ao filtrar produtos:", error);
      return [];
    }
  }, [produtos, categoriaSelecionada, ordenacao]);

  function limparFiltros() {
    setCategoriaSelecionada("");
    setOrdenacao("");
  }

  const produtoLancamento = produtosFiltrados[0] || produtos[0];

  return (
    <>
      <Header />

      <main className="home-container">
        <section className="lancamento-section">
          <h1>Lançamento</h1>

          {produtoLancamento ? (
            <div className="lancamento-card">
              <div className="lancamento-image">
                <img
                  src={produtoLancamento.imagem}
                  alt={produtoLancamento.nomeCompleto || produtoLancamento.nome}
                />
              </div>

              <div className="lancamento-info">
                <h2>{produtoLancamento.nomeCompleto || produtoLancamento.nome}</h2>

                <p className="lancamento-categoria">
                  {produtoLancamento.categoria || produtoLancamento.subtitulo}
                </p>

                <strong>
                  R${" "}
                  {Number(produtoLancamento.preco).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </strong>

                <Link to={`/detalhes/${produtoLancamento.id}`}>
                  <button>Ver mais →</button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="home-message">Nenhum lançamento disponível.</p>
          )}
        </section>

        <section className="produtos-section">
          <div className="produtos-header">
            <h1>Todos os produtos</h1>
          </div>

          <div className="filtros-area">
            <div className="filtros-esquerda">
              <select
                value={categoriaSelecionada}
                onChange={(event) => setCategoriaSelecionada(event.target.value)}
              >
                <option value="">Categoria</option>
                <option value="Sala de estar">Sala de estar</option>
                <option value="Quarto">Quarto</option>
                <option value="Cozinha">Cozinha</option>
                <option value="Sala de jantar">Sala de jantar</option>
                <option value="Escritório">Escritório</option>
                <option value="Área externa">Área externa</option>
                <option value="Decoração">Decoração</option>
              </select>

              {categoriaSelecionada && (
                <button className="filtro-chip" onClick={() => setCategoriaSelecionada("")}>
                  {categoriaSelecionada} ×
                </button>
              )}
            </div>

            <div className="filtros-direita">
              <select
                value={ordenacao}
                onChange={(event) => setOrdenacao(event.target.value)}
              >
                <option value="">Mais Relevantes</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="nome">Nome</option>
              </select>

              {(categoriaSelecionada || ordenacao) && (
                <button className="limpar-filtros" onClick={limparFiltros}>
                  Limpar
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="home-message">Carregando produtos...</p>
          ) : produtosFiltrados.length === 0 ? (
            <p className="home-message">Nenhum produto encontrado.</p>
          ) : (
            <div className="products-grid">
              {produtosFiltrados.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="home-footer">Copyright 2026 - Grupo 3</footer>
    </>
  );
}

export default Home;
