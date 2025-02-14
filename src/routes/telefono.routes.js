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
    getTelefonosDisponiblesYDepositoBySucursal,
    getTelefonosByImei,
} from "../controllers/telefono.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
import validacionTelefono from "../helpers/validations/telefono.validations.js";

const router = Router();

router.post("/create", authTokenJwt, validacionTelefono, createTelefono);
router.get("/list", authTokenJwt, getTelefonos);
router.get("/list/sucursal/:id", authTokenJwt, getTelefonosBySucursal);
router.get("/:id", authTokenJwt, getTelefonoById);
router.get("/list/disponibles", getTelefonosDisponibles);
router.get(
    "/list/disponibles/sucursal/:id",
    authTokenJwt,
    getTelefonosDisponiblesBySucursal
);
router.get("/list/garantia", authTokenJwt, getTelefonosEnGarantia);
router.get(
    "/list/sucursal/:id/disponibles-deposito",
    authTokenJwt,
    getTelefonosDisponiblesYDepositoBySucursal
);
router.get("/imei/:imei", authTokenJwt, getTelefonosByImei);
router.put("/update/:id", authTokenJwt, authRole(["admin"]), updateTelefono);
router.patch(
    "/change-status/:id",
    authTokenJwt,
    authRole(["admin"]),
    changeTelefonoStatus
);
router.delete("/delete/:id", authTokenJwt, authRole(["admin"]), deleteTelefono);

export default router;
