require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const coctelesRoutes = require("./routes/cocktails.routes");
const categoriesRoutes = require("./routes/categories.routes");
const authRoutes = require("./routes/auth.routes");
const ingredientRoutes = require("./routes/ingredients.routes");
const uploadRoutes = require("./routes/upload.routes");
const cors = require("cors");

// Esto habilita CORS para todos los dominios (en desarrollo está bien)
app.use(cors());

// Tu configuración actual
app.use(express.json());
// app.use('/api/...') etc

app.use("/cocktails", coctelesRoutes);
app.use("/categories", categoriesRoutes);
app.use("/auth", authRoutes);
app.use("/ingredient", ingredientRoutes);
app.use("/upload", uploadRoutes);

app.get("/bienvenido", (req, res) => {
	mensaje = "Bienvenido a Huerta";
	res.json({ mensaje });
});

app.listen(port, () => {
	console.log(`Servidor escuchando en http://localhost:${port}`);
	// Log de variables de entorno en desarrollo
	if (process.env.NODE_ENV !== "production") {
		console.log("Variables de entorno cargadas:");
		console.log(
			"AZURE_STORAGE_ACCOUNT_NAME:",
			process.env.AZURE_STORAGE_ACCOUNT_NAME ? "Configurado" : "No configurado"
		);
		console.log(
			"AZURE_STORAGE_CONNECTION_STRING:",
			process.env.AZURE_STORAGE_CONNECTION_STRING
				? "Configurado"
				: "No configurado"
		);
	}
});
