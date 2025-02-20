import { Router } from "express";
import {
    createGarantia,
    getGarantias,
    getGarantiaById,
    updateGarantia,
    deleteGarantia,
    updateStatusGarantia,
    getGarantiasBySucursal,
    getGarantiaByTelefonoId,
    updateResolucionGarantia,
    registerTelefonoCliente,
} from "../controllers/garantia.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
const router = Router();

router.post("/register", authTokenJwt, createGarantia);
router.get("/", authTokenJwt, getGarantias);
router.get("/registro/:id", authTokenJwt, getGarantiaById);
router.get("/sucursal/:id/list", authTokenJwt, getGarantiasBySucursal);
router.get("/telefono/:id", authTokenJwt, getGarantiaByTelefonoId);
router.put("/update/:id", authTokenJwt, updateGarantia);
router.put("/status/:id", authTokenJwt, updateStatusGarantia);
router.delete("/delete/:id", authTokenJwt, authRole(["admin"]), deleteGarantia);
router.put("/resolucion/:id", authTokenJwt, updateResolucionGarantia);
router.post("/registerTelefonoCliente", authTokenJwt, registerTelefonoCliente);

export default router;
