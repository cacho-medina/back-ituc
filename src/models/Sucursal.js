import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Sucursal = sequelize.define(
    "Branch",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    { timestamps: false }
);

export default Sucursal;
