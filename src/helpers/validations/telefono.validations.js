import { check } from "express-validator";
import resultadoValidacion from "./resultado.validations.js";

const validacionTelefono = [
    check("model")
        .notEmpty()
        .withMessage("El modelo del dispositivo es obligatorio"),
    check("batery_status")
        .notEmpty()
        .withMessage("El estado de la batería es obligatorio"),
    check("color").notEmpty().withMessage("El color es obligatorio"),
    check("imei")
        .isString()
        .withMessage("El IMEI debe ser una cadena de caracteres")
        .isLength({ min: 15, max: 15 })
        .withMessage("El IMEI debe tener 15 dígitos"),
    check("price")
        .notEmpty()
        .withMessage("El precio es obligatorio")
        .isNumeric()
        .withMessage("El precio debe ser un valor numerico"),
    check("storage_capacity")
        .notEmpty()
        .withMessage("La capacidad de almacenamiento es obligatorio"),
    check("status")
        .notEmpty()
        .withMessage("El estado del dispositivo es obligatorio"),
    (req, res, next) => resultadoValidacion(req, res, next),
];

export const validatePhoneData = (phoneData) => {
    const {
        model,
        batery_status,
        color,
        price,
        imei,
        provider,
        storage_capacity,
    } = phoneData;

    // Validaciones básicas
    if (!model) return "El modelo es requerido";
    if (!imei) return "El IMEI es requerido";
    if (!provider) return "El proveedor es requerido";

    // Validar formato IMEI (15 dígitos)
    if (!/^\d{15}$/.test(imei)) {
        return "Formato de IMEI inválido";
    }

    // Validar precio
    if (isNaN(price) || price <= 0) {
        return "El precio debe ser un número mayor a 0";
    }

    // Validar batería
    if (batery_status === undefined || batery_status === null) {
        return "El estado de la batería es requerido";
    }
    // Validar que sea un número entre 0 y 100
    if (
        typeof batery_status !== "number" ||
        batery_status < 0 ||
        batery_status > 100
    ) {
        return "El estado de la batería debe ser un número entre 0 y 100";
    }

    return null;
};

export default validacionTelefono;
