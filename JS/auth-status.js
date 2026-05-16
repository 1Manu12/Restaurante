import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from './firebase-config.js';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario conectado:", user.email);
  } else {
    console.log("No hay nadie conectado");
  }
});