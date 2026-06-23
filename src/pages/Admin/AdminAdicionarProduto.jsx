import AdminLayout from "./AdminLayout";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarProdutoAdmin,
  editarProdutoAdmin,
  listarCategoriasAdmin,
} from "../../services/adminService";
import { buscarProdutoPorId } from "../../services/productService";

function AdminAdicionarProduto() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [tipoMadeira, setTipoMadeira] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [acabamento, setAcabamento] = useState("");
  const [estoque, setEstoque] = useState(0);

  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagemPreview, setImagemPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  const categoriaSelecionada = categorias.find(
    (categoria) => String(categoria.id) === String(categoriaId)
  );

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoadingInicial(true);

        const categoriasApi = await listarCategoriasAdmin({
          useCacheOnError: true,
        });

        setCategorias(categoriasApi);

        if (!isEditing) {
          setCategoriaId(categoriasApi[0]?.id || "");
          return;
        }

        const produto = await buscarProdutoPorId(id);

        if (!produto) {
          alert("Produto não encontrado.");
          navigate("/admin/produtos");
          return;
        }

        const categoriaDoProduto =
          produto.idCategoria ||
          categoriasApi.find(
            (categoria) =>
              categoria.nome.toLowerCase() ===
              String(produto.categoria || "").toLowerCase()
          )?.id ||
          categoriasApi[0]?.id ||
          "";

        setNome(produto.nomeCompleto || produto.nome || "");
        setPreco(String(produto.preco ?? ""));
        setTipoMadeira(produto.tipoMadeira || "");
        setCategoriaId(categoriaDoProduto);
        setDescricao(produto.descricao || "");
        setAcabamento(produto.acabamento || "");
        setEstoque(produto.estoque ?? 0);
        setImagemPreview(produto.imagem || "");
      } catch (error) {
        alert(error.message || "Erro ao carregar dados do produto.");
        navigate("/admin/produtos");
      } finally {
        setLoadingInicial(false);
      }
    }

    carregarDados();
  }, [id, isEditing, navigate]);

  useEffect(() => {
    async function revalidarCategorias(event) {
      const categoriasApi = await listarCategoriasAdmin({
        cacheKey: event?.detail?.cacheKey,
        useCacheOnError: true,
      });

      setCategorias(categoriasApi);

      if (!categoriaId) {
        setCategoriaId(categoriasApi[0]?.id || "");
      }
    }

    window.addEventListener("categorias:revalidate", revalidarCategorias);

    return () => {
      window.removeEventListener("categorias:revalidate", revalidarCategorias);
    };
  }, [categoriaId]);

  function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    setImagemArquivo(file);
    setImagemPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!categoriaId) {
      alert("Cadastre uma categoria antes de salvar o produto.");
      return;
    }

    const productData = {
      nome,
      preco,
      tipoMadeira,
      acabamento,
      descricao,
      estoque,
      idCategoria: Number(categoriaId),
      categoriaNome: categoriaSelecionada?.nome || "",
      imagemArquivo,
      imagemPreview,
    };

    try {
      setLoading(true);

      if (isEditing) {
        await editarProdutoAdmin(id, productData);

        alert("Produto atualizado com sucesso!");
      } else {
        await cadastrarProdutoAdmin(productData);

        alert("Produto cadastrado com sucesso!");
      }

      navigate("/admin/produtos");
    } catch (error) {
      alert(
        error.message ||
          (isEditing ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.")
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingInicial) {
    return (
      <AdminLayout>
        <div className="admin-form-page">
          <p>Carregando dados...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-form-page">
        <button
          className="admin-back-btn"
          onClick={() => navigate("/admin/produtos")}
        >
          ← Voltar
        </button>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-form-left">
            <div className="admin-input-group">
              <label>
                <span>*</span> Nome do produto:
              </label>

              <input
                value={nome}
                placeholder="Sofá cama"
                required
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>
                <span>*</span> Valor do produto:
              </label>

              <input
                value={preco}
                placeholder="340,00"
                required
                type="number"
                min="1"
                step="0.01"
                onChange={(e) => setPreco(e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>Tipo de madeira:</label>

              <input
                value={tipoMadeira}
                placeholder="Eucalipto"
                required
                onChange={(e) => setTipoMadeira(e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>Estoque:</label>

              <input
                value={estoque}
                type="number"
                min="0"
                required
                onChange={(e) => setEstoque(e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>Categoria:</label>

              <select
                value={categoriaId}
                required
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>

                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-input-group">
              <label>
                <span>*</span> Descrição do produto:
              </label>

              <textarea
                value={descricao}
                maxLength={400}
                placeholder="Sofá que abaixa os braços para se tornar uma cama"
                required
                onChange={(e) => setDescricao(e.target.value)}
              />

              <small>{descricao.length}/400</small>
            </div>
          </div>

          <div className="admin-form-right">
            <div className="admin-input-group">
              <label>Acabamento:</label>

              <input
                value={acabamento}
                placeholder="Verniz"
                required
                onChange={(e) => setAcabamento(e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>Imagem do produto:</label>

              <label className="admin-image-box">
                {imagemPreview ? (
                  <img src={imagemPreview} alt="Preview" />
                ) : (
                  "+"
                )}

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <button type="button" className="admin-add-image-btn">
              Adicionar +
            </button>

            {imagemPreview && (
              <div className="admin-thumbs">
                <img src={imagemPreview} alt="Miniatura" />
                <img src={imagemPreview} alt="Miniatura" />
                <img src={imagemPreview} alt="Miniatura" />
              </div>
            )}
          </div>

          <button className="admin-submit-btn" disabled={loading}>
            {loading
              ? isEditing
                ? "Atualizando..."
                : "Cadastrando..."
              : isEditing
                ? "Atualizar"
                : "Cadastrar"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminAdicionarProduto;
