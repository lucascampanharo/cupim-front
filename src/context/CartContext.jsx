import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CartContext } from "./cart-context";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");

    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product, quantidade = 1) {
    const itemExists = cart.find((item) => item.id === product.id);

    if (itemExists) {
      const updatedCart = cart.map((item) => {
        if (item.id === product.id) {
          return {
            ...item,
            quantidade: item.quantidade + quantidade,
          };
        }

        return item;
      });

      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantidade,
        },
      ]);
    }

    toast.success("Produto adicionado ao carrinho!");
  }

  function removeFromCart(id) {
    const updatedCart = cart.filter((item) => item.id !== id);

    setCart(updatedCart);

    toast.info("Produto removido do carrinho.");
  }

  function increaseQuantity(id) {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantidade: item.quantidade + 1,
        };
      }

      return item;
    });

    setCart(updatedCart);
  }

  function decreaseQuantity(id) {
    const updatedCart = cart.map((item) => {
      if (item.id === id && item.quantidade > 1) {
        return {
          ...item,
          quantidade: item.quantidade - 1,
        };
      }

      return item;
    });

    setCart(updatedCart);
  }

  function clearCart() {
    setCart([]);

    localStorage.removeItem("cart");
  }

  const total = cart.reduce((acc, item) => {
    return acc + item.preco * item.quantidade;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
