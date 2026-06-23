import { apiFetch, getImageUrl, getToken } from "./api";
import { normalizeProduct } from "../utils/productMapper";

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

    const produtosNormalizados = produtosApi.map(normalizeProduct);

    if (!getToken()) {
      return aplicarProdutosOcultos(produtosNormalizados);
    }

    const produtosComImagens = await Promise.all(
      produtosNormalizados.map(async (produto) => {
        const imagensApi = await buscarImagensDoProduto(produto.id);

        if (imagensApi.length === 0) return produto;

        return {
          ...produto,
          imagem: imagensApi[0],
          imagens: imagensApi,
        };
      })
    );

    return aplicarProdutosOcultos(produtosComImagens);
  } catch (error) {
    console.warn("API de produtos indisponível:", error.message);

    return [];
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

    const imagensApi = getToken() ? await buscarImagensDoProduto(id) : [];

    if (imagensApi.length > 0) {
      return {
        ...produtoNormalizado,
        imagem: imagensApi[0],
        imagens: imagensApi,
      };
    }

    return produtoNormalizado;
  } catch (error) {
    console.warn("API de detalhes indisponível:", error.message);

    return null;
  }
}
