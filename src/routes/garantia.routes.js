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
} from "../controllers/garantia.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
const router = Router();

router.post("/register", authTokenJwt, createGarantia);
router.get("/", authTokenJwt, getGarantias);
router.get("/registro/:id", authTokenJwt, getGarantiaById);
router.get("/sucursal/:id", authTokenJwt, getGarantiasBySucursal);
router.get("/telefono/:id", authTokenJwt, getGarantiaByTelefonoId);
router.put("/update/:id", authTokenJwt, authRole(["admin"]), updateGarantia);
router.put("/status/:id", authTokenJwt, updateStatusGarantia);
router.delete("/delete/:id", authTokenJwt, authRole(["admin"]), deleteGarantia);

export default router;