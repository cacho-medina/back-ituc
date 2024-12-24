import { check } from "express-validator";
import resultadoValidacion from "./resultado.validations.js";

const validacionUsuario = [
    check("name")
        .notEmpty()
        .withMessage("El nombre de usuario es obligatorio")
        .isLength({ min: 4 })
        .withMessage("El nombre de usuario debe tener al menos 4 caracteres"),
    check("email")
        .notEmpty()
        .withMessage("El correo del usuario es obligatorio")
        .matches(/.+\@.+\..+/)
        .withMessage("El correo electronico debe ser valido"),
    check("password").notEmpty().withMessage("la contraseña es obligatoria"),
    check("sucursalId").notEmpty().withMessage("La sucursal es obligatoria"),
    (req, res, next) => resultadoValidacion(req, res, next),
];

export default validacionUsuario;
