import { Router } from "express";
import {
    createTelefono,
    getTelefonos,
    getTelefonoById,
    updateTelefono,
    changeTelefonoStatus,
    deleteTelefono,
} from "../controllers/telefono.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
import validacionTelefono from "../helpers/validations/telefono.validations.js";

const router = Router();

router.post("/create", authTokenJwt, validacionTelefono, createTelefono);
router.get("/list", authTokenJwt, getTelefonos);
router.get("/:id", authTokenJwt, getTelefonoById);
router.put("/update/:id", authTokenJwt, updateTelefono);
router.put("/change-status/:id", authTokenJwt, changeTelefonoStatus);
router.delete(
    "/delete/:id",
    authTokenJwt,
    authRole(["superAdmin"]),
    deleteTelefono
);

export default router;
