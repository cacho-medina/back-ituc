import { check } from "express-validator";
import resultadoValidacion from "./resultado.validations.js";

const validacionSucursal = [
    check("address")
        .notEmpty()
        .withMessage("La direccion es necesaria")
        .isLength({ min: 3 })
        .withMessage("La direccion debe tener al menos 3 caracteres"),
    (req, res, next) => resultadoValidacion(req, res, next),
];

export default validacionSucursal;
