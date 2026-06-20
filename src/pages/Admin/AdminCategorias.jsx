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

  useEffect(() => {
    setCategorias(listarCategoriasAdmin());
  }, []);

  async function adicionarCategoria() {
    if (!novaCategoria.trim()) return;

    const criada = await criarCategoriaAdmin(novaCategoria);

    setCategorias((prev) => [...prev, criada]);
    setNovaCategoria("");
  }

  async function editarCategoria(id, nomeAtual) {
    const novoNome = prompt("Novo nome da categoria:", nomeAtual);

    if (!novoNome) return;

    const atualizadas = await atualizarCategoriaAdmin(id, novoNome);

    setCategorias(atualizadas);
  }

  function deletarCategoria(id) {
    const confirmar = window.confirm("Deseja excluir esta categoria?");

    if (!confirmar) return;

    const atualizadas = deletarCategoriaLocal(id);

    setCategorias(atualizadas);
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

          <button onClick={adicionarCategoria}>+</button>
        </div>

        <div className="admin-category-list">
          {categorias.map((categoria) => (
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
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCategorias;