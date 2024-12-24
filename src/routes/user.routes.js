import { Router } from "express";
import {
    login,
    registerUserSeller,
    registerUserAdmin,
    registerUserSuperAdmin,
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

router.get("/list", authTokenJwt, authRole(["superAdmin"]), getUsers);
router.get("/:id", authTokenJwt, authRole(["superAdmin"]), getUserById);
router.post("/login", login);
router.post("/register-s", validacionUsuario, registerUserSeller);
router.post("/register-a", validacionUsuario, registerUserAdmin);
router.post("/register-sa", registerUserSuperAdmin);
router.put("/update/:id", authTokenJwt, updateUser);
router.put(
    "/change-status/:id",
    authTokenJwt,
    authRole(["superAdmin"]),
    changeUserStatus
);
router.delete(
    "/delete/:id",
    authTokenJwt,
    authRole(["superAdmin"]),
    deleteUser
);

export default router;
