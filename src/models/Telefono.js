import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Telefono = sequelize.define(
    "Phone",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        batery_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        imei: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        storage_capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        references: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        details: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                "disponible",
                "vendido",
                "garantia",
                "deposito",
                "reparacion"
            ),
            defaultValue: "disponible",
            allowNull: false,
        },
        sucursalId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

export default Telefono;