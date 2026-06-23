import Header from "../../components/Header/Header";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./home.css";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listarProdutos } from "../../services/productService";
import { listarCategoriasAdmin } from "../../services/adminService";

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [ordenacao, setOrdenacao] = useState("");

  useEffect(() => {
    async function carregarProdutos(event) {
      setLoading(true);

      try {
        const [produtosData, categoriasData] = await Promise.all([
          listarProdutos(),
          listarCategoriasAdmin({
            cacheKey: event?.detail?.cacheKey,
            useCacheOnError: true,
          }),
        ]);

        setProdutos(produtosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();

    window.addEventListener("categorias:revalidate", carregarProdutos);

    return () => {
      window.removeEventListener("categorias:revalidate", carregarProdutos);
    };
  }, []);

  const produtosFiltrados = useMemo(() => {
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
      listaFiltrada.sort((a, b) =>
        String(a.nome).localeCompare(String(b.nome))
      );
    }

    return listaFiltrada;
  }, [produtos, categoriaSelecionada, ordenacao]);

  function limparFiltros() {
    setCategoriaSelecionada("");
    setOrdenacao("");
  }

  const produtoLancamento = produtos[produtos.length - 1];

  return (
    <>
      <Header />

      <main className="home-container">
        <section className="lancamento-section">
          <h1>Lançamento</h1>

          {produtoLancamento ? (
            <div className="lancamento-card">
              <div className="lancamento-image">
                {produtoLancamento.imagem && !imageErrors[produtoLancamento.id] ? (
                  <img
                    src={produtoLancamento.imagem}
                    alt={produtoLancamento.nomeCompleto || produtoLancamento.nome}
                    onError={() =>
                      setImageErrors((prev) => ({
                        ...prev,
                        [produtoLancamento.id]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="product-image-placeholder">Sem imagem</div>
                )}
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
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.nome}>
                    {categoria.nome}
                  </option>
                ))}
              </select>

              {categoriaSelecionada && (
                <button
                  className="filtro-chip"
                  onClick={() => setCategoriaSelecionada("")}
                >
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
