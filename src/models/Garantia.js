import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Garantia = sequelize.define(
    "Warranty",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        details: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fechaIngreso: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("ingresado", "en proceso", "completado"),
            defaultValue: "ingresado",
            allowNull: false,
        },
        sucursalId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        resolucion: {
            type: DataTypes.ENUM("reparado", "reemplazado"),
            allowNull: true,
        },
        telefonoId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        telefonoCambioId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        timestamps: false,
    }
);

export default Garantia;

//ASOCIAR A SUCURSAL Y TELEFONO
