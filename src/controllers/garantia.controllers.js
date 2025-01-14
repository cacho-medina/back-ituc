import Garantia from "../models/Garantia.js";
import Telefono from "../models/Telefono.js";
import Venta from "../models/Venta.js";
import "../models/relations.js";
import sequelize from "../config/db.js";
import Cliente from "../models/Clientes.js";
import ClienteTelefono from "../models/ClienteTelefono.js";

export const createGarantia = async (req, res) => {
    const { details, sucursalId, telefonoId } = req.body;
    try {
        const telefono = await Telefono.findByPk(telefonoId);
        if (!telefono) {
            return res.status(400).json({ message: "El telefono no existe" });
        }
        if (telefono.status !== "vendido" && telefono.status !== "cambiado") {
            return res
                .status(400)
                .json({ message: "El telefono no fue vendido o cambiado" });
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
            telefonoCambioId: null,
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
                    as: "telefonoPrimario",
                },
                {
                    model: Telefono,
                    as: "telefonoCambio",
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
                    as: "telefonoPrimario",
                },
                {
                    model: Telefono,
                    as: "telefonoCambio",
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
export const updateResolucionGarantia = async (req, res) => {
    // Iniciar transacción
    const t = await sequelize.transaction();

    try {
        const { cambioId } = req.body;
        const garantia = await Garantia.findByPk(req.params.id, {
            transaction: t,
        });

        if (!garantia) {
            await t.rollback();
            return res.status(404).json({ message: "Garantia no encontrada" });
        }

        if (garantia.status === "completado") {
            await t.rollback();
            return res
                .status(400)
                .json({ message: "La garantía ya está completada" });
        }

        if (cambioId) {
            const cliente = await ClienteTelefono.findOne({
                where: { telefonoId: garantia.telefonoId },
            });
            // Marcar teléfono original como no disponible
            const telefonoOriginal = await Telefono.findByPk(
                garantia.telefonoId,
                { transaction: t }
            );
            telefonoOriginal.status = "no disponible";
            await telefonoOriginal.save({ transaction: t });

            const telefonoCambio = await Telefono.findByPk(cambioId, {
                transaction: t,
            });
            if (!telefonoCambio) {
                await t.rollback();
                return res
                    .status(404)
                    .json({ message: "Telefono para cambio no encontrado" });
            }

            // Actualizar estado del teléfono de cambio
            telefonoCambio.status = "cambiado";
            await telefonoCambio.save({ transaction: t });

            //registra la relacion entre el cliente y el telefono nuevo
            await ClienteTelefono.create({
                clienteId: cliente.clienteId,
                telefonoId: telefonoCambio.id,
            });

            garantia.telefonoCambioId = cambioId;
            garantia.resolucion = "reemplazado";
        } else {
            // Marcar teléfono original como no disponible
            const telefonoOriginal = await Telefono.findByPk(
                garantia.telefonoId,
                { transaction: t }
            );
            telefonoOriginal.status = "no disponible";
            await telefonoOriginal.save({ transaction: t });
            garantia.resolucion = "reparado";
        }

        garantia.status = "completado";
        await garantia.save({ transaction: t });

        // Si todo sale bien, confirmar la transacción
        await t.commit();

        res.status(200).json(garantia);
    } catch (error) {
        // Si hay error, revertir la transacción
        await t.rollback();
        console.error(error);
        res.status(500).json({
            message: "Error al registrar el cambio de garantia",
            error,
        });
    }
};

export const getHistorialCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const historial = await Cliente.findByPk(clienteId, {
            include: [
                {
                    model: Venta,
                    as: "ventas",
                    include: [
                        {
                            model: Telefono,
                            as: "telefono",
                            include: [
                                {
                                    model: Garantia,
                                    as: "garantiasPrimarias",
                                    include: [
                                        {
                                            model: Telefono,
                                            as: "telefonoCambio",
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el historial del cliente",
        });
    }
};
