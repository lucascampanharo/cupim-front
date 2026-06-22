import AdminLayout from "./AdminLayout";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  listarProdutosAdmin,
  removerProdutoAdmin,
} from "../../services/adminService";

function AdminProdutos() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const data = await listarProdutosAdmin();

        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos do ADM:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();
  }, []);

  function removerProduto(id) {
    const confirmar = window.confirm("Deseja remover este produto da listagem?");

    if (!confirmar) return;

    removerProdutoAdmin(id);

    setProdutos((prev) =>
      prev.filter((produto) => String(produto.id) !== String(id))
    );
  }

  return (
    <AdminLayout>
      <div className="admin-top-actions">
        <button
          className="admin-primary-btn"
          onClick={() => navigate("/admin/produtos/novo")}
        >
          Cadastrar Novo Produto
        </button>
      </div>

      {loading ? (
        <p>Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <div className="admin-products-grid">
          {produtos.map((produto) => (
            <div className="admin-card" key={produto.id}>
              {produto.imagem ? (
                <img
                  src={produto.imagem}
                  alt={produto.nomeCompleto || produto.nome}
                />
              ) : (
                <div className="admin-card-image-placeholder">Sem imagem</div>
              )}

              <div className="admin-card-body">
                <h3>{produto.nomeCompleto || produto.nome}</h3>

                <p>
                  R${" "}
                  {Number(produto.preco).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>

                <div className="admin-card-actions">
                  <button
                    className="admin-small-btn"
                    onClick={() =>
                      navigate(`/admin/produtos/${produto.id}/editar`)
                    }
                  >
                    Editar →
                  </button>

                  <button
                    className="admin-delete-btn"
                    onClick={() => removerProduto(produto.id)}
                    title="Remover produto"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProdutos;
