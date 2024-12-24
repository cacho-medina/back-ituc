import { Router } from "express";
import {
    createSucursal,
    getSucursales,
    getSucursalesById,
    updateSucursales,
    deleteSucursales,
} from "../controllers/sucursal.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
import validacionSucursal from "../helpers/validations/sucursal.validations.js";
const router = Router();

router.get("/", authTokenJwt, getSucursales);
router.get("/:id", authTokenJwt, getSucursalesById);
router.post(
    "/create",
    authTokenJwt,
    authRole(["superAdmin"]),
    validacionSucursal,
    createSucursal
);
router.put(
    "/update/:id",
    authTokenJwt,
    authRole(["superAdmin"]),
    validacionSucursal,
    updateSucursales
);
router.delete(
    "/delete/:id",
    authTokenJwt,
    authRole(["superAdmin"]),
    deleteSucursales
);

export default router;
