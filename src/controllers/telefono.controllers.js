import Telefono from "../models/Telefono.js";
import Sucursal from "../models/Sucursal.js";
import "../models/relations.js";
import Cliente from "../models/Clientes.js";
import ClienteTelefono from "../models/ClienteTelefono.js";
import { formatISO, parse } from "date-fns";
import { Op } from "sequelize";
import ExcelJS from "exceljs";
import fs from "fs";
import Venta from "../models/Venta.js";

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
            fechaCarga: fechaCarga ? new Date(fechaCarga) : new Date(),
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
            sort,
            sucursalId,
            page = 1,
            limit = 20,
        } = req.query;

        // Construir objeto de filtros
        const whereConditions = {
            status: {
                [Op.not]: "vendido",
            },
        };

        // Configuración del ordenamiento
        let order = [];

        switch (sort) {
            case "date_desc":
                order = [["fechaCarga", "DESC"]];
                break;
            case "date_asc":
                order = [["fechaCarga", "ASC"]];
                break;
            case "name_desc":
                order = [["model", "DESC"]];
                break;
            case "name_asc":
                order = [["model", "ASC"]];
                break;
            case "price_desc":
                order = [["price", "DESC"]];
                break;
            case "price_asc":
                order = [["price", "ASC"]];
                break;
            default:
                order = [["fechaCarga", "DESC"]];
                break;
        }

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

        // Filtro por sucursal
        if (sucursalId) {
            whereConditions.sucursalId = sucursalId;
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
            order: order,
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
            sort,
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

export const getTelefonoByImeiModel = async (req, res) => {
    const { imei, model } = req.params;

    try {
        const telefono = await Telefono.findOne({
            where: {
                model: {
                    [Op.iLike]: `%${model}%`,
                },
                imei: {
                    [Op.like]: `%${imei}`, // Busca IMEI que termine con los dígitos proporcionados
                },
            },
        });
        if (!telefono) {
            return res.status(404).json({ message: "Telefono no encontrado" });
        }
        if (telefono.status !== "vendido") {
            return res
                .status(400)
                .json({ message: `El telefono esta ${telefono.status}` });
        }
        const infoVenta = await Venta.findOne({
            where: { telefonoId: telefono.id },
            include: [
                {
                    model: Cliente,
                    as: "cliente",
                    attributes: ["nombre", "telefono", "dni"],
                },
            ],
        });
        if (!infoVenta) {
            return res
                .status(404)
                .json({ message: "El telefono no tiene una venta asociada" });
        }
        res.status(200).json({
            telefono: {
                id: telefono.id,
                imei: telefono.imei,
                model: telefono.model,
                price: telefono.price,
                sucursalId: telefono.sucursalId,
            },
            infoVenta: {
                cliente: infoVenta.cliente,
                fechaVenta: infoVenta.fecha,
                tipo: infoVenta.tipo_venta,
                vendedor: infoVenta.vendedor,
                pago: {
                    usd: infoVenta.pago_usd,
                    pesos: infoVenta.pago_pesos,
                    tarjeta: infoVenta.pago_tarjeta,
                    transferencia: infoVenta.pago_transferencia,
                },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el telefono" });
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
        const { idSucursal } = req.params;

        const {
            fromDate,
            toDate,
            model,
            imei,
            minPrecio,
            maxPrecio,
            status,
            sort,
            page = 1,
            limit = 20,
        } = req.query;

        // Construir objeto de filtros
        const whereConditions = {
            sucursalId: idSucursal,
            status: {
                [Op.not]: "vendido",
            },
        };

        // Configuración del ordenamiento
        let order = [];

        switch (sort) {
            case "date_desc":
                order = [["fechaCarga", "DESC"]];
                break;
            case "date_asc":
                order = [["fechaCarga", "ASC"]];
                break;
            case "name_desc":
                order = [["model", "DESC"]];
                break;
            case "name_asc":
                order = [["model", "ASC"]];
                break;
            case "price_desc":
                order = [["price", "DESC"]];
                break;
            case "price_asc":
                order = [["price", "ASC"]];
                break;
            default:
                order = [["fechaCarga", "DESC"]];
                break;
        }

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

        // Filtro por status
        if (status) {
            whereConditions.status = status;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: telefonos } = await Telefono.findAndCountAll({
            where: whereConditions,
            order: order,
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
            sort,
        });
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
        telefono.fechaCarga = fechaCarga || telefono.fechaCarga;

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
        await ClienteTelefono.destroy({ where: { telefonoId: id } });
        res.status(200).json({ message: "Teléfono eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al eliminar el teléfono",
            error,
        });
    }
};

export const uploadPhonesFromExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ message: "No se ha subido ningún archivo" });
        }

        const { sucursalId } = req.body;

        // Verificar si la sucursal existe
        const sucursal = await Sucursal.findByPk(sucursalId);
        if (!sucursal) {
            return res.status(400).json({ message: "La sucursal no existe" });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const worksheet = workbook.worksheets[0];

        const headers = [];
        worksheet.getRow(1).eachCell((cell) => {
            const headerValue =
                cell.value?.toString().toLowerCase().trim() || "";

            headers.push(headerValue);
        });

        const data = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                if (header) {
                    rowData[header] =
                        cell.value.toString().trim() === "" ? null : cell.value;
                }
            });

            data.push(rowData);
        });

        if (!data.length) {
            return res.status(400).json({ message: "El excel está vacio" });
        }

        const expectedColumns = [
            "modelo",
            "bateria",
            "color",
            "precio",
            "imei",
            "proveedor",
            "estado",
            "capacidad",
        ];

        // Convertimos las columnas del archivo a minúsculas para la comparación
        const columnasArchivo = headers.map((col) => col.toLowerCase().trim());

        // Verificamos las columnas faltantes
        const columnasFaltantes = expectedColumns.filter(
            (col) => !columnasArchivo.includes(col)
        );

        if (columnasFaltantes.length > 0) {
            return res.status(400).json({
                message: `El archivo no contiene las columnas obligatorias: ${columnasFaltantes.join(
                    ", "
                )}`,
            });
        }

        //se parsean los datos
        const products = data
            .map((row) => {
                const model = row["modelo"];
                const batery_status = row["bateria"];
                const color = row["color"];
                const price = row["precio"];
                const imei = row["imei"]?.toString();
                const provider = row["proveedor"];
                const status = row["estado"];
                const storage_capacity = row["capacidad"];
                const reference = row["referencias"];
                const details = row["detalles"];
                const fechaCarga = row["fecha de ingreso"];
                //se valida que los datos sean correctos

                if (
                    !model ||
                    isNaN(batery_status) ||
                    !color ||
                    isNaN(price) ||
                    !imei ||
                    !provider ||
                    !status ||
                    isNaN(storage_capacity)
                ) {
                    return null;
                }

                return {
                    model,
                    batery_status,
                    color,
                    price,
                    imei,
                    provider,
                    status,
                    storage_capacity,
                    reference,
                    details,
                    fechaCarga,
                };
            })
            .filter((product) => product !== null); //se filtra los productos que no son correctos

        if (!products.length) {
            return res
                .status(400)
                .json({ message: "No hay productos válidos para importar" });
        }

        //se eliminan los productos importados duplicados
        const productosSinDuplicar = products.filter(
            (producto, index, self) =>
                index ===
                self.findIndex(
                    (p) => p.imei.toLowerCase() === producto.imei.toLowerCase()
                )
        );

        // Verificar IMEI duplicados en la base de datos
        const imeisList = productosSinDuplicar.map((product) => product.imei);
        const existingPhones = await Telefono.findAll({
            where: {
                imei: {
                    [Op.in]: imeisList,
                },
            },
            attributes: ["imei"],
        });

        if (existingPhones.length > 0) {
            const duplicatedImeis = existingPhones.map((phone) => phone.imei);
            return res.status(400).json({
                message:
                    "Hay imeis de telefonos que ya existen en la base de datos",
                duplicados: duplicatedImeis,
            });
        }

        const productsCreated = await Telefono.bulkCreate(
            productosSinDuplicar.map((product) => ({
                model: product.model,
                batery_status: product.batery_status,
                color: product.color,
                price: product.price,
                imei: product.imei,
                provider: product.provider,
                storage_capacity: product.storage_capacity,
                references: product.reference || null,
                details: product.details || null,
                status: product.status.toLowerCase(),
                fechaCarga: product.fechaCarga || new Date(),
                sucursalId: sucursalId || null,
            })),
            {
                validate: true,
                returning: true,
            }
        );

        return res.status(201).json({
            message: "Teléfonos importados correctamente",
            cantidad: productsCreated.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al procesar el archivo Excel",
            error,
        });
    } finally {
        // Limpiar el archivo temporal
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
    }
};
