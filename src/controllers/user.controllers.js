import User from "../models/User.js";
import Sucursal from "../models/Sucursal.js";
import bcrypt from "bcrypt";
import generateToken from "../helpers/jwt/generateToken.js";
import "../models/relations.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar si el usuario existe
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res
                .status(401)
                .json({ message: "Credenciales incorrectas" });
        }

        // Validar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ message: "Credenciales incorrectas" });
        }

        // Validar si el usuario está activo
        if (!user.isActive) {
            return res.status(401).json({ message: "Usuario suspendido" });
        }

        // Generar token JWT
        const token = generateToken(user.id, user.email, user.role);

        //actualmente se esta enviando el token dentro del cuerpo de la respuesta
        res.status(200).json({
            message: `User logged in as ${user.role}!`,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                telefono: user.telefono,
                sucursal: user.sucursalId,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error at login user" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken");
        res.status(200).json({ message: "User logged out" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error at logout user" });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { email, password, name, telefono, role, sucursalId } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Encriptar la contraseña
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Crear nuevo usuario
        const user = await User.create({
            name,
            email,
            telefono,
            password: hashedPassword,
            role,
            sucursalId: sucursalId || null,
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating user" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, telefono, sucursalId } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Actualizar información del usuario
        user.name = name || user.name;
        user.email = email || user.email;
        user.telefono = telefono || user.telefono;
        user.password = password || user.password;
        user.sucursalId = sucursalId || user.sucursalId;

        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user information" });
    }
};
export const changeUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res
                .status(404)
                .json({ message: "No se encontro al usuario" });
        }

        // Cambiar estado activo del usuario
        user.isActive = isActive;
        await user.save();

        res.status(200).json({
            message: `User status updated successfully`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user status" });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        //eliminar usuario
        await user.destroy();
        res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting user" });
    }
};

export const getUsers = async (req, res) => {
    /* const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit; */

    try {
        const users = await User.findAll();

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Users not found" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] },
            include: {
                model: Sucursal,
                as: "sucursal",
                attributes: ["address"],
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving user" });
    }
};

export const getSellers = async (req, res) => {};
