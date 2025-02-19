import Venta from "../models/Venta.js";
import Telefono from "../models/Telefono.js";
import Sucursal from "../models/Sucursal.js";
import "../models/relations.js";
import { Op } from "sequelize";
import Cliente from "../models/Clientes.js";
import ClienteTelefono from "../models/ClienteTelefono.js";
import { formatISO, parse } from "date-fns";

// Crear una nueva venta
export const createVenta = async (req, res) => {
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
            fechaVenta,
            sucursalId,
        } = req.body;

        //busca el telefono a vender
        const phoneForSale = await Telefono.findOne({
            where: { id: telefonoId },
        });
        if (!phoneForSale) {
            return res.status(404).json({ message: "Telefono no encontrado" });
        }
        if (phoneForSale.status === "vendido") {
            return res.status(400).json({ message: "Telefono ya vendido" });
        }
        let findCliente = await Cliente.findOne({
            where: { dni: dni_cliente },
        });
        if (!findCliente) {
            //registrar el cliente
            findCliente = await Cliente.create({
                nombre: nombre_cliente,
                telefono: telefono_cliente,
                dni: dni_cliente,
            });
        }

        //registra la venta
        const newVenta = await Venta.create({
            fecha: fechaVenta ? new Date(fechaVenta) : new Date(),
            vendedor: vendedor || null,
            tipo_venta: "venta",
            clienteId: findCliente.id,
            pago_usd,
            pago_pesos,
            pago_tarjeta,
            pago_transferencia,
            telefonoId: phoneForSale.id,
            sucursalId: sucursalId || phoneForSale.sucursalId,
        });

        //actualiza el estado del telefono a vendido
        phoneForSale.status = "vendido";
        await phoneForSale.save();

        //registra la relacion entre el cliente y el telefono
        await ClienteTelefono.create({
            clienteId: findCliente.id,
            telefonoId: phoneForSale.id,
        });

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
            details,
            pago_usd,
            pago_pesos,
            pago_tarjeta,
            pago_transferencia,
            telefonoId,
            fecha,
            sucursalId,
        } = req.body;

        //busca el telefono a vender
        const phoneForSale = await Telefono.findOne({
            where: { id: telefonoId },
        });
        if (!phoneForSale) {
            return res.status(404).json({ message: "Telefono no encontrado" });
        }
        if (phoneForSale.status === "vendido") {
            return res.status(400).json({ message: "Telefono ya vendido" });
        }

        //registrar el telefono entrante
        const newPhone = await Telefono.create({
            model,
            batery_status,
            color,
            purchase_price: price,
            price: 0,
            imei,
            storage_capacity,
            status: "deposito",
            details,
            sucursalId: sucursalId || phoneForSale.sucursalId,
            provider: "permuta",
            fechaCarga: fecha ? new Date(fecha) : new Date(),
        });

        let findCliente = await Cliente.findOne({
            where: { dni: dni_cliente },
        });
        if (!findCliente) {
            //registrar el cliente
            findCliente = await Cliente.create({
                nombre: nombre_cliente,
                telefono: telefono_cliente,
                dni: dni_cliente,
            });
        }

        //registra la venta
        const newVenta = await Venta.create({
            fecha: fecha ? new Date(fecha) : new Date(),
            vendedor: vendedor || "no especificado",
            tipo_venta: "permuta",
            clienteId: findCliente.id,
            pago_usd,
            pago_pesos,
            pago_tarjeta,
            pago_transferencia,
            telefonoId,
            sucursalId: sucursalId || phoneForSale.sucursalId,
            telefonoPermutado_model: newPhone.model,
            telefonoPermutado_imei: newPhone.imei,
            telefonoPermutado_cotizacion: newPhone.purchase_price,
        });

        //actualiza el estado del telefono a vendido
        phoneForSale.status = "vendido";
        await phoneForSale.save();

        //registra la relacion entre el cliente y el telefono
        await ClienteTelefono.create({
            clienteId: findCliente.id,
            telefonoId: phoneForSale.id,
        });

        res.status(201).json(newVenta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar permuta" });
    }
};

// Obtener todas las ventas, incluye paginacion y filtros para busqueda de ventas
export const getVentas = async (req, res) => {
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

        // Filtro por fechas
        if (fromDate || toDate) {
            whereConditions.fecha = {};

            if (fromDate && toDate) {
                // Escenario 1: Filtrar entre dos fechas
                whereConditions.fecha = {
                    [Op.between]: [
                        formatISO(parse(fromDate, "yyyy-MM-dd", new Date())),
                        formatISO(parse(toDate, "yyyy-MM-dd", new Date())),
                    ],
                };
            } else if (fromDate) {
                // Escenario 2: Filtrar desde una fecha en adelante
                whereConditions.fecha = {
                    [Op.gte]: new Date(fromDate),
                };
            } else if (toDate) {
                // Escenario 3: Filtrar hasta una fecha específica
                whereConditions.fecha = {
                    [Op.lte]: new Date(toDate),
                };
            }
        }

        // Filtro por modelo de teléfono
        if (model) {
            phoneWhereConditions.model = {
                [Op.iLike]: `%${model}%`,
            };
        }

        // Filtro por IMEI
        if (imei) {
            phoneWhereConditions.imei = {
                [Op.iLike]: `%${imei}%`,
            };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: ventas } = await Venta.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Telefono,
                    as: "telefono",
                    attributes: [
                        "id",
                        "model",
                        "imei",
                        "price",
                        "fechaCarga",
                        "storage_capacity",
                        "color",
                        "provider",
                    ],
                    where:
                        Object.keys(phoneWhereConditions).length > 0
                            ? phoneWhereConditions
                            : undefined,
                },
                {
                    model: Sucursal,
                    as: "sucursal",
                    attributes: ["id", "address"],
                },
                {
                    model: Cliente,
                    as: "cliente",
                    attributes: ["id", "nombre", "telefono", "dni"],
                },
            ],
            order: [["fecha", "DESC"]],
            limit: parseInt(limit),
            offset: offset,
        });

        res.status(200).json({
            ventas,
            totalVentas: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit)),
            hasNextPage: offset + parseInt(limit) < count,
            hasPrevPage: parseInt(page) > 1,
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
                {
                    model: Cliente,
                    as: "cliente",
                    attributes: ["id", "nombre", "telefono", "dni"],
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

export const getVentaByTelefonoId = async (req, res) => {
    try {
        const { id } = req.params;
        const venta = await Venta.findOne({
            where: { telefonoId: id },
            include: [
                {
                    model: Cliente,
                    as: "cliente",
                    attributes: ["id", "nombre", "telefono", "dni"],
                },
            ],
        });
        res.status(200).json(venta);
    } catch (error) {
        console.error(error);
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
        const cliente = await Cliente.findByPk(venta.clienteId);
        if (cliente) {
            await ClienteTelefono.destroy({
                where: { clienteId: cliente.id, telefonoId: venta.telefonoId },
            });
        }
        const telefono = await Telefono.findByPk(venta.telefonoId);
        if (telefono) {
            telefono.status = "disponible";
            await telefono.save();
        }

        await venta.destroy();
        res.status(200).json({ message: "Venta eliminada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar la venta", error });
    }
};

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
export const getVentasByNameSeller = async (req, res) => {
    try {
        const { nameSeller } = req.params;
        const ventas = await Venta.findAll({ where: { vendedor: nameSeller } });
        res.status(200).json(ventas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener las ventas por vendedor",
            error,
        });
    }
};

/////////////////////FUTURA IMPLEMENTACION//////////////////////////
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
