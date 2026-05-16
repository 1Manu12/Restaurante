import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- 1. CARGAR DATOS GENERALES ---
async function cargarMetricas() {
    try {
        const snapUsers = await getDocs(collection(db, "usuarios"));
        const snapMensajes = await getDocs(collection(db, "mensajes"));

        if(document.getElementById("count-usuarios")) document.getElementById("count-usuarios").textContent = snapUsers.size;
        if(document.getElementById("count-correos")) document.getElementById("count-correos").textContent = snapMensajes.size;
    } catch (e) { console.error(e); }
}

// --- 2. CARGAR LISTA DE MENSAJES ---
async function cargarBandeja() {
    const lista = document.getElementById("lista-mensajes");
    if (!lista) return;

    try {
        const q = query(collection(db, "mensajes"), orderBy("fecha", "desc"));
        const snapshot = await getDocs(q);
        lista.innerHTML = "";

        snapshot.forEach((doc) => {
            const m = doc.data();
            const item = document.createElement("div");
            item.className = "inbox-item"; // Asegúrate de que tenga padding y sea clicable en CSS
            item.style.padding = "15px";
            item.style.borderBottom = "1px solid #eee";
            item.style.cursor = "pointer";

            item.innerHTML = `
                <h4 style="margin:0; color:#722f37;">${m.nombre} ${m.apellido}</h4>
                <p style="margin:5px 0 0; color:#666;">${m.mensaje.substring(0, 50)}...</p>
            `;
            item.onclick = (e) => {
                e.stopPropagation();
                abrirModal(m);
            };

            lista.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

function abrirModal(m) {
    const modal = document.getElementById("modal-mensaje");
    const body = document.getElementById("detalle-modal-body");
    const fecha = m.fecha ? new Date(m.fecha.seconds * 1000).toLocaleString() : "Reciente";

    body.innerHTML = `
        <h2 style="color: #722f37;">${m.nombre} ${m.apellido}</h2>
        <p><strong>Correo:</strong> ${m.email}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <hr style="margin:15px 0; opacity:0.2;">
        <div style="white-space: pre-wrap; line-height:1.6;">${m.mensaje}</div>
    `;
    modal.style.display = "block";
}

function configurarCierreModal() {
    const modal = document.getElementById("modal-mensaje");

    // Cerrar con la X
    document.querySelector(".close-modal").onclick = () => {
        modal.style.display = "none";
    };
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}

function toggleMensajes() {
    const sec = document.getElementById("seccion-mensajes");
    if (sec.style.display === "none" || sec.style.display === "") {
        sec.style.display = "block";
        cargarBandeja();
    } else {
        sec.style.display = "none";
    }
}

// --- 5. LÓGICA DE CIERRE DE SESIÓN ---
function configurarCerrarSesion() {
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("iniciarseccion.html"); 
        };
    }
}
document.addEventListener("DOMContentLoaded", () => {
    cargarMetricas();
    configurarCierreModal();
    configurarCerrarSesion();
    document.getElementById("card-correos-toggle")?.addEventListener("click", toggleMensajes);
    document.getElementById("sidebar-btn-mensajes")?.addEventListener("click", toggleMensajes);
    lucide.createIcons();
});

