import Telefono from "../models/Telefono.js";
import Sucursal from "../models/Sucursal.js";
import "../models/relations.js";
import Cliente from "../models/Clientes.js";
import ClienteTelefono from "../models/ClienteTelefono.js";
import { formatISO, parse } from "date-fns";
import { Op } from "sequelize";

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
            fechaCarga,
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
            sucursalId: sucursalId || null,
            fechaCarga: formatISO(parse(fechaCarga, "yyyy-MM-dd", new Date())),
        });

        res.status(201).json(newTelefono);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el teléfono", error });
    }
};

// Obtener todos los teléfonos
export const getTelefonos = async (req, res) => {
    try {
        const {
            fromDate,
            toDate,
            model,
            imei,
            minPrecio,
            maxPrecio,
            provider,
            status,
            page = 1,
            limit = 25,
        } = req.query;

        // Construir objeto de filtros
        const whereConditions = {};

        // Filtro por fechas de carga
        if (fromDate || toDate) {
            whereConditions.fechaCarga = {};

            if (fromDate && toDate) {
                whereConditions.fechaCarga = {
                    [Op.between]: [
                        formatISO(parse(fromDate, "yyyy-MM-dd", new Date())),
                        formatISO(parse(toDate, "yyyy-MM-dd", new Date())),
                    ],
                };
            } else if (fromDate) {
                whereConditions.fechaCarga = {
                    [Op.gte]: formatISO(
                        parse(fromDate, "yyyy-MM-dd", new Date())
                    ),
                };
            } else if (toDate) {
                whereConditions.fechaCarga = {
                    [Op.lte]: formatISO(
                        parse(toDate, "yyyy-MM-dd", new Date())
                    ),
                };
            }
        }

        // Filtro por modelo
        if (model) {
            whereConditions.model = {
                [Op.iLike]: `%${model}%`,
            };
        }

        // Filtro por IMEI
        if (imei) {
            whereConditions.imei = {
                [Op.iLike]: `%${imei}%`,
            };
        }

        // Filtro por precio
        if (minPrecio || maxPrecio) {
            whereConditions.price = {};
            if (minPrecio) {
                whereConditions.price[Op.gte] = parseFloat(minPrecio);
            }
            if (maxPrecio) {
                whereConditions.price[Op.lte] = parseFloat(maxPrecio);
            }
        }

        // Filtro por proveedor
        if (provider) {
            whereConditions.provider = provider;
        }

        // Filtro por status
        if (status) {
            whereConditions.status = status;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: telefonos } = await Telefono.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Sucursal,
                    as: "sucursal",
                    attributes: ["id", "address"],
                },
            ],
            order: [["fechaCarga", "DESC"]],
            limit: parseInt(limit),
            offset: offset,
        });

        res.status(200).json({
            telefonos,
            totalTelefonos: count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit)),
            hasNextPage: offset + parseInt(limit) < count,
            hasPrevPage: parseInt(page) > 1,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los teléfonos",
            error,
        });
    }
};

export const getTelefonosBySucursal = async (req, res) => {
    try {
        const { sucursalId } = req.params;
        const telefonos = await Telefono.findAll({ where: { sucursalId } });
        res.status(200).json(telefonos);
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
            include: [
                {
                    model: Sucursal,
                    as: "sucursal",
                    attributes: ["id", "address"],
                },
                {
                    model: Cliente,
                    as: "clientes",
                    attributes: ["id", "nombre", "telefono", "dni"],
                },
            ],
        });

        res.status(200).json(telefono);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener el teléfono",
            error,
        });
    }
};

export const getTelefonosByImei = async (req, res) => {
    try {
        const { imei } = req.params;
        const telefono = await Telefono.findOne({ where: { imei } });
        if (!telefono) {
            return res.status(404).json({ message: "Teléfono no encontrado" });
        }
        const clienteAsociado = await ClienteTelefono.findOne({
            where: { telefonoId: telefono.id },
        });
        if (!clienteAsociado) {
            return res
                .status(404)
                .json({ message: "El telefono no tiene cliente asociado" });
        }
        const cliente = await Cliente.findByPk(clienteAsociado.clienteId);

        res.status(200).json({ telefono, cliente });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el teléfono" });
    }
};

// Obtener todos los teléfonos disponibles
export const getTelefonosDisponibles = async (req, res) => {
    try {
        const telefonos = await Telefono.findAll({
            where: { status: "disponible" },
        });
        res.status(200).json(telefonos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los teléfonos disponibles",
            error,
        });
    }
};

//Obtener todos los telefonos disponibles por sucursal
export const getTelefonosDisponiblesBySucursal = async (req, res) => {
    try {
        const { sucursalId } = req.params;
        const telefonos = await Telefono.findAll({
            where: { sucursalId, status: "disponible" },
        });
        res.status(200).json(telefonos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los teléfonos disponibles",
            error,
        });
    }
};

// Obtener todos los teléfonos en garantia
export const getTelefonosEnGarantia = async (req, res) => {
    try {
        const telefonos = await Telefono.findAll({
            where: { status: "garantia" },
        });
        res.status(200).json(telefonos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los teléfonos en garantia",
            error,
        });
    }
};

export const getTelefonosDisponiblesYDepositoBySucursal = async (req, res) => {
    try {
        const { id } = req.params;
        //obtener los teléfonos disponibles de la sucursal
        const telefonos = await Telefono.findAll({
            where: { sucursalId: id, status: ["disponible"] },
        });
        //obtener los teléfonos en el deposito
        const telefonosDeposito = await Telefono.findAll({
            where: { status: ["deposito"] },
        });

        //si hay teléfonos en el deposito, retornar los teléfonos disponibles y los teléfonos en el deposito
        res.status(200).json([...telefonos, ...telefonosDeposito]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener los teléfonos disponibles y depositos",
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
            fechaCarga,
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
        telefono.fechaCarga =
            formatISO(parse(fechaCarga, "yyyy-MM-dd", new Date())) ||
            telefono.fechaCarga;

        await telefono.save();

        res.status(200).json(telefono);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al actualizar el teléfono",
            error,
        });
    }
};

// Cambiar el estado de un teléfono
//funcion para actualizar el estado de un teléfono luego de que se haya vendido, puesto en garantia, etc
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
