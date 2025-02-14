import { Router } from "express";
import {
    login,
    registerUser,
    changeUserStatus,
    updateUser,
    deleteUser,
    getUsers,
    getUserById,
    logout,
} from "../controllers/user.controllers.js";
import authTokenJwt from "../middlewares/authTokenJwt.js";
import authRole from "../middlewares/authRole.js";
import validacionUsuario from "../helpers/validations/user.validations.js";

const router = Router();

router.get("/list", authTokenJwt, authRole(["admin"]), getUsers);
router.get("/:id", authTokenJwt, authRole(["admin"]), getUserById);
router.post("/login", login);
router.post("/logout", authTokenJwt, logout);
router.post("/register", validacionUsuario, registerUser);
router.post("/register-admin", registerUser);
router.put("/update/:id", authTokenJwt, authRole(["admin"]), updateUser);
router.patch(
    "/change-status/:id",
    authTokenJwt,
    authRole(["admin"]),
    changeUserStatus
);
router.delete("/delete/:id", authTokenJwt, authRole(["admin"]), deleteUser);

export default router;
