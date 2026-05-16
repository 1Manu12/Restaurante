import { auth, db } from './firebase-config.js'; 
import { createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Usamos el ID de tu formulario: registerForm
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Usamos tus IDs EXACTOS: nombreReg, emailReg, passReg, passConfirmReg
        const nombre = document.getElementById("nombreReg").value.trim();
        const email = document.getElementById("emailReg").value.trim();
        const password = document.getElementById("passReg").value;
        const confirmPassword = document.getElementById("passConfirmReg").value;

        // Validación de contraseñas
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
            console.log("Intentando crear cuenta para:", email);
            
            // 1. Crear usuario en Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Guardar en Firestore
            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: nombre,
                correo: email,
                admin: false, // Por defecto no es admin
                fechaCreacion: new Date()
            });

            alert("¡Registro exitoso!");
            window.location.href = "index.html";

        } catch (error) {
            console.error("Error en el registro:", error.code);
            
            // Alertas específicas para que sepas qué falló
            if (error.code === 'auth/email-already-in-use') {
                alert("Este correo ya está registrado.");
            } else if (error.code === 'auth/invalid-email') {
                alert("El formato del correo es incorrecto.");
            } else if (error.code === 'auth/weak-password') {
                alert("La contraseña es muy débil (mínimo 6 caracteres).");
            } else {
                alert("Error: " + error.message);
            }
        }
    });
}

// OBSERVADOR PASIVO: 
// No pongas redirecciones aquí que te saquen de la página de registro.
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuario detectado, pero permitimos que se quede en esta página.");
    }
});