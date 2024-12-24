import Telefono from "../models/Telefono.js";
import Sucursal from "../models/Sucursal.js";
import "../models/relations.js";

// Crear un nuevo teléfono
export const createTelefono = async (req, res) => {
    try {
        const {
            model,
            batery_status,
            color,
            price,
            imei,
            provider,
            storage_capacity,
            references,
            details,
            status,
            sucursalId,
        } = req.body;

        const finded = await Telefono.findOne({ where: { imei } });
        if (finded) {
            return res.status(400).json({ message: "El teléfono ya existe" });
        }

        const newTelefono = await Telefono.create({
            model,
            batery_status,
            color,
            price,
            imei,
            provider,
            storage_capacity,
            references,
            details,
            status,
            sucursalId,
        });

        res.status(201).json({ message: "Telefono creado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el teléfono", error });
    }
};

// Obtener todos los teléfonos
export const getTelefonos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows: telefonos } = await Telefono.findAndCountAll({
            /*             include: {
                model: Sucursal,
                as: "sucursal",
                attributes: ["address"],
            }, */
            limit,
            offset,
        });
        res.status(200).json({
            telefonos,
            totalTelefonos: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los teléfonos",
            error,
        });
    }
};

// Obtener un teléfono por ID
export const getTelefonoById = async (req, res) => {
    try {
        const { id } = req.params;
        const telefono = await Telefono.findByPk(id, {
            include: {
                model: Sucursal,
                as: "sucursal",
                attributes: ["id", "address"],
            },
        });

        if (!telefono) {
            return res.status(404).json({ message: "Teléfono no encontrado" });
        }

        res.status(200).json(telefono);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el teléfono",
            error,
        });
    }
};

// Actualizar un teléfono
export const updateTelefono = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            model,
            batery_status,
            color,
            price,
            imei,
            provider,
            storage_capacity,
            references,
            details,
            status,
            sucursalId,
        } = req.body;

        const telefono = await Telefono.findByPk(id);
        if (!telefono) {
            return res.status(404).json({ message: "Teléfono no encontrado" });
        }

        telefono.model = model || telefono.model;
        telefono.batery_status = batery_status || telefono.batery_status;
        telefono.color = color || telefono.color;
        telefono.price = price || telefono.price;
        telefono.imei = imei || telefono.imei;
        telefono.provider = provider || telefono.provider;
        telefono.storage_capacity =
            storage_capacity || telefono.storage_capacity;
        telefono.references = references || telefono.references;
        telefono.details = details || telefono.details;
        telefono.status = status || telefono.status;
        telefono.sucursalId = sucursalId || telefono.sucursalId;

        await telefono.save();

        res.status(200).json({
            message: "Telefono actualizado exitosamente",
            telefono,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar el teléfono",
            error,
        });
    }
};

// Cambiar el estado de un teléfono
export const changeTelefonoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const telefono = await Telefono.findByPk(id);
        if (!telefono) {
            return res.status(404).json({ message: "Teléfono no encontrado" });
        }

        telefono.status = status;
        await telefono.save();

        res.status(200).json({
            message: "Estado del teléfono actualizado correctamente",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar el estado del teléfono",
            error,
        });
    }
};

// Eliminar un teléfono
export const deleteTelefono = async (req, res) => {
    try {
        const { id } = req.params;

        const telefono = await Telefono.findByPk(id);
        if (!telefono) {
            return res.status(404).json({ message: "Teléfono no encontrado" });
        }

        await telefono.destroy();
        res.status(200).json({ message: "Teléfono eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar el teléfono",
            error,
        });
    }
};
