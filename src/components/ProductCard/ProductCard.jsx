import "./productCard.css";

import { useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="product-card">
      {product.imagem && !imageError ? (
        <img
          src={product.imagem}
          alt={product.nomeCompleto || product.nome}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="product-image-placeholder">Sem imagem</div>
      )}

      <div className="product-info">
        <h3>{product.nomeCompleto || product.nome}</h3>

        <span>
          R${" "}
          {Number(product.preco).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </span>

        <p>{product.descricao}</p>

        <Link to={`/detalhes/${product.id}`}>
          <button>Ver mais →</button>
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
