import User from "./User.js";
import Sucursal from "./Sucursal.js";
import Telefono from "./Telefono.js";
import Venta from "./Venta.js";
import Garantia from "./Garantia.js";
import Cliente from "./Clientes.js";
import ClienteTelefono from "./ClienteTelefono.js";

//sucursal y telefono
Sucursal.hasMany(Telefono, {
    foreignKey: "sucursalId",
    as: "telefonos",
});
Telefono.belongsTo(Sucursal, {
    foreignKey: "sucursalId",
    as: "sucursal",
});

//sucursal y usuario
Sucursal.hasMany(User, { foreignKey: "sucursalId", as: "usuarios" });
User.belongsTo(Sucursal, { foreignKey: "sucursalId", as: "sucursal" });

//sucursal y ventas
Sucursal.hasMany(Venta, { foreignKey: "sucursalId", as: "ventas" });
Venta.belongsTo(Sucursal, { foreignKey: "sucursalId", as: "sucursal" });

//telefono y ventas
Venta.belongsTo(Telefono, { foreignKey: "telefonoId", as: "telefono" });

//garantia y sucursal
Garantia.belongsTo(Sucursal, { foreignKey: "sucursalId", as: "sucursal" });

/* --------------------------------------------------------- */

Telefono.hasOne(Venta, { foreignKey: "telefonoId", as: "venta" });

//garantia y telefono
Telefono.hasMany(Garantia, {
    foreignKey: "telefonoId",
    as: "garantiasPrimarias",
});
Telefono.hasMany(Garantia, {
    foreignKey: "telefonoCambioId",
    as: "garantiasDeCambio",
});
Garantia.belongsTo(Telefono, {
    foreignKey: "telefonoId",
    as: "telefonoPrimario",
});
Garantia.belongsTo(Telefono, {
    foreignKey: "telefonoCambioId",
    as: "telefonoCambio",
});

//venta y cliente
Venta.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" });
Cliente.hasMany(Venta, { foreignKey: "clienteId", as: "ventas" });

// Relación entre Cliente y Telefono
Cliente.belongsToMany(Telefono, {
    through: ClienteTelefono,
    foreignKey: "clienteId",
    otherKey: "telefonoId",
    as: "telefonos",
});

Telefono.belongsToMany(Cliente, {
    through: ClienteTelefono,
    foreignKey: "telefonoId",
    otherKey: "clienteId",
    as: "clientes",
});

// Agregar las relaciones directas con el modelo de unión
Cliente.hasMany(ClienteTelefono, {
    foreignKey: "clienteId",
});

ClienteTelefono.belongsTo(Cliente, {
    foreignKey: "clienteId",
});

Telefono.hasMany(ClienteTelefono, {
    foreignKey: "telefonoId",
});

ClienteTelefono.belongsTo(Telefono, {
    foreignKey: "telefonoId",
});
