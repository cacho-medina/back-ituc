import User from "./User.js";
import Sucursal from "./Sucursal.js";
import Telefono from "./Telefono.js";
import Venta from "./Venta.js";
import Garantia from "./Garantia.js";

//sucursal y telefono
Sucursal.hasMany(Telefono, {
    foreignKey: "sucursalId",
    as: "telefonos",
});
Telefono.belongsTo(Sucursal, {
    foreignKey: "sucursalId",
    as: "sucursal",
    attributes: ["id", "address"],
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
//revisar relacion garantia y telefono
Garantia.belongsTo(Telefono, { foreignKey: "telefonoId", as: "telefono" });
