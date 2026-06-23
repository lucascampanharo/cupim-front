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

function getHiddenProducts() {
  return JSON.parse(localStorage.getItem("adminHiddenProducts")) || [];
}

function saveHiddenProducts(products) {
  localStorage.setItem("adminHiddenProducts", JSON.stringify(products));
}

function getCategoriasCache() {
  return JSON.parse(localStorage.getItem("categoriasCache")) || [];
}

function saveCategoriasCache(categorias) {
  localStorage.setItem("categoriasCache", JSON.stringify(categorias));
}

function getCategoriaCacheKey() {
  return localStorage.getItem("categoriasCacheKey") || String(Date.now());
}

function withCacheBust(endpoint, cacheKey = getCategoriaCacheKey()) {
  const separator = endpoint.includes("?") ? "&" : "?";

  return `${endpoint}${separator}_=${cacheKey}`;
}

function revalidarCategoriasCache() {
  const cacheKey = String(Date.now());

  localStorage.setItem("categoriasCacheKey", cacheKey);

  window.dispatchEvent(
    new CustomEvent("categorias:revalidate", {
      detail: { cacheKey },
    })
  );

  return cacheKey;
}

function getRawCategoriaId(categoria) {
  return (
    categoria?.id_categoria ??
    categoria?.id ??
    categoria?.idCategoria ??
    categoria?.idcategoria ??
    categoria?.categoriaId ??
    categoria?.id_categoria_produto ??
    ""
  );
}

function normalizeCategory(categoria, index = 0) {
  if (typeof categoria === "string") {
    return {
      id: "",
      nome: categoria,
      temporaria: true,
    };
  }

  const rawId = getRawCategoriaId(categoria);
  const idNumerico = Number(rawId);

  const temIdValido = Number.isInteger(idNumerico) && idNumerico > 0;

  return {
    id: temIdValido ? idNumerico : "",
    nome:
      categoria?.nome ||
      categoria?.name ||
      categoria?.categoria ||
      categoria?.nome_categoria ||
      categoria?.nomeCategoria ||
      `Categoria ${index + 1}`,
    temporaria: !temIdValido,
  };
}

function extractCategorias(data) {
  const categorias =
    data?.categorias?.categorias ||
    data?.categorias?.data ||
    data?.categorias?.items ||
    data?.categorias?.rows ||
    data?.categoria?.categorias ||
    data?.categoria?.data ||
    data?.categorias ||
    data?.categoria ||
    data?.categories ||
    data?.category ||
    data?.result ||
    data?.resultado ||
    data?.rows ||
    data?.items ||
    data?.data?.categorias ||
    data?.data?.categories ||
    data?.data?.rows ||
    data?.data?.items ||
    data?.data ||
    (Array.isArray(data) ? data : []);

  return (Array.isArray(categorias) ? categorias : [categorias])
    .filter(Boolean)
    .map(normalizeCategory)
    .filter((categoria) => categoria.nome);
}

function mergeCategorias(...listas) {
  const categorias = [];

  listas.flat().forEach((categoria, index) => {
    if (!categoria?.nome) return;

    const normalizada = normalizeCategory(categoria, index);

    const existenteIndex = categorias.findIndex(
      (item) => item.nome.toLowerCase() === normalizada.nome.toLowerCase()
    );

    if (existenteIndex === -1) {
      categorias.push(normalizada);
      return;
    }

    const existente = categorias[existenteIndex];

    const existenteTemId = Number(existente.id) > 0;
    const novaTemId = Number(normalizada.id) > 0;

    if (!existenteTemId && novaTemId) {
      categorias[existenteIndex] = normalizada;
    }
  });

  return categorias;
}

function getIdCategoriaValido(idCategoria) {
  const id = Number(idCategoria);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "Categoria sem ID válido. Recarregue as categorias ou confira se a API de listagem retorna o id da categoria criada."
    );
  }

  return id;
}

async function encontrarProdutoCriado(productData) {
  const produtos = await listarProdutos();

  const nomeProduto = String(productData.nome || "")
    .trim()
    .toLowerCase();

  const precoProduto = Number(productData.preco);

  return produtos.find((produto) => {
    const mesmoNome =
      String(produto.nome || produto.nomeCompleto || "")
        .trim()
        .toLowerCase() === nomeProduto;

    const mesmoPreco = Number(produto.preco) === precoProduto;

    return mesmoNome && mesmoPreco;
  });
}

async function buscarCategoriasApi(options = {}) {
  const cacheKey = options.cacheKey || getCategoriaCacheKey();

  const data = await apiFetch(withCacheBust("/api/listar-categorias", cacheKey), {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  return extractCategorias(data);
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
  const idCategoria = getIdCategoriaValido(productData.idCategoria);

  const body = {
    nome: productData.nome,
    descricao: productData.descricao,
    preco: Number(productData.preco),
    estoque: Number(productData.estoque || 0),
    tipoMadeira: productData.tipoMadeira,
    acabamento: productData.acabamento,
    idCategoria,
  };

  const data = await apiFetch("/api/cadastro-produto", {
    method: "POST",
    body: JSON.stringify(body),
  });

  let idProduto =
    data?.produto?.id ||
    data?.produto?.id_produto ||
    data?.produtoId ||
    data?.idProduto ||
    data?.id_produto ||
    data?.id;

  if (!idProduto && productData.imagemArquivo) {
    const produtoCriado = await encontrarProdutoCriado(productData);

    idProduto = produtoCriado?.id;
  }

  if (idProduto && productData.imagemArquivo) {
    const formData = new FormData();

    formData.append("imagem", productData.imagemArquivo);

    await apiFetch(`/api/produtos/${idProduto}/imagens`, {
      method: "POST",
      body: formData,
    });
  }

  return data;
}

export async function editarProdutoAdmin(id, productData) {
  const idCategoria = getIdCategoriaValido(productData.idCategoria);

  const body = {
    nome: productData.nome,
    descricao: productData.descricao,
    preco: Number(productData.preco),
    estoque: Number(productData.estoque || 0),
    tipoMadeira: productData.tipoMadeira,
    acabamento: productData.acabamento,
    idCategoria,
  };

  const data = await apiFetch(`/api/atualizar-produto/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (productData.imagemArquivo) {
    const formData = new FormData();

    formData.append("imagem", productData.imagemArquivo);

    await apiFetch(`/api/produtos/${id}/imagens`, {
      method: "POST",
      body: formData,
    });
  }

  return data;
}

export function removerProdutoAdmin(id) {
  const productId = String(id);

  const produtosOcultos = getHiddenProducts();

  const jaEstaOculto = produtosOcultos.some(
    (hiddenId) => String(hiddenId) === productId
  );

  if (!jaEstaOculto) {
    saveHiddenProducts([...produtosOcultos, productId]);
  }
}

export async function listarCategoriasAdmin(options = {}) {
  try {
    const categoriasApi = await buscarCategoriasApi(options);

    const categoriasComId = categoriasApi.filter(
      (categoria) => Number(categoria.id) > 0
    );

    if (categoriasComId.length > 0) {
      saveCategoriasCache(categoriasComId);

      return categoriasComId;
    }
  } catch (error) {
    if (!options.useCacheOnError) {
      throw error;
    }
  }

  const cache = getCategoriasCache().filter(
    (categoria) => Number(categoria.id) > 0
  );

  if (cache.length > 0) {
    return cache;
  }

  saveCategoriasCache(categoriasPadrao);

  return categoriasPadrao;
}

export async function criarCategoriaAdmin(nome) {
  const nomeCategoria = nome.trim();

  if (!nomeCategoria) {
    throw new Error("Informe o nome da categoria.");
  }

  await apiFetch("/api/criar-categoria", {
    method: "POST",
    body: JSON.stringify({ nome: nomeCategoria }),
  });

  const cacheKey = revalidarCategoriasCache();

  const categoriasApi = await buscarCategoriasApi({ cacheKey });

  const categoriasComId = categoriasApi.filter(
    (categoria) => Number(categoria.id) > 0
  );

  const categoriaCriada = categoriasComId.find(
    (categoria) => categoria.nome.toLowerCase() === nomeCategoria.toLowerCase()
  );

  if (!categoriaCriada) {
    throw new Error(
      "Categoria criada, mas a API ainda não retornou o ID dela. Recarregue a página e tente novamente."
    );
  }

  const categoriasAtualizadas = mergeCategorias(
    getCategoriasCache(),
    categoriasComId
  ).filter((categoria) => Number(categoria.id) > 0);

  saveCategoriasCache(categoriasAtualizadas);

  return categoriasAtualizadas;
}

export async function atualizarCategoriaAdmin(id, nome) {
  const idCategoria = getIdCategoriaValido(id);

  await apiFetch(`/api/atualizar-categoria/${idCategoria}`, {
    method: "PUT",
    body: JSON.stringify({ nome }),
  });

  const cacheKey = revalidarCategoriasCache();

  const categoriasAtualizadas = getCategoriasCache().map((categoria) =>
    Number(categoria.id) === Number(idCategoria)
      ? { ...categoria, nome }
      : categoria
  );

  saveCategoriasCache(categoriasAtualizadas);

  return listarCategoriasAdmin({ cacheKey, useCacheOnError: true });
}

export async function deletarCategoriaLocal(id) {
  const idCategoria = Number(id);

  const categoriasAtualizadas = getCategoriasCache().filter(
    (categoria) => Number(categoria.id) !== idCategoria
  );

  saveCategoriasCache(categoriasAtualizadas);

  const cacheKey = revalidarCategoriasCache();

  return listarCategoriasAdmin({ cacheKey, useCacheOnError: true });
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

    const usuarios = data.usuarios || data.users || data.data || [];

    return usuarios.map((usuario) => ({
      id:
        usuario.id ||
        usuario.id_usuario ||
        usuario.id_user ||
        usuario.email,

      nome: usuario.nome || usuario.name || "Usuário",

      email: usuario.email || "sem-email@email.com",

      endereco:
        usuario.endereco ||
        usuario.enderecoCompleto ||
        usuario.endereco_completo ||
        "Endereço não informado",
    }));
  } catch {
    const usersObj = JSON.parse(localStorage.getItem("registeredUsers")) || {};

    return Object.values(usersObj).map((user, index) => ({
      id: index + 1,
      nome: user.nome,
      email: user.email,
      endereco: user.enderecoCompleto || user.endereco || "",
    }));
  }
}

export function listarPedidosAdmin() {
  const pedidosAdmin = JSON.parse(localStorage.getItem("adminAllPedidos")) || [];

  return pedidosAdmin.map((pedido) => ({
    ...pedido,
    nomeCliente: pedido.nomeCliente || "Cliente",
    endereco: pedido.endereco || "Endereço não informado",
    prazoEntrega: pedido.prazoEntrega || "21/06/2026",
    valor: pedido.valor || pedido.valorTotal,
  }));
}