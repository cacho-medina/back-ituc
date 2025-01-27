import jwt from "jsonwebtoken";

const authTokenJwt = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res
                .status(403)
                .json({ message: "Invalid or expired token" });
        }
        req.user = user; // Guarda la información del usuario en `req.user`
        next();
    });
};

export default authTokenJwt;
