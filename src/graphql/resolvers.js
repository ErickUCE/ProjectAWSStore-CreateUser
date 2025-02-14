const axios = require('axios');
const bcrypt = require('bcryptjs'); // ✅ Importamos bcrypt para hashear la contraseña
const User = require('../models/user');

const resolvers = {
    Mutation: {
        createUser: async (_, { input }) => {
            try {
                console.log("📌 Creando usuario con datos:", input);

                // ✅ Hashear la contraseña antes de guardarla
                const hashedPassword = await bcrypt.hash(input.password_hash, 10);
                input.password_hash = hashedPassword;

                const user = await User.create(input);
                console.log("✅ Usuario creado exitosamente:", user.toJSON());

                const instances = [
                    'http://3.213.150.0:5006/sync-create',  //read
                    'http://13.216.141.108:5007/sync-create',  //update
                    'http://3.231.45.95:5008/sync-create'    // delete
                ];

                for (const instance of instances) {
                    try {
                        await axios.post(instance, user.toJSON());
                    } catch (error) {
                        console.error(`❌ Error notificando a ${instance}:`, error.message);
                    }
                }

                return user;
            } catch (error) {
                console.error('❌ Error creando usuario:', error);
                throw new Error('Failed to create user');
            }
        },
        validateUser: async (_, { email, password }) => {
            try {
                const user = await User.findOne({ where: { email } });
                if (!user) {
                    throw new Error('User not found');
                }

                // ✅ Comparar la contraseña ingresada con la almacenada
                const isPasswordValid = await bcrypt.compare(password, user.password_hash);
                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                console.log("✅ Usuario autenticado:", user.email);
                return user;
            } catch (error) {
                console.error('❌ Error validando usuario:', error);
                throw new Error('Authentication failed');
            }
        }
    }
};

module.exports = resolvers;
