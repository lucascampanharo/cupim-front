import AdminLayout from "./AdminLayout";

import { useEffect, useState } from "react";

import {
  listarProdutosAdmin,
  salvarEstoqueLocal,
} from "../../services/adminService";

function AdminEstoque() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    async function carregarProdutos() {
      const data = await listarProdutosAdmin();

      const stockOverrides =
        JSON.parse(localStorage.getItem("adminStockOverrides")) || {};

      const produtosComEstoque = data.map((produto) => ({
        ...produto,
        estoque: stockOverrides[produto.id] ?? produto.estoque ?? 0,
      }));

      setProdutos(produtosComEstoque);
    }

    carregarProdutos();
  }, []);

  function alterarEstoque(id, tipo) {
    setProdutos((prev) =>
      prev.map((produto) => {
        if (Number(produto.id) !== Number(id)) return produto;

        const novoEstoque =
          tipo === "mais"
            ? produto.estoque + 1
            : Math.max(0, produto.estoque - 1);

        salvarEstoqueLocal(produto.id, novoEstoque);

        return {
          ...produto,
          estoque: novoEstoque,
        };
      })
    );
  }

  return (
    <AdminLayout>
      <div className="admin-stock-grid">
        {produtos.map((produto) => (
          <div className="admin-stock-card" key={produto.id}>
            <img src={produto.imagem} alt={produto.nome} />

            <h3>{produto.nomeCompleto || produto.nome}</h3>

            <div className="stock-control">
              <button onClick={() => alterarEstoque(produto.id, "menos")}>
                −
              </button>

              <span>{produto.estoque}</span>

              <button onClick={() => alterarEstoque(produto.id, "mais")}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export default AdminEstoque;