import { createContext, useEffect, useState } from "react";
import { apiFetch, saveToken, removeToken, getToken } from "../services/api";

export const AuthContext = createContext();

function salvarUsuarioLocal(userData) {
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || {};

  users[userData.email] = userData;

  localStorage.setItem("registeredUsers", JSON.stringify(users));
}

function buscarUsuarioLocal(email) {
  const users = JSON.parse(localStorage.getItem("registeredUsers")) || {};

  return users[email];
}

function normalizeUser(user, emailFallback = "") {
  if (!user) {
    return {
      id: null,
      nome: "Usuário",
      email: emailFallback,
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      cep: "",
      enderecoCompleto: "",
      admin: false,
    };
  }

  return {
    id:
      user.id ||
      user.id_usuario ||
      user.id_user ||
      user.idUser ||
      null,

    nome:
      user.nome ||
      user.name ||
      "Usuário",

    email:
      user.email ||
      emailFallback,

    endereco:
      user.endereco ||
      user.rua ||
      "",

    numero:
      user.numero ||
      "",

    complemento:
      user.complemento ||
      "",

    bairro:
      user.bairro ||
      "",

    cidade:
      user.cidade ||
      "",

    cep:
      user.cep ||
      "",

    enderecoCompleto:
      user.enderecoCompleto ||
      user.endereco_completo ||
      user.endereco ||
      "",

    admin:
      user.admin ||
      user.isAdmin ||
      false,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem("userLogged");
    const token = getToken();

    if (loggedUser && token) {
      setUser(JSON.parse(loggedUser));
    }
  }, []);

  async function register(userData) {
    const enderecoCompleto = `${userData.endereco}, ${userData.numero} - ${userData.bairro}, ${userData.cidade}, CEP: ${userData.cep}. Complemento: ${
      userData.complemento || "Sem complemento"
    }`;

    await apiFetch("/cadastro", {
      method: "POST",
      body: JSON.stringify({
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        endereco: enderecoCompleto,
      }),
    });

    salvarUsuarioLocal({
      nome: userData.nome,
      email: userData.email,
      endereco: userData.endereco,
      numero: userData.numero,
      complemento: userData.complemento,
      bairro: userData.bairro,
      cidade: userData.cidade,
      cep: userData.cep,
      enderecoCompleto,
      admin: false,
    });
  }

  async function login(email, senha) {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        senha,
      }),
    });

    const token =
      data.token ||
      data.jwt ||
      data.accessToken ||
      data.access_token;

    if (!token) {
      throw new Error("A API não retornou o token.");
    }

    saveToken(token);

    const usuarioLocal = buscarUsuarioLocal(email);

    let usuarioFinal =
      data.usuario ||
      data.user ||
      data.dadosUsuario ||
      usuarioLocal;

    try {
      const usuariosData = await apiFetch("/api/listar-usuarios");

      const usuarios =
        usuariosData.usuarios ||
        usuariosData.users ||
        usuariosData.data ||
        [];

      const usuarioApi = usuarios.find(
        (usuario) => usuario.email === email
      );

      if (usuarioApi) {
        usuarioFinal = {
          ...usuarioLocal,
          ...usuarioApi,
        };
      }
    } catch {
      console.warn("Não foi possível buscar dados completos do usuário.");
    }

    const loggedUser = normalizeUser(usuarioFinal, email);

    localStorage.setItem("userLogged", JSON.stringify(loggedUser));

    setUser(loggedUser);

    return true;
  }

  function logout() {
    removeToken();

    localStorage.removeItem("userLogged");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}