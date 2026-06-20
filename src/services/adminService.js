import { apiFetch } from "./api";
import { listarProdutos } from "./productService";
import { normalizeProduct } from "../utils/productMapper";

const categoriasPadrao = [
  { id: 1, nome: "Sala de estar" },
  { id: 2, nome: "Quarto" },
  { id: 3, nome: "Cozinha" },
  { id: 4, nome: "Sala de jantar" },
  { id: 5, nome: "Escritório" },
  { id: 6, nome: "Área externa" },
  { id: 7, nome: "Infantil" },
  { id: 8, nome: "Decoração" },
];

function getCategoriasLocais() {
  const categorias = JSON.parse(localStorage.getItem("adminCategorias"));

  if (categorias?.length) {
    return categorias;
  }

  localStorage.setItem("adminCategorias", JSON.stringify(categoriasPadrao));

  return categoriasPadrao;
}

function salvarCategoriasLocais(categorias) {
  localStorage.setItem("adminCategorias", JSON.stringify(categorias));
}

function getAdminCreatedProducts() {
  return JSON.parse(localStorage.getItem("adminCreatedProducts")) || [];
}

function saveAdminCreatedProducts(products) {
  localStorage.setItem("adminCreatedProducts", JSON.stringify(products));
}

function getHiddenProducts() {
  return JSON.parse(localStorage.getItem("adminHiddenProducts")) || [];
}

function saveHiddenProducts(products) {
  localStorage.setItem("adminHiddenProducts", JSON.stringify(products));
}

export async function listarProdutosAdmin() {
  const produtosOcultos = getHiddenProducts();

  const produtos = await listarProdutos();

  const produtosFiltrados = produtos.filter(
    (produto) =>
      !produtosOcultos.some(
        (hiddenId) => String(hiddenId) === String(produto.id)
      )
  );

  return produtosFiltrados.map(normalizeProduct);
}

export async function cadastrarProdutoAdmin(productData) {
  const body = {
    nome: productData.nome,
    descricao: productData.descricao,
    preco: Number(productData.preco),
    estoque: Number(productData.estoque || 0),
    tipoMadeira: productData.tipoMadeira,
    acabamento: productData.acabamento,
    idCategoria: Number(productData.idCategoria || 1),
  };

  try {
    const data = await apiFetch("/api/cadastro-produto", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const idProduto =
      data?.produto?.id ||
      data?.produto?.id_produto ||
      data?.produtoId ||
      data?.idProduto ||
      data?.id_produto ||
      data?.id;

    if (idProduto && productData.imagemArquivo) {
      const formData = new FormData();

      formData.append("imagem", productData.imagemArquivo);

      await apiFetch(`/api/produtos/${idProduto}/imagens`, {
        method: "POST",
        body: formData,
      });
    }

    return data;
  } catch (error) {
    console.warn("Produto salvo localmente:", error.message);

    const produtosLocais = getAdminCreatedProducts();

    const novoProduto = normalizeProduct({
      id: Date.now(),
      nome: productData.nome,
      nomeCompleto: productData.nome,
      subtitulo: productData.categoriaNome || "",
      preco: Number(productData.preco),
      estoque: Number(productData.estoque || 0),
      descricao: productData.descricao,
      tipoMadeira: productData.tipoMadeira,
      acabamento: productData.acabamento,
      categoria: productData.categoriaNome || "Sala de estar",
      imagem:
        productData.imagemPreview ||
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
      imagens: [
        productData.imagemPreview ||
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
      ],
    });

    saveAdminCreatedProducts([...produtosLocais, novoProduto]);

    return novoProduto;
  }
}

export function removerProdutoAdmin(id) {
  const productId = String(id);

  const produtosCriados = getAdminCreatedProducts();

  const produtosCriadosAtualizados = produtosCriados.filter(
    (produto) => String(produto.id) !== productId
  );

  saveAdminCreatedProducts(produtosCriadosAtualizados);

  const produtosOcultos = getHiddenProducts();

  const jaEstaOculto = produtosOcultos.some(
    (hiddenId) => String(hiddenId) === productId
  );

  if (!jaEstaOculto) {
    saveHiddenProducts([...produtosOcultos, productId]);
  }
}

export function listarCategoriasAdmin() {
  return getCategoriasLocais();
}

export async function criarCategoriaAdmin(nome) {
  try {
    await apiFetch("/api/criar-categoria", {
      method: "POST",
      body: JSON.stringify({ nome }),
    });
  } catch (error) {
    console.warn("Categoria salva apenas localmente:", error.message);
  }

  const categorias = getCategoriasLocais();

  const novaCategoria = {
    id: Date.now(),
    nome,
  };

  const novasCategorias = [...categorias, novaCategoria];

  salvarCategoriasLocais(novasCategorias);

  return novaCategoria;
}

export async function atualizarCategoriaAdmin(id, nome) {
  try {
    await apiFetch(`/api/atualizar-categoria/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nome }),
    });
  } catch (error) {
    console.warn("Categoria atualizada apenas localmente:", error.message);
  }

  const categorias = getCategoriasLocais();

  const atualizadas = categorias.map((categoria) =>
    Number(categoria.id) === Number(id)
      ? { ...categoria, nome }
      : categoria
  );

  salvarCategoriasLocais(atualizadas);

  return atualizadas;
}

export function deletarCategoriaLocal(id) {
  const categorias = getCategoriasLocais();

  const novasCategorias = categorias.filter(
    (categoria) => Number(categoria.id) !== Number(id)
  );

  salvarCategoriasLocais(novasCategorias);

  return novasCategorias;
}

export function salvarEstoqueLocal(idProduto, estoque) {
  const stockOverrides =
    JSON.parse(localStorage.getItem("adminStockOverrides")) || {};

  stockOverrides[idProduto] = Number(estoque);

  localStorage.setItem("adminStockOverrides", JSON.stringify(stockOverrides));
}

export async function listarUsuariosAdmin() {
  try {
    const data = await apiFetch("/api/listar-usuarios");

    const usuarios =
      data.usuarios ||
      data.users ||
      data.data ||
      [];

    return usuarios.map((usuario) => ({
      id:
        usuario.id ||
        usuario.id_usuario ||
        usuario.id_user ||
        usuario.email,

      nome:
        usuario.nome ||
        usuario.name ||
        "Usuário",

      email:
        usuario.email ||
        "sem-email@email.com",

      endereco:
        usuario.endereco ||
        usuario.enderecoCompleto ||
        usuario.endereco_completo ||
        "Endereço não informado",
    }));
  } catch {
    const usersObj = JSON.parse(localStorage.getItem("registeredUsers")) || {};

    const usuariosLocais = Object.values(usersObj).map((user, index) => ({
      id: index + 1,
      nome: user.nome,
      email: user.email,
      endereco: user.enderecoCompleto || user.endereco || "",
    }));

    if (usuariosLocais.length) {
      return usuariosLocais;
    }

    return [
      {
        id: 1,
        nome: "José Arnaldo",
        email: "jose.arnaldo@gmail.com",
        endereco: "Rua 31 de Novembro, 1695, Júlio César, Rio de Janeiro, RJ",
      },
      {
        id: 2,
        nome: "João Silva",
        email: "joaosilva97@gmail.com",
        endereco: "Rua Andorinhas, 98, Águas Claras, Três Passos, RS",
      },
      {
        id: 3,
        nome: "Maria das Dores",
        email: "maria.dores@gmail.com",
        endereco: "Rua Esperança, 275, Av. das Graças, São Paulo, SP",
      },
    ];
  }
}

export function listarPedidosAdmin() {
  const pedidosAdmin = JSON.parse(localStorage.getItem("adminAllPedidos")) || [];

  if (pedidosAdmin.length) {
    return pedidosAdmin.map((pedido) => ({
      ...pedido,
      nomeCliente: pedido.nomeCliente || "Cliente",
      endereco: pedido.endereco || "Endereço não informado",
      prazoEntrega: pedido.prazoEntrega || "21/06/2026",
      valor: pedido.valor || pedido.valorTotal,
    }));
  }

  return [
    {
      id: 1,
      nomeCliente: "José Arnaldo",
      produtos: [
        { nome: "Mesa de jantar com bancos", quantidade: 1 },
        { nome: "Sapateira com banco", quantidade: 1 },
      ],
      endereco: "Rua 31 de Novembro, 1695, Júlio César, Rio de Janeiro, RJ",
      formaPagamento: "Cartão de Crédito",
      valor: 1827.9,
      prazoEntrega: "15/08/2026",
    },
    {
      id: 2,
      nomeCliente: "João Silva",
      produtos: [
        { nome: "Sapateira com banco", quantidade: 1 },
        { nome: "Prateleira móvel", quantidade: 1 },
      ],
      endereco: "Rua Andorinhas, 98, Águas Claras, Três Passos, RS",
      formaPagamento: "Pix",
      valor: 407.9,
      prazoEntrega: "10/07/2026",
    },
    {
      id: 3,
      nomeCliente: "Maria das Dores",
      produtos: [{ nome: "Mesa de jantar com bancos", quantidade: 1 }],
      endereco: "Rua Esperança, 275, Av. das Graças, São Paulo, SP",
      formaPagamento: "Cartão de Crédito",
      valor: 1527.9,
      prazoEntrega: "26/05/2026",
      destaque: true,
    },
  ];
}