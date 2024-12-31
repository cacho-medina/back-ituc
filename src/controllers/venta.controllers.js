import Venta from "../models/Venta.js";
import Telefono from "../models/Telefono.js";
import Sucursal from "../models/Sucursal.js";
import "../models/relations.js";
import { Op } from "sequelize";

// Crear una nueva venta
export const createVentas = async (req, res) => {
    try {
        const {
            vendedor,
            nombre_cliente,
            telefono_cliente,
            dni_cliente,
            pago_usd,
            pago_pesos,
            pago_tarjeta,
            pago_transferencia,
            telefonoId,
        } = req.body;

        //busca el telefono a vender
        const phoneForSale = await Telefono.findOne({
            where: { id: telefonoId },
        });
        if (!phoneForSale) {
            return res.status(404).json({ message: "Telefono no encontrado" });
        }

        //registra la venta
        const newVenta = await Venta.create({
            fecha: Date.now(),
            vendedor: vendedor || null,
            tipo_venta: "venta",
            nombre_cliente,
            telefono_cliente,
            dni_cliente,
            pago_usd,
            pago_pesos,
            pago_tarjeta,
            pago_transferencia,
            telefonoId,
            sucursalId: phoneForSale.sucursalId,
        });

        //actualiza el estado del telefono a vendido
        phoneForSale.status = "vendido";
        await phoneForSale.save();

        res.status(201).json(newVenta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear la venta", error });
    }
};

export const createPermuta = async (req, res) => {
    try {
        const {
            vendedor,
            nombre_cliente,
            telefono_cliente,
            dni_cliente,
            model,
            batery_status,
            color,
            price,
            imei,
            storage_capacity,
            status,
            details,
            pago_usd,
            pago_pesos,
            pago_tarjeta,
            pago_transferencia,
            telefonoId,
        } = req.body;

        //busca el telefono a vender
        const phoneForSale = await Telefono.findOne({
            where: { id: telefonoId },
        });
        if (!phoneForSale) {
            return res.status(404).json({ message: "Telefono no encontrado" });
        }

        //registrar el telefono entrante
        const newPhone = await Telefono.create({
            model,
            batery_status,
            color,
            price,
            imei,
            storage_capacity,
            status,
            details,
            sucursalId: phoneForSale.sucursalId,
            provider: "permuta",
        });

        //registra la venta
        const newVenta = await Venta.create({
            fecha: Date.now(),
            vendedor: vendedor || null,
            tipo_venta: "permuta",
            nombre_cliente,
            telefono_cliente,
            dni_cliente,
            pago_usd,
            pago_pesos,
            pago_tarjeta,
            pago_transferencia,
            telefonoId,
            sucursalId: phoneForSale.sucursalId,
        });

        //actualiza el estado del telefono a vendido
        phoneForSale.status = "vendido";
        await phoneForSale.save();

        res.status(201).json(newVenta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar permuta" });
    }
};

// Obtener todas las ventas
export const getVentas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows: ventas } = await Venta.findAndCountAll({
            include: [
                {
                    model: Telefono,
                    as: "telefono",
                    attributes: ["id", "model", "imei", "price"],
                },
                {
                    model: Sucursal,
                    as: "sucursal",
                    attributes: ["id", "address"],
                },
            ],
            limit,
            offset,
        });
        res.status(200).json({
            ventas,
            totalVentas: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las ventas", error });
    }
};

// Obtener una venta por ID
export const getVentaById = async (req, res) => {
    try {
        const { id } = req.params;
        const venta = await Venta.findByPk(id, {
            include: [
                {
                    model: Telefono,
                    as: "telefono",
                    attributes: ["id", "model", "imei", "price"],
                },
                {
                    model: Sucursal,
                    as: "sucursal",
                    attributes: ["id", "address"],
                },
            ],
        });

        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        res.status(200).json(venta);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la venta", error });
    }
};

// Actualizar una venta
export const updateVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fecha,
            vendedor,
            nombre_cliente,
            telefono_cliente,
            dni_cliente,
            telefonoId,
            sucursalId,
        } = req.body;

        const venta = await Venta.findByPk(id);
        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        venta.fecha = fecha || venta.fecha;
        venta.vendedor = vendedor || venta.vendedor;
        venta.nombre_cliente = nombre_cliente || venta.nombre_cliente;
        venta.telefono_cliente = telefono_cliente || venta.telefono_cliente;
        venta.dni_cliente = dni_cliente || venta.dni_cliente;
        venta.telefonoId = telefonoId || venta.telefonoId;
        venta.sucursalId = sucursalId || venta.sucursalId;

        await venta.save();

        res.status(200).json(venta);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar la venta",
            error,
        });
    }
};

// Eliminar una venta
export const deleteVenta = async (req, res) => {
    try {
        const { id } = req.params;

        const venta = await Venta.findByPk(id);
        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        await venta.destroy();
        res.status(200).json({ message: "Venta eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar la venta", error });
    }
};

/////////////////////FUTURA IMPLEMENTACION//////////////////////////
// Obtener todas las ventas de una sucursal
export const getVentasBySucursal = async (req, res) => {
    try {
        const { sucursalId } = req.params;
        const ventas = await Venta.findAll({
            where: { sucursalId },
            include: [
                {
                    model: Telefono,
                    as: "telefono",
                    attributes: ["id", "model", "imei", "price"],
                },
                {
                    model: Sucursal,
                    as: "sucursal",
                    attributes: ["id", "address"],
                },
            ],
        });

        res.status(200).json(ventas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las ventas por sucursal",
            error,
        });
    }
};

// Obtener todas las ventas mensuales
export const getVentasMensuales = async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const ventas = await Venta.findAll({
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate],
                },
            },
            include: [
                {
                    model: Telefono,
                    as: "telefono",
                    attributes: ["id", "model", "imei", "price"],
                },
                {
                    model: Sucursal,
                    as: "sucursal",
                    attributes: ["id", "address"],
                },
            ],
        });

        res.status(200).json(ventas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las ventas mensuales",
            error,
        });
    }
};

export const getVentasDiarias = async (req, res) => {
    try {
        const { year, month, day } = req.params;
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day, 23, 59, 59);

        const ventas = await Venta.findAll({
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate],
                },
            },
            include: [
                {
                    model: Telefono,
                    as: "telefono",
                    attributes: ["id", "model", "imei", "price"],
                },
                {
                    model: Sucursal,
                    as: "sucursal",
                    attributes: ["id", "address"],
                },
            ],
        });

        res.status(200).json(ventas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las ventas diarias",
            error,
        });
    }
};

export const getVentasPorTipo = async (req, res) => {
    try {
        const { tipo_venta } = req.params;
        const ventas = await Venta.findAll({ where: { tipo_venta } });
        res.status(200).json(ventas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las ventas por tipo",
            error,
        });
    }
};
