const express = require('express');
const User = require('../models/user');
const authenticateToken = require('../middlewares/authMiddleware'); // ✅ Middleware para verificar token


const router = express.Router();
router.use(express.json()); // ✅ Middleware para JSON

// ✅ Endpoint para sincronizar creación de usuarios desde otros microservicios
router.post('/sync-create', async (req, res) => {
    console.log('📌 Solicitud recibida en /sync-create:', req.body);
    const { id, first_name, last_name, identification_number, email, password_hash, phone_number } = req.body;

    try {
        const existingUser = await User.findByPk(id);
        if (!existingUser) {
            await User.create({ id, first_name, last_name, identification_number, email, password_hash, phone_number });
            console.log(`✅ Usuario con ID ${id} sincronizado en la base de Crear Usuario`);
        } else {
            console.log(`⚠️ Usuario con ID ${id} ya existe en la base de Crear Usuario`);
        }

        res.status(200).send({ message: `Usuario con ID ${id} sincronizado correctamente en Crear Usuario` });
    } catch (error) {
        console.error('❌ Error sincronizando usuario en Crear Usuario:', error);
        res.status(500).send({ error: 'Failed to sync user creation' });
    }
});

// ✅ Endpoint para sincronizar actualización de usuarios
router.post('/sync-update', async (req, res) => {
    console.log('📌 Solicitud recibida en /sync-update:', req.body);
    const { id, first_name, last_name, identification_number, email, password_hash, phone_number } = req.body;

    try {
        const user = await User.findByPk(id);
        if (user) {
            await user.update({ first_name, last_name, identification_number, email, password_hash, phone_number });
            console.log(`✅ Usuario con ID ${id} actualizado en la base de Crear Usuario`);
        } else {
            console.log(`⚠️ Usuario con ID ${id} no encontrado en la base de Crear Usuario`);
        }

        res.status(200).send({ message: `Usuario con ID ${id} actualizado correctamente en Crear Usuario` });
    } catch (error) {
        console.error('❌ Error sincronizando actualización de usuario en Crear Usuario:', error);
        res.status(500).send({ error: 'Failed to sync user update' });
    }
});

// ✅ Endpoint para sincronizar eliminación de usuarios
router.post('/sync-delete', async (req, res) => {
    console.log('📌 Solicitud recibida en /sync-delete:', req.body);
    const { id } = req.body;

    try {
        const user = await User.findByPk(id);
        if (user) {
            await user.destroy();
            console.log(`✅ Usuario con ID ${id} eliminado en la base de Crear Usuario`);
        } else {
            console.log(`⚠️ Usuario con ID ${id} no encontrado en la base de Crear Usuario`);
        }

        res.status(200).send({ message: `Usuario con ID ${id} eliminado correctamente en Crear Usuario` });
    } catch (error) {
        console.error('❌ Error sincronizando eliminación de usuario en Crear Usuario:', error);
        res.status(500).send({ error: 'Failed to sync user delete' });
    }
});

// ✅ Endpoint para obtener todos los usuarios
router.get('/get-all-users', async (req, res) => {
    try {
        console.log("📌 Solicitando todos los usuarios de UserService...");
        const users = await User.findAll();
        console.table(users.map(u => ({ id: u.id, email: u.email }))); // ✅ Imprimir en tabla

        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error obteniendo usuarios:", error);
        res.status(500).json({ error: "Error obteniendo usuarios" });
    }
});

// ✅ Obtener solo los datos del usuario autenticado
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: [
                "id",
                "first_name",
                "last_name",
                "identification_number", // 🔥 Agregar este campo
                "email",
                "phone_number" // 🔥 Agregar este campo
            ] 
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('❌ Error obteniendo perfil:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


// ✅ Actualizar usuario autenticado
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const { first_name, last_name, phone_number } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        user.first_name = first_name || user.first_name;
        user.last_name = last_name || user.last_name;
        user.phone_number = phone_number || user.phone_number;
        await user.save();

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('❌ Error actualizando usuario:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ✅ Eliminar usuario autenticado
router.delete('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await user.destroy();
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error eliminando usuario:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


module.exports = router; // ✅ Exportar correctamente
