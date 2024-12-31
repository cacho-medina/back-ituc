import { Router } from "express";
import {
    createTelefono,
    getTelefonos,
    getTelefonoById,
    updateTelefono,
    changeTelefonoStatus,
    deleteTelefono,
    getTelefonosDisponibles,
    getTelefonosDisponiblesBySucursal,
    getTelefonosEnGarantia,
    getTelefonosBySucursal,
} from "../controllers/telefono.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
import validacionTelefono from "../helpers/validations/telefono.validations.js";

const router = Router();

router.post("/create", authTokenJwt, validacionTelefono, createTelefono);
router.get("/list", authTokenJwt, getTelefonos);
router.get("/list/sucursal/:id", authTokenJwt, getTelefonosBySucursal);
router.get("/:id", authTokenJwt, getTelefonoById);
router.get("/list/disponibles", authTokenJwt, getTelefonosDisponibles);
router.get(
    "/list/disponibles/sucursal/:id",
    authTokenJwt,
    getTelefonosDisponiblesBySucursal
);
router.get("/list/garantia", authTokenJwt, getTelefonosEnGarantia);
router.put("/update/:id", authTokenJwt, updateTelefono);
router.put("/change-status/:id", authTokenJwt, changeTelefonoStatus);
router.delete("/delete/:id", authTokenJwt, authRole(["admin"]), deleteTelefono);

export default router;
