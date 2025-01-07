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
        telefonoId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

export default Garantia;

//ASOCIAR A SUCURSAL Y TELEFONO
