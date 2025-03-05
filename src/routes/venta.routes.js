import { Router } from "express";
import {
    createVenta,
    getVentas,
    getVentaById,
    deleteVenta,
    updateVenta,
    createPermuta,
    getVentasByNameSeller,
    getVentasBySucursal,
    getVentaByTelefonoId,
} from "../controllers/venta.controllers.js";
import authRole from "../middlewares/authRole.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
const router = Router();

router.post("/register", authTokenJwt, createVenta);
router.post("/permuta", authTokenJwt, createPermuta);
router.get("/", authTokenJwt, authRole(["admin"]), getVentas);
router.get("/sucursal/:idSucursal/list", authTokenJwt, getVentasBySucursal);
router.get("/:id", authTokenJwt, authRole(["admin"]), getVentaById);
router.get("/vendedor/:nameSeller", authTokenJwt, getVentasByNameSeller);
router.get("/telefono/:id", authTokenJwt, getVentaByTelefonoId);
//////////////////////////////////////////////////////////////////////////////
router.patch("/update/:id", authTokenJwt, authRole(["admin"]), updateVenta);
router.delete("/delete/:id", authTokenJwt, authRole(["admin"]), deleteVenta);

export default router;
