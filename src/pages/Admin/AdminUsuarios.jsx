import AdminLayout from "./AdminLayout";

import { useEffect, useState } from "react";

import { listarUsuariosAdmin } from "../../services/adminService";

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    async function carregarUsuarios() {
      const data = await listarUsuariosAdmin();

      setUsuarios(data);
    }

    carregarUsuarios();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-users-list">
        {usuarios.map((usuario) => (
          <div className="admin-user-row" key={usuario.id || usuario.email}>
            <p>
              <strong>Nome do cliente:</strong> {usuario.nome}
            </p>

            <p>
              <strong>Email:</strong> {usuario.email}
            </p>

            <p>
              <strong>Endereço:</strong> {usuario.endereco}
            </p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export default AdminUsuarios;