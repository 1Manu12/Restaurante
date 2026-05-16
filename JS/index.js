import { auth, db } from './firebase-config.js'; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const docRef = doc(db, "usuarios", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                
                // Si es admin, lo mandamos a su panel
                if (userData.admin === true) {
                    window.location.href = "admin.html";
                } else {
                    // Si es usuario normal, solo ponemos su nombre en el sidebar
                    const sidebarNombre = document.getElementById("sidebar-nombre");
                    if (sidebarNombre) {
                        sidebarNombre.textContent = userData.nombre || user.email;
                    }
                }
            }
        } catch (error) {
            console.error("Error en index:", error);
        }
    } else {
        // Si no está logueado, al login
        window.location.href = "Iniciarseccion.html";
    }
});

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Solo redirige si realmente no hay nadie
        if (!window.location.pathname.includes("Iniciarseccion.html")) {
            window.location.href = "Iniciarseccion.html";
        }
    } else {
        console.log("Usuario detectado en Index, sesión estable.");
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));
        if (docSnap.exists()) {
            document.getElementById("nombre-saludo").textContent = `Hola, ${docSnap.data().nombre}`;
        }
    }
});