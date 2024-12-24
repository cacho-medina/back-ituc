import Sucursal from "../models/Sucursal.js";
import User from "../models/User.js";
import Telefono from "../models/Telefono.js";
import Venta from "../models/Venta.js";
import "../models/relations.js";

// Crear una nueva sucursal
export const createSucursal = async (req, res) => {
    try {
        const { address } = req.body;
        const finded = await Sucursal.findOne({ where: { address } });
        if (finded) {
            return res.status(400).json({ message: "La sucursal ya existe" });
        }
        const newSucursal = await Sucursal.create({ address });
        res.status(201).json({ message: "Sucursal creada!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear la sucursal", error });
    }
};

// Obtener todas las sucursales
export const getSucursales = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const { count, rows: sucursales } = await Sucursal.findAndCountAll({
            limit,
            offset,
        });
        res.status(200).json({
            sucursales,
            totalSucursales: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las sucursales",
            error,
        });
    }
};

// Obtener una sucursal por ID
export const getSucursalesById = async (req, res) => {
    try {
        const { id } = req.params;
        const sucursal = await Sucursal.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "usuarios",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Telefono, // Assuming the model is named Telefono
                    as: "telefonos",
                    attributes: ["id", "model"],
                },
                {
                    model: Venta, // Assuming the model is named Venta
                    as: "ventas",
                    attributes: ["id", "fecha", "nombre_cliente"],
                },
            ],
        });
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrada" });
        }
        res.status(200).json(sucursal);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la sucursal",
            error,
        });
    }
};

// Actualizar una sucursal
export const updateSucursales = async (req, res) => {
    try {
        const { id } = req.params;
        const { address } = req.body;
        const sucursal = await Sucursal.findByPk(id);
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrada" });
        }
        sucursal.address = address;
        await sucursal.save();
        res.status(200).json({ message: "Sucursal actualizada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la sucursal",
            error,
        });
    }
};

// Eliminar una sucursal
export const deleteSucursales = async (req, res) => {
    try {
        const { id } = req.params;
        const sucursal = await Sucursal.findByPk(id);
        if (!sucursal) {
            return res.status(404).json({ message: "Sucursal no encontrada" });
        }
        await sucursal.destroy();
        res.status(200).json({ message: "Sucursal eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la sucursal",
            error,
        });
    }
};
