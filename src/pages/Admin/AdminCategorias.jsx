import AdminLayout from "./AdminLayout";

import { useEffect, useState } from "react";

import {
  atualizarCategoriaAdmin,
  criarCategoriaAdmin,
  deletarCategoriaLocal,
  listarCategoriasAdmin,
} from "../../services/adminService";

function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarCategorias(event) {
      try {
        setLoading(true);

        const data = await listarCategoriasAdmin({
          cacheKey: event?.detail?.cacheKey,
          useCacheOnError: true,
        });

        const categoriasValidas = data.filter(
          (categoria) => Number(categoria.id) > 0
        );

        setCategorias(categoriasValidas);
      } catch (error) {
        alert(error.message || "Erro ao carregar categorias.");
      } finally {
        setLoading(false);
      }
    }

    carregarCategorias();

    window.addEventListener("categorias:revalidate", carregarCategorias);

    return () => {
      window.removeEventListener("categorias:revalidate", carregarCategorias);
    };
  }, []);

  async function adicionarCategoria() {
    if (!novaCategoria.trim()) return;

    try {
      setSalvando(true);

      const nomeCategoria = novaCategoria.trim();

      const atualizadas = await criarCategoriaAdmin(nomeCategoria);

      const categoriasValidas = atualizadas.filter(
        (categoria) => Number(categoria.id) > 0
      );

      setCategorias(categoriasValidas);

      setNovaCategoria("");
    } catch (error) {
      alert(error.message || "Erro ao criar categoria.");
    } finally {
      setSalvando(false);
    }
  }

  async function editarCategoria(id, nomeAtual) {
    const novoNome = prompt("Novo nome da categoria:", nomeAtual);

    if (!novoNome) return;

    try {
      const atualizadas = await atualizarCategoriaAdmin(id, novoNome);

      const categoriasValidas = atualizadas.filter(
        (categoria) => Number(categoria.id) > 0
      );

      setCategorias(categoriasValidas);
    } catch (error) {
      alert(error.message || "Erro ao atualizar categoria.");
    }
  }

  async function deletarCategoria(id) {
    const confirmar = window.confirm("Deseja excluir esta categoria?");

    if (!confirmar) return;

    try {
      const atualizadas = await deletarCategoriaLocal(id);

      const categoriasValidas = atualizadas.filter(
        (categoria) => Number(categoria.id) > 0
      );

      setCategorias(categoriasValidas);
    } catch (error) {
      alert(error.message || "Erro ao excluir categoria.");
    }
  }

  return (
    <AdminLayout>
      <div className="admin-category-wrapper">
        <div className="admin-category-create">
          <input
            value={novaCategoria}
            placeholder="Criar categoria"
            onChange={(e) => setNovaCategoria(e.target.value)}
          />

          <button onClick={adicionarCategoria} disabled={salvando}>
            {salvando ? "..." : "+"}
          </button>
        </div>

        <div className="admin-category-list">
          {loading ? (
            <p>Carregando categorias...</p>
          ) : categorias.length === 0 ? (
            <p>Nenhuma categoria cadastrada.</p>
          ) : (
            categorias.map((categoria) => (
              <div className="admin-category-row" key={categoria.id}>
                <span>{categoria.nome}</span>

                <button
                  className="admin-small-btn"
                  onClick={() => editarCategoria(categoria.id, categoria.nome)}
                >
                  Editar →
                </button>

                <button
                  className="admin-delete-btn"
                  onClick={() => deletarCategoria(categoria.id)}
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCategorias;