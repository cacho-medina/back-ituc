import { Router } from "express";
import {
    createVentas,
    getVentas,
    getVentaById,
    deleteVenta,
    updateVenta,
    createPermuta,
} from "../controllers/venta.controllers.js";
import authRole from "../middlewares/authRole.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
const router = Router();

router.post("/register", authTokenJwt, createVentas);
router.post("/permuta", authTokenJwt, createPermuta);
router.get("/", authTokenJwt, authRole(["admin"]), getVentas);
router.get("/:id", authTokenJwt, authRole(["admin"]), getVentaById);
//////////////////////////////////////////////////////////////////////////////
router.put("/update/:id", authTokenJwt, authRole(["admin"]), updateVenta);
router.delete("/delete/:id", authTokenJwt, authRole(["admin"]), deleteVenta);

export default router;
