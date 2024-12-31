import { Router } from "express";
import {
    login,
    registerUser,
    changeUserStatus,
    updateUser,
    deleteUser,
    getUsers,
    getUserById,
} from "../controllers/user.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
import validacionUsuario from "../helpers/validations/user.validations.js";

const router = Router();

router.get("/list", authTokenJwt, authRole(["admin"]), getUsers);
router.get("/:id", authTokenJwt, authRole(["admin"]), getUserById);
router.post("/login", login);
router.post("/register", validacionUsuario, registerUser);
router.post("/register-admin", registerUser);
router.put("/update/:id", authTokenJwt, authRole(["admin"]), updateUser);
router.put(
    "/change-status/:id",
    authTokenJwt,
    authRole(["admin"]),
    changeUserStatus
);
router.delete("/delete/:id", authTokenJwt, authRole(["admin"]), deleteUser);

export default router;
