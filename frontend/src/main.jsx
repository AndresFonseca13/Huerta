import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./i18n/config"; // Configuración de i18n
import translationService from "./services/translationService";

// Hacer el servicio de traducción accesible globalmente para depuración
window.translationService = translationService;

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>
);
