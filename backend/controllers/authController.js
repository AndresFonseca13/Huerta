const signupService = require('../services/auth/signupService');
const loginService = require('../services/auth/loginService');

const signup = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await signupService(username, password);
        res.status(201).json({ mensaje: 'Usuario creado exitosamente', user });
    } catch (err) {
        res.status(400).json({ mensaje: err.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const loginData = await loginService(username, password);
        res.status(200).json({ mensaje: 'Login exitoso', ...loginData });
    } catch (err) {
        res.status(401).json({ mensaje: err.message });
    }
};

module.exports = {
    signup,
    login
};