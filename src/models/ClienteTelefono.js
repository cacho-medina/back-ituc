import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const ClienteTelefono = sequelize.define("ClientPhone", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    clienteId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    telefonoId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
});

export default ClienteTelefono;
