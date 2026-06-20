import mockProducts from "../data/products";
import { getImageUrl } from "../services/api";

const fallbackImages = {
  sofa:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
  "sofa de centro":
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",
  sofazinho:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",

  "mesa de jantar":
    "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=1200",
  "mesa de jantar rústica":
    "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=1200",

  "mesa de centro":
    "https://images.unsplash.com/photo-1532372320572-cda25653a694?q=80&w=1200",
  "mesa de centro moderna":
    "https://images.unsplash.com/photo-1532372320572-cda25653a694?q=80&w=1200",

  sapateira:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200",

  penteadeira:
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200",

  prateleira:
    "https://images.unsplash.com/photo-1602872030219-ad2b9a54315c?q=80&w=1200",
};

function getMockById(id) {
  return mockProducts.find((item) => Number(item.id) === Number(id));
}

function getProductId(product) {
  return (
    product.id ??
    product.id_produto ??
    product.idProduto ??
    product.idproduct
  );
}

function removeAcentos(texto = "") {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function detectarImagemPorProduto(product, mock) {
  const nome = removeAcentos(product.nome || mock?.nome || "");
  const nomeCompleto = removeAcentos(
    product.nomeCompleto ||
      product.nome_completo ||
      product.nome ||
      mock?.nomeCompleto ||
      ""
  );
  const categoria = removeAcentos(
    product.categoria ||
      product.nome_categoria ||
      product.nomeCategoria ||
      mock?.categoria ||
      ""
  );

  const texto = `${nome} ${nomeCompleto} ${categoria}`;

  if (texto.includes("sofazinho")) return fallbackImages.sofazinho;

  if (texto.includes("sofa")) return fallbackImages.sofa;

  if (texto.includes("mesa de jantar")) {
    return fallbackImages["mesa de jantar"];
  }

  if (texto.includes("mesa de centro")) {
    return fallbackImages["mesa de centro"];
  }

  if (texto.includes("sapateira")) return fallbackImages.sapateira;

  if (texto.includes("penteadeira")) return fallbackImages.penteadeira;

  if (texto.includes("prateleira")) return fallbackImages.prateleira;

  return mock?.imagem || fallbackImages["mesa de centro"];
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
    if (!caminhoPareceImagem(image)) {
      return "";
    }

    return getImageUrl(image);
  }

  const imagePath =
    image.urlImagem ||
    image.url_imagem ||
    image.url ||
    image.imagem ||
    image.path ||
    image.caminho ||
    "";

  if (!caminhoPareceImagem(imagePath)) {
    return "";
  }

  return getImageUrl(imagePath);
}

function getStockOverride(id) {
  const stockOverrides =
    JSON.parse(localStorage.getItem("adminStockOverrides")) || {};

  return stockOverrides[id];
}

export function normalizeProduct(product) {
  const productId = getProductId(product);

  const mock = getMockById(productId);

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

  const imagemFallback = detectarImagemPorProduto(product, mock);

  return {
    id: productId,

    nome: product.nome || mock?.nome || "Produto",

    subtitulo:
      product.subtitulo ||
      product.categoria ||
      product.nome_categoria ||
      mock?.subtitulo ||
      "",

    nomeCompleto:
      product.nomeCompleto ||
      product.nome_completo ||
      product.nome ||
      mock?.nomeCompleto ||
      mock?.nome ||
      "Produto",

    descricao:
      product.descricao ||
      product.description ||
      mock?.descricao ||
      "Produto artesanal.",

    preco: Number(product.preco ?? product.valor ?? mock?.preco ?? 0),

    estoque:
      getStockOverride(productId) ??
      product.estoque ??
      product.quantidade ??
      mock?.estoque ??
      0,

    categoria:
      product.categoria ||
      product.nome_categoria ||
      product.nomeCategoria ||
      mock?.categoria ||
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
      mock?.tipoMadeira ||
      "Madeira",

    acabamento:
      product.acabamento ||
      product.tipo_acabamento ||
      mock?.acabamento ||
      "Acabamento",

    imagem:
      imagemNormalizada ||
      imagensApi[0] ||
      imagemFallback,

    imagens:
      imagensApi.length > 0
        ? imagensApi
        : mock?.imagens || [imagemFallback],
  };
}

export function normalizeProducts(products = []) {
  return products.map(normalizeProduct);
}