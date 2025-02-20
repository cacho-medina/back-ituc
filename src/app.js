import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const app = express();

//Import routes
import userRoutes from "./routes/user.routes.js";
import sucursalRoutes from "./routes/sucursal.routes.js";
import telefonoRoutes from "./routes/telefono.routes.js";
import ventasRoutes from "./routes/venta.routes.js";
import garantiaRoutes from "./routes/garantia.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";

//////////////////////MIDDLEWARES////////////////////////////////////
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://app.ituc-cell.com",
            "https://cotizador.ituc.com.ar",
        ], // Permitir tu frontend
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Métodos permitidos
        credentials: true, // Si usas cookies o credenciales
    })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

//////////////ROUTES//////////////////////////////////////////////////
app.use(`${process.env.API_VERSION}/user`, userRoutes);
app.use(`${process.env.API_VERSION}/sucursal`, sucursalRoutes);
app.use(`${process.env.API_VERSION}/telefono`, telefonoRoutes);
app.use(`${process.env.API_VERSION}/venta`, ventasRoutes);
app.use(`${process.env.API_VERSION}/garantia`, garantiaRoutes);
app.use(`${process.env.API_VERSION}/cliente`, clienteRoutes);

export default app;
