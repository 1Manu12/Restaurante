import { auth, db } from './firebase-config.js'; 
import { 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const googleBtn = document.getElementById("googleLogin");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        const emailInput = document.getElementById("emailLogin");
        const passwordInput = document.getElementById("passLogin");

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            console.log("Intentando iniciar sesión con:", email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await verificarRolYRedirigir(userCredential.user);
        } catch (error) {
            console.error("Error capturado:", error.code);
            
            // Ahora la alerta aparecerá porque los IDs coinciden y el código no se rompe
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                alert("El correo o la contraseña son incorrectos. Verifica e intenta de nuevo.");
            } else if (error.code === 'auth/invalid-email') {
                alert("El formato del correo no es válido.");
            } else {
                alert("Error al intentar ingresar: " + error.message);
            }
        }
    });
}

// --- LOGIN CON GOOGLE ---
if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await setDoc(doc(db, "usuarios", user.uid), {
                nombre: user.displayName,
                correo: user.email,
                ultimoAcceso: new Date()
            }, { merge: true });

            await verificarRolYRedirigir(user);
        } catch (error) {
            console.error("Error Google:", error.code);
        }
    });
}

async function verificarRolYRedirigir(user) {
    try {
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));
        
        if (docSnap.exists()) {
            const datosUsuario = docSnap.data();
            const nombreUsuario = datosUsuario.nombre || "Usuario";
            if (datosUsuario.admin === true) {
                window.location.href = "admin.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            alert("¡Bienvenido!");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Error al obtener datos de usuario:", error);
        window.location.href = "index.html";
    }
}