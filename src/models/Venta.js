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
        vendedor: {
            type: DataTypes.STRING,
            allowNull: false,
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
        //agregar metodo de pago
    },
    { timestamps: false }
);

export default Venta;
