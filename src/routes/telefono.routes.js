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
    uploadPhonesFromExcel,
    getTelefonoByImeiModel,
} from "../controllers/telefono.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
import validacionTelefono from "../helpers/validations/telefono.validations.js";
import { uploadExcel } from "../middlewares/upload-file.js";

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
    "/list/sucursal/:idSucursal/all",
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

router.post(
    "/import",
    authTokenJwt,
    authRole(["admin"]),
    uploadExcel.single("file"),
    uploadPhonesFromExcel
);

router.get("/imei/:imei/model/:model", authTokenJwt, getTelefonoByImeiModel);

export default router;
