import { Router } from "express";
import {
    createVentas,
    getVentas,
    getVentaById,
    deleteVenta,
    updateVenta,
} from "../controllers/venta.controllers.js";
import authRole from "../middlewares/authRole.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
const router = Router();

router.post("/register", authTokenJwt, createVentas);
router.get("/", authTokenJwt, getVentas);
router.get("/:id", authTokenJwt, getVentaById);
router.put("/update/:id", authTokenJwt, authRole(["superAdmin"]), updateVenta);
router.delete(
    "/delete/:id",
    authTokenJwt,
    authRole(["superAdmin"]),
    deleteVenta
);

export default router;
