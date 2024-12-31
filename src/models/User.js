import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
                notNull: true,
            },
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: { type: DataTypes.STRING, allowNull: false },
        role: {
            type: DataTypes.ENUM("admin", "seller"),
            defaultValue: "admin",
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        sucursalId: {
            type: DataTypes.UUID,
            allowNull: true, // Solo para admin y seller
            references: {
                model: "Branches", // Nombre de la tabla en la base de datos (por defecto pluralizado)
                key: "id", // Columna referenciada en la tabla Sucursal
            },
            validate: {
                isSucursalRequired(value) {
                    if (this.role === "seller" && !value) {
                        throw new Error(
                            "El campo sucursalId es obligatorio para usuarios con rol seller."
                        );
                    }
                },
            },
        },
    },
    {
        timestamps: false,
    }
);

export default User;
