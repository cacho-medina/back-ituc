import Garantia from "../models/Garantia.js";
import Telefono from "../models/Telefono.js";
import Venta from "../models/Venta.js";
import "../models/relations.js";
import sequelize from "../config/db.js";
import Cliente from "../models/Clientes.js";
import ClienteTelefono from "../models/ClienteTelefono.js";
import { formatISO, parse } from "date-fns";
import { Op } from "sequelize";

export const createGarantia = async (req, res) => {
    const { details, sucursalId, telefonoId, imei } = req.body;
    try {
        const telefono = await Telefono.findByPk(telefonoId);
        if (!telefono) {
            /* return res.status(400).json({ message: "El telefono no existe" }); */
            isRegistered = false;
            mensajeRespuesta.message =
                "El telefono no esta registrado en la base de datos, verificar manualmente en Excel.";
            const garantia = await Garantia.create({
                details,
                status: "ingresado",
                fechaIngreso: new Date(),
                sucursalId,
                telefonoId,
                telefonoCambioId: null,
            });
        }

        if (
            telefono &&
            telefono.status !== "vendido" &&
            telefono.status !== "cambiado" &&
            telefono.status !== "no disponible"
        ) {
            /* return res
                .status(400)
                .json({ message: "El telefono no fue vendido o cambiado" }); */
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
        const {
            fromDate,
            toDate,
            model,
            imei,
            page = 1,
            limit = 20,
        } = req.query;

        // Construir objeto de filtros
        const whereConditions = {};
        const phoneWhereConditions = {};

        // Filtro por fechas de ingreso
        if (fromDate || toDate) {
            whereConditions.fechaIngreso = {};

            if (fromDate && toDate) {
                whereConditions.fechaIngreso = {
                    [Op.between]: [
                        formatISO(parse(fromDate, "yyyy-MM-dd", new Date())),
                        formatISO(parse(toDate, "yyyy-MM-dd", new Date())),
                    ],
                };
            } else if (fromDate) {
                whereConditions.fechaIngreso = {
                    [Op.gte]: formatISO(
                        parse(fromDate, "yyyy-MM-dd", new Date())
                    ),
                };
            } else if (toDate) {
                whereConditions.fechaIngreso = {
                    [Op.lte]: formatISO(
                        parse(toDate, "yyyy-MM-dd", new Date())
                    ),
                };
            }
        }

        // Filtros para el teléfono
        if (model) {
            phoneWhereConditions.model = {
                [Op.iLike]: `%${model}%`,
            };
        }

        if (imei) {
            phoneWhereConditions.imei = {
                [Op.iLike]: `%${imei}%`,
            };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: garantias } = await Garantia.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Telefono,
                    as: "telefonoPrimario",
                    where:
                        Object.keys(phoneWhereConditions).length > 0
                            ? phoneWhereConditions
                            : undefined,
                },
                {
                    model: Telefono,
                    as: "telefonoCambio",
                },
            ],
            order: [["fechaIngreso", "DESC"]],
            limit: parseInt(limit),
            offset: offset,
        });

        res.status(200).json({
            garantias,
            totalGarantias: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit)),
            hasNextPage: offset + parseInt(limit) < count,
            hasPrevPage: parseInt(page) > 1,
        });
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
        const data = {};
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
        const infoVenta = await Venta.findOne({
            where: { telefonoId: garantia.telefonoId },
            include: [
                {
                    model: Cliente,
                    as: "cliente",
                    attributes: ["nombre", "telefono", "dni"],
                },
            ],
        });

        if (!infoVenta) {
            data.garantia = garantia;
        } else {
            data.garantia = garantia;
            data.infoVenta = infoVenta;
        }

        res.status(200).json(data);
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
        const { id } = req.params;
        const {
            fromDate,
            toDate,
            model,
            imei,
            page = 1,
            limit = 20,
        } = req.query;

        // Construir objeto de filtros
        const whereConditions = { sucursalId: id };
        const phoneWhereConditions = {};

        // Filtro por fechas de ingreso
        if (fromDate || toDate) {
            whereConditions.fechaIngreso = {};

            if (fromDate && toDate) {
                whereConditions.fechaIngreso = {
                    [Op.between]: [
                        formatISO(parse(fromDate, "yyyy-MM-dd", new Date())),
                        formatISO(parse(toDate, "yyyy-MM-dd", new Date())),
                    ],
                };
            } else if (fromDate) {
                whereConditions.fechaIngreso = {
                    [Op.gte]: formatISO(
                        parse(fromDate, "yyyy-MM-dd", new Date())
                    ),
                };
            } else if (toDate) {
                whereConditions.fechaIngreso = {
                    [Op.lte]: formatISO(
                        parse(toDate, "yyyy-MM-dd", new Date())
                    ),
                };
            }
        }

        // Filtros para el teléfono
        if (model) {
            phoneWhereConditions.model = {
                [Op.iLike]: `%${model}%`,
            };
        }

        if (imei) {
            phoneWhereConditions.imei = {
                [Op.iLike]: `%${imei}%`,
            };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: garantias } = await Garantia.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Telefono,
                    as: "telefonoPrimario",
                    where:
                        Object.keys(phoneWhereConditions).length > 0
                            ? phoneWhereConditions
                            : undefined,
                },
                {
                    model: Telefono,
                    as: "telefonoCambio",
                },
            ],
            order: [["fechaIngreso", "DESC"]],
            limit: parseInt(limit),
            offset: offset,
        });

        res.status(200).json({
            garantias,
            totalGarantias: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit)),
            hasNextPage: offset + parseInt(limit) < count,
            hasPrevPage: parseInt(page) > 1,
        });
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
            // Marcar teléfono original como reparacion
            const telefonoOriginal = await Telefono.findByPk(
                garantia.telefonoId,
                { transaction: t }
            );
            telefonoOriginal.status = "reparacion";
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

export const registerTelefonoCliente = async (req, res) => {
    // Iniciar transacción
    const t = await sequelize.transaction();

    try {
        const { telefono, cliente } = req.body;
        let clientId;

        const clientExists = await Cliente.findOne({
            where: { dni: cliente.dni },
            transaction: t,
        });

        if (!clientExists) {
            const newClient = await Cliente.create(
                {
                    nombre: cliente.nombre,
                    dni: cliente.dni,
                    telefono: cliente.telefono,
                },
                { transaction: t }
            );
            clientId = newClient.id;
        } else {
            clientId = clientExists.id;
        }

        const newTelefono = await Telefono.create(telefono, { transaction: t });

        await ClienteTelefono.create(
            {
                clienteId: clientId,
                telefonoId: newTelefono.id,
            },
            { transaction: t }
        );

        // Confirmar transacción
        await t.commit();

        res.status(201).json(newTelefono);
    } catch (error) {
        // Revertir transacción en caso de error
        await t.rollback();
        console.error(error);
        res.status(500).json({
            message: "Error al registrar el telefono al cliente",
            error,
        });
    }
};
