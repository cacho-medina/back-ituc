import Garantia from "../models/Garantia.js";
import Telefono from "../models/Telefono.js";
import Venta from "../models/Venta.js";
import "../models/relations.js";

export const createGarantia = async (req, res) => {
    const { details, sucursalId, telefonoId } = req.body;
    try {
        const telefono = await Telefono.findByPk(telefonoId);
        if (!telefono) {
            return res.status(400).json({ message: "El telefono no existe" });
        }
        if (telefono.status !== "vendido") {
            return res
                .status(400)
                .json({ message: "El telefono no esta vendido" });
        }
        const garantiaExists = await Garantia.findOne({
            where: { telefonoId },
        });
        if (garantiaExists) {
            return res.status(400).json({ message: "La garantia ya existe" });
        }
        const garantia = await Garantia.create({
            details,
            status: "ingresado",
            fechaIngreso: new Date(),
            sucursalId,
            telefonoId,
        });
        telefono.status = "garantia";
        await telefono.save();
        res.status(201).json(garantia);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear la garantia", error });
    }
};
export const getGarantias = async (req, res) => {
    try {
        const garantias = await Garantia.findAll({
            include: [
                {
                    model: Telefono,
                    as: "telefono",
                },
            ],
        });
        res.status(200).json(garantias);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las garantias",
            error,
        });
    }
};
export const getGarantiaById = async (req, res) => {
    try {
        const garantia = await Garantia.findByPk(req.params.id, {
            include: [
                {
                    model: Telefono,
                    as: "telefono",
                    include: [
                        {
                            model: Venta,
                            as: "venta",
                        },
                    ],
                },
            ],
        });
        if (!garantia) {
            return res.status(404).json({ message: "Garantia no encontrada" });
        }
        res.status(200).json(garantia);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la garantia",
            error,
        });
    }
};
export const getGarantiasBySucursal = async (req, res) => {
    try {
        const garantias = await Garantia.findAll({
            where: { sucursalId: req.params.id },
        });
        if (garantias.length === 0) {
            return res
                .status(404)
                .json({ message: "No hay garantias en esta sucursal" });
        }
        res.status(200).json(garantias);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las garantias",
            error,
        });
    }
};
export const getGarantiaByTelefonoId = async (req, res) => {
    try {
        const { id } = req.params;
        const garantia = await Garantia.findOne({ where: { telefonoId: id } });
        res.status(200).json(garantia);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener la garantia",
            error,
        });
    }
};
export const updateStatusGarantia = async (req, res) => {
    try {
        const garantia = await Garantia.findByPk(req.params.id);
        if (!garantia) {
            return res.status(404).json({ message: "Garantia no encontrada" });
        }
        garantia.status = req.body.status;
        await garantia.save();
        res.status(200).json(garantia);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la garantia",
            error,
        });
    }
};
export const updateGarantia = async (req, res) => {
    try {
        const garantia = await Garantia.findByPk(req.params.id);
        if (!garantia) {
            return res.status(404).json({ message: "Garantia no encontrada" });
        }
        garantia.details = req.body.details;
        await garantia.save();
        res.status(200).json(garantia);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la garantia",
            error,
        });
    }
};
export const deleteGarantia = async (req, res) => {
    try {
        await Garantia.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: "Garantia eliminada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar la garantia",
            error,
        });
    }
};
