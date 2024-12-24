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

export default validacionTelefono;
