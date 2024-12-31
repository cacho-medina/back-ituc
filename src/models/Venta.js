import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Venta = sequelize.define(
    "Sale",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        tipo_venta: {
            type: DataTypes.ENUM("venta", "permuta"),
            allowNull: false,
        },
        vendedor: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        nombre_cliente: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        telefono_cliente: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dni_cliente: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pago_usd: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        pago_pesos: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        pago_tarjeta: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        pago_transferencia: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        telefonoId: {
            //asociar a telefono
            type: DataTypes.UUID,
            allowNull: false,
        },
        sucursalId: {
            //asociar a telefono
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    { timestamps: false }
);

export default Venta;
