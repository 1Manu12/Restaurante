import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const formulario = document.querySelector('.formulario');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const celular = document.getElementById('celular').value;
    const mensaje = document.getElementById('mensaje').value;

    try {
        await addDoc(collection(db, "mensajes"), {
            nombre,
            apellido,
            email,
            celular,
            mensaje,
            fecha: serverTimestamp()
        });
        alert("¡Mensaje enviado con éxito!");
        formulario.reset();
    } catch (error) {
        console.error("Error al enviar:", error);
    }
});