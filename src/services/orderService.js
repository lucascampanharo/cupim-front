import { apiFetch } from "./api";

function getOrderId(data) {
  return (
    data?.pedido?.id ||
    data?.pedido?.idPedido ||
    data?.pedido?.id_pedido ||
    data?.idPedido ||
    data?.id_pedido ||
    data?.id ||
    null
  );
}

function getProductId(item) {
  return item.idProduto || item.id_produto || item.id;
}

export async function criarPedidoNaApi({ user, cart, valorTotal }) {
  const pedidoData = await apiFetch("/api/criar-pedido", {
    method: "POST",
    body: JSON.stringify({
      valorTotal: Number(valorTotal),
      status: "Em processo",
      idUsuario: user?.id ? Number(user.id) : undefined,
    }),
  });

  const idPedido = getOrderId(pedidoData);

  if (!idPedido) {
    return {
      data: pedidoData,
      idPedido: null,
      itensSincronizados: false,
    };
  }

  await Promise.all(
    cart.map((item) =>
      apiFetch("/api/item-pedido", {
        method: "POST",
        body: JSON.stringify({
          idPedido: Number(idPedido),
          idProduto: Number(getProductId(item)),
          quantidade: Number(item.quantidade || 1),
        }),
      })
    )
  );

  return {
    data: pedidoData,
    idPedido,
    itensSincronizados: true,
  };
}
