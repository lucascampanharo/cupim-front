import AdminLayout from "./AdminLayout";

import { useEffect, useState } from "react";

import { listarPedidosAdmin } from "../../services/adminService";

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    setPedidos(listarPedidosAdmin());
  }, []);

  function finalizarPedido(id) {
    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === id
          ? {
              ...pedido,
              finalizado: true,
            }
          : pedido
      )
    );

    alert("Pedido finalizado!");
  }

  return (
    <AdminLayout>
      <div className="admin-orders-grid">
        {pedidos.map((pedido) => (
          <div
            className={`admin-order-card ${pedido.destaque ? "destaque" : ""}`}
            key={pedido.id}
          >
            <p>
              <strong>Nome do cliente:</strong> {pedido.nomeCliente}
            </p>

            <p>
              <strong>Produtos comprados:</strong>
            </p>

            <ul>
              {pedido.produtos.map((produto, index) => (
                <li key={index}>
                  {produto.quantidade} {produto.nome}
                </li>
              ))}
            </ul>

            <p>
              <strong>Endereço:</strong>
              <br />
              {pedido.endereco}
            </p>

            <p>
              <strong>Valor total:</strong>
              <br />
              R${" "}
              {Number(pedido.valor || pedido.valorTotal || 0).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                }
              )}{" "}
              - {pedido.formaPagamento}
            </p>

            <p>
              <strong>Prazo de entrega:</strong> {pedido.prazoEntrega}
            </p>

            <button
              onClick={() => finalizarPedido(pedido.id)}
              disabled={pedido.finalizado}
            >
              {pedido.finalizado ? "Finalizado" : "Finalizar"}
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export default AdminPedidos;