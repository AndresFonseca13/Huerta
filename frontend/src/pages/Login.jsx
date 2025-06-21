import {useState} from "react";
import {loginUser} from "../services/authService.js";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await loginUser(username, password);
            console.log("Login successful:", res);
            navigate("/");
        }catch (error) {
            console.error("Login failed:", error);
            alert("Error al iniciar sesión. Por favor, verifica tus credenciales.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <form onSubmit={handleSubmit} className="p-15 rounded w-full max-w-sm">
                <h2 className="text-3xl font-bold mb-6 text-center text-green-950 italic">Iniciar Sesión</h2>

                <div className="mb-4 text-left">
                    <label className="block text-gray-700 mb-2 text-xl">Usuario</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border rounded bg-green-900 text-white"
                        required
                    />
                </div>

                <div className="mb-6 text-left">
                    <label className="block text-gray-700 mb-2 text-xl">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded bg-green-900 text-white"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
                >
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
};

export default Login;