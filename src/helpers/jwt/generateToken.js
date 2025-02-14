import jwt from "jsonwebtoken";

const generateJwt = (id, email, role) => {
    try {
        const payload = { id, email, role };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            //el token expira luego de 24 horas de ser creado
            expiresIn: "24h",
        });
        return token;
    } catch (error) {
        console.error("Error al generar el token:", error.message);
        throw new Error("No se pudo generar el token");
    }
};
export default generateJwt;
