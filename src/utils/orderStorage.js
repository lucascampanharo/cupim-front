import { criarPedidoNaApi } from "../services/orderService";

function getUserOrderKey(user) {
  if (user?.id) {
    return `pedidos_user_${user.id}`;
  }

  if (user?.email) {
    return `pedidos_user_${user.email}`;
  }

  return "pedidos_user_guest";
}

export function getPedidosDoUsuario(user) {
  const key = getUserOrderKey(user);

  return JSON.parse(localStorage.getItem(key)) || [];
}

export async function salvarPedidoDoUsuario(user, pedido, cart = []) {
  let apiSync = false;
  let apiError = "";
  let idPedidoApi = null;

  try {
    const apiPedido = await criarPedidoNaApi({
      user,
      cart,
      valorTotal: pedido.valorTotal,
    });

    apiSync = true;
    idPedidoApi = apiPedido.idPedido;
  } catch (error) {
    apiError = error.message || "Nao foi possivel sincronizar o pedido.";
    console.warn("Pedido salvo localmente. API indisponivel:", apiError);
  }

  const key = getUserOrderKey(user);

  const pedidosAtuais = JSON.parse(localStorage.getItem(key)) || [];

  const pedidoFinal = {
    ...pedido,
    idPedidoApi,
    apiSync,
    apiError,
  };

  const novosPedidos = [...pedidosAtuais, pedidoFinal];

  localStorage.setItem(key, JSON.stringify(novosPedidos));

  salvarPedidoParaAdmin(user, pedidoFinal);

  return pedidoFinal;
}

function salvarPedidoParaAdmin(user, pedido) {
  const pedidosAdmin = JSON.parse(localStorage.getItem("adminAllPedidos")) || [];

  const pedidoAdmin = {
    ...pedido,
    nomeCliente: user?.nome || "Cliente",
    emailCliente: user?.email || "",
    endereco:
      user?.enderecoCompleto ||
      `${user?.endereco || ""}, ${user?.numero || ""} - ${user?.bairro || ""}`,
  };

  localStorage.setItem(
    "adminAllPedidos",
    JSON.stringify([...pedidosAdmin, pedidoAdmin])
  );
}
