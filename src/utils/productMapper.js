import { getImageUrl } from "../services/api";

function getProductId(product) {
  return (
    product.id ??
    product.id_produto ??
    product.idProduto ??
    product.idproduct
  );
}

function caminhoPareceImagem(path) {
  if (!path) return false;

  const value = path.toString().toLowerCase();

  return (
    value.startsWith("http") ||
    value.startsWith("blob:") ||
    value.startsWith("data:") ||
    value.startsWith("/uploads") ||
    value.startsWith("uploads") ||
    value.startsWith("/images") ||
    value.includes(".png") ||
    value.includes(".jpg") ||
    value.includes(".jpeg") ||
    value.includes(".webp")
  );
}

function normalizeImage(image) {
  if (!image) return "";

  if (typeof image === "string") {
    return caminhoPareceImagem(image) ? getImageUrl(image) : "";
  }

  const imagePath =
    image.urlImagem ||
    image.url_imagem ||
    image.url ||
    image.imagem ||
    image.path ||
    image.caminho ||
    "";

  return caminhoPareceImagem(imagePath) ? getImageUrl(imagePath) : "";
}

function getStockOverride(id) {
  const stockOverrides =
    JSON.parse(localStorage.getItem("adminStockOverrides")) || {};

  return stockOverrides[id];
}

export function normalizeProduct(product = {}) {
  const productId = getProductId(product);

  const rawImages =
    product.imagens ||
    product.images ||
    product.imagensProduto ||
    product.produto_imagens ||
    [];

  const imagensApi = Array.isArray(rawImages)
    ? rawImages.map(normalizeImage).filter(Boolean)
    : [];

  const imagemPrincipalApi =
    product.imagem ||
    product.urlImagem ||
    product.url_imagem ||
    product.imagemPrincipal ||
    product.imagem_principal ||
    product.image;

  const imagemNormalizada = normalizeImage(imagemPrincipalApi);
  const imagens = imagemNormalizada
    ? [
        imagemNormalizada,
        ...imagensApi.filter((image) => image !== imagemNormalizada),
      ]
    : imagensApi;

  return {
    id: productId,

    nome: product.nome || "Produto",

    subtitulo:
      product.subtitulo ||
      product.categoria ||
      product.nome_categoria ||
      product.nomeCategoria ||
      "",

    nomeCompleto:
      product.nomeCompleto ||
      product.nome_completo ||
      product.nome ||
      "Produto",

    descricao:
      product.descricao ||
      product.description ||
      "",

    preco: Number(product.preco ?? product.valor ?? 0),

    estoque:
      getStockOverride(productId) ??
      product.estoque ??
      product.quantidade ??
      0,

    categoria:
      product.categoria ||
      product.nome_categoria ||
      product.nomeCategoria ||
      "Categoria",

    idCategoria:
      product.idCategoria ||
      product.id_categoria ||
      product.idcategoria ||
      null,

    tipoMadeira:
      product.tipoMadeira ||
      product.tipo_madeira ||
      product.tipo_madeira_produto ||
      "",

    acabamento:
      product.acabamento ||
      product.tipo_acabamento ||
      "",

    imagem: imagens[0] || "",

    imagens,
  };
}

export function normalizeProducts(products = []) {
  return products.map(normalizeProduct);
}
