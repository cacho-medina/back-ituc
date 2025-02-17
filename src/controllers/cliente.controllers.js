import Cliente from "../models/Clientes.js";
import ClienteTelefono from "../models/ClienteTelefono.js";

export const createCliente = async (req, res) => {
    try {
        const { nombre, telefono, dni } = req.body;
        const findCliente = await Cliente.findOne({ where: { dni } });
        if (findCliente) {
            return res.status(400).json({ message: "El cliente ya existe" });
        }
        const cliente = await Cliente.create({ nombre, telefono, dni });
        res.status(201).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el cliente" });
    }
};

export const getClientes = async (req, res) => {
    try {
        const clientes = await Cliente.findAll();
        res.status(200).json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los clientes" });
    }
};

export const getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id, {
            include: [
                {
                    model: ClienteTelefono,
                    as: "telefonos",
                    attributes: ["id", "telefonoId"],
                    include: [
                        {
                            model: Telefono,
                            as: "telefono",
                            attributes: [
                                "id",
                                "imei",
                                "model",
                                "price",
                                "status",
                            ],
                        },
                    ],
                },
            ],
        });
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el cliente" });
    }
};

export const associateClienteTelefono = async (req, res) => {
    try {
        const { clienteId, telefonoId } = req.body;
        const findClienteTelefono = await ClienteTelefono.findOne({
            where: { clienteId, telefonoId },
        });
        if (findClienteTelefono) {
            return res.status(400).json({
                message: "El cliente ya tiene este telefono asociado",
            });
        }
        const clienteTelefono = await ClienteTelefono.create({
            clienteId,
            telefonoId,
        });
        res.status(201).json(clienteTelefono);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al asociar el cliente a el telefono",
            error,
        });
    }
};
