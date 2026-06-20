import { apiFetch, getImageUrl } from "./api";
import mockProducts from "../data/products";
import { normalizeProduct } from "../utils/productMapper";

function getAdminCreatedProducts() {
  return JSON.parse(localStorage.getItem("adminCreatedProducts")) || [];
}

function getHiddenProducts() {
  return JSON.parse(localStorage.getItem("adminHiddenProducts")) || [];
}

function isProdutoOculto(id) {
  const hidden = getHiddenProducts();

  return hidden.some((hiddenId) => String(hiddenId) === String(id));
}

function aplicarProdutosOcultos(produtos) {
  return produtos.filter((produto) => !isProdutoOculto(produto.id));
}

async function buscarImagensDoProduto(id) {
  try {
    const imagens = await apiFetch(`/api/buscar-imagens/${id}`);

    if (!Array.isArray(imagens)) {
      return [];
    }

    return imagens
      .map((imagem) =>
        getImageUrl(
          imagem.urlImagem ||
            imagem.url_imagem ||
            imagem.url ||
            imagem.imagem
        )
      )
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function listarProdutos() {
  try {
    const data = await apiFetch("/produtos");

    const produtosApi =
      data.produtos ||
      data.products ||
      data.data ||
      (Array.isArray(data) ? data : []);

    const produtosBase = produtosApi.length > 0 ? produtosApi : mockProducts;

    const produtosNormalizados = produtosBase.map(normalizeProduct);

    const produtosLocais = getAdminCreatedProducts().map(normalizeProduct);

    const todosProdutos = [...produtosNormalizados, ...produtosLocais];

    return aplicarProdutosOcultos(todosProdutos);
  } catch (error) {
    console.warn("API de produtos indisponível. Usando mock:", error.message);

    const produtosMock = mockProducts.map(normalizeProduct);

    const produtosLocais = getAdminCreatedProducts().map(normalizeProduct);

    const todosProdutos = [...produtosMock, ...produtosLocais];

    return aplicarProdutosOcultos(todosProdutos);
  }
}

export async function buscarProdutoPorId(id) {
  if (isProdutoOculto(id)) {
    return null;
  }

  try {
    const data = await apiFetch(`/produtos/${id}`);

    const produtoApi =
      data.produto ||
      data.product ||
      data.data ||
      data;

    const produtoNormalizado = normalizeProduct(produtoApi);

    if (isProdutoOculto(produtoNormalizado.id)) {
      return null;
    }

    const imagensApi = await buscarImagensDoProduto(id);

    if (imagensApi.length > 0) {
      return {
        ...produtoNormalizado,
        imagem: imagensApi[0],
        imagens: imagensApi,
      };
    }

    return produtoNormalizado;
  } catch (error) {
    console.warn("API de detalhes indisponível. Usando mock:", error.message);

    const produtosLocais = getAdminCreatedProducts().map(normalizeProduct);

    const produtoLocal = produtosLocais.find(
      (product) => String(product.id) === String(id)
    );

    const produtoMock = mockProducts
      .map(normalizeProduct)
      .find((product) => String(product.id) === String(id));

    const produtoFinal = produtoLocal || produtoMock || null;

    if (!produtoFinal || isProdutoOculto(produtoFinal.id)) {
      return null;
    }

    return produtoFinal;
  }
}