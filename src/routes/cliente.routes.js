import { Router } from "express";
import {
    createCliente,
    getClientes,
    getClienteById,
    associateClienteTelefono,
} from "../controllers/cliente.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
const router = Router();

router.post("/new", authTokenJwt, createCliente);
router.get("/", authTokenJwt, getClientes);
router.get("/:id", authTokenJwt, getClienteById);
router.post("/associatePhone", authTokenJwt, associateClienteTelefono);

export default router;
