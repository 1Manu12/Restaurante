import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("Script cargó correctamente"); /* ← después de los imports */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().admin === true) {
      // 1. Verificamos que el elemento exista antes de usar textContent
      const sidebarNombre = document.getElementById("sidebar-nombre");
      if (sidebarNombre) {
        sidebarNombre.textContent = user.displayName || user.email;
      }
    } else {
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "Iniciarseccion.html";
  }
});

const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "Iniciarseccion.html";
    });
  });
}

const googleBtn = document.getElementById("googleLogin");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("UID del usuario logueado:", user.uid);

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Datos encontrados en Firestore:", data);

        if (data.admin === true) {
          console.log("¡Es admin! Redirigiendo...");
          window.location.href = "admin.html";
        } else {
          console.log("No es admin, campo admin es:", data.admin);
          window.location.href = "index.html";
        }
      } else {
        console.error("No existe un documento en 'usuarios' con ese UID");
        window.location.href = "index.html";
      }
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error: " + error.code);
    }
  });
}
