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

export function salvarPedidoDoUsuario(user, pedido) {
  const key = getUserOrderKey(user);

  const pedidosAtuais = JSON.parse(localStorage.getItem(key)) || [];

  const novosPedidos = [...pedidosAtuais, pedido];

  localStorage.setItem(key, JSON.stringify(novosPedidos));

  salvarPedidoParaAdmin(user, pedido);
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