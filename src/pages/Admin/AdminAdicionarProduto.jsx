import AdminLayout from "./AdminLayout";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  cadastrarProdutoAdmin,
  listarCategoriasAdmin,
} from "../../services/adminService";

function AdminAdicionarProduto() {
  const navigate = useNavigate();

  const categorias = useMemo(() => listarCategoriasAdmin(), []);

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [tipoMadeira, setTipoMadeira] = useState("");
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || 1);
  const [descricao, setDescricao] = useState("");
  const [acabamento, setAcabamento] = useState("");
  const [estoque, setEstoque] = useState(0);

  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagemPreview, setImagemPreview] = useState("");

  const [loading, setLoading] = useState(false);

  const categoriaSelecionada = categorias.find(
    (categoria) => Number(categoria.id) === Number(categoriaId)
  );

  function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    setImagemArquivo(file);
    setImagemPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await cadastrarProdutoAdmin({
        nome,
        preco,
        tipoMadeira,
        acabamento,
        descricao,
        estoque,
        idCategoria: categoriaId,
        categoriaNome: categoriaSelecionada?.nome || "Sala de estar",
        imagemArquivo,
        imagemPreview,
      });

      alert("Produto cadastrado com sucesso!");

      navigate("/admin/produtos");
    } catch (error) {
      alert(error.message || "Erro ao cadastrar produto.");
    } finally {
      setLoading(false);
    }
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
                onChange={(e) => setEstoque(e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>Categoria:</label>

              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
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
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminAdicionarProduto;