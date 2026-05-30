import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let idMensajeAEliminar = null;
let idUsuarioAEliminar = null;

async function cargarMetricas() {
    try {
        const snapUsers = await getDocs(collection(db, "usuarios"));
        const snapMensajes = await getDocs(collection(db, "mensajes"));
        const snapPlatos = await getDocs(collection(db, "pedidos"));

        if (document.getElementById("count-usuarios"))
            document.getElementById("count-usuarios").textContent = snapUsers.size;
        if (document.getElementById("count-correos"))
            document.getElementById("count-correos").textContent = snapMensajes.size;
        if (document.getElementById("count-platos"))
            document.getElementById("count-platos").textContent = snapPlatos.size;
    } catch (e) {
        console.error(e);
    }
}

async function cargarBandeja() {
  const lista = document.getElementById("lista-mensajes");
  if (!lista) return;

  try {
    const q = query(collection(db, "mensajes"), orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);
    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML =
        "<p class='inbox-empty-text'>No hay mensajes nuevos.</p>";
      return;
    }

    snapshot.forEach((documento) => {
      const m = documento.data();
      const idDoc = documento.id;

      const div = document.createElement("div");
      div.className = "inbox-item";

      div.innerHTML = `
                <div class="inbox-item-row">
                    <div class="inbox-item-content">
                        <h4>${m.nombre || "Sin nombre"} ${m.apellido || ""}</h4>
                        <p>${m.mensaje ? m.mensaje.substring(0, 50) + "..." : "Ver mensaje"}</p>
                    </div>
                    <button class="btn-delete-msg" data-id="${idDoc}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
      div.onclick = (e) => {
        e.stopPropagation();
        abrirModal(m);
      };
      const botonBasura = div.querySelector(".btn-delete-msg");
      if (botonBasura) {
        botonBasura.onclick = (e) => {
          e.stopPropagation();
          idMensajeAEliminar = idDoc;
          abrirModalConfirmacion();
        };
      }

      lista.appendChild(div);
    });

    lucide.createIcons();
  } catch (e) {
    console.error("Error en bandeja:", e);
  }
}

function abrirModal(m) {
  const modal = document.getElementById("modal-mensaje");
  const body = document.getElementById("detalle-modal-body");
  const fecha = m.fecha
    ? new Date(m.fecha.seconds * 1000).toLocaleString()
    : "Reciente";

  if (body) {
    body.innerHTML = `
            <h2 class="modal-detail-title">${m.nombre} ${m.apellido}</h2>
            <p class="modal-detail-info"><strong>Correo:</strong> ${m.email}</p>
            <p class="modal-detail-info"><strong>Fecha:</strong> ${fecha}</p>
            <div class="modal-detail-message-text">${m.mensaje}</div>
        `;
  }
  if (modal) modal.classList.add("is-visible");
}

async function cargarUsuarios() {
  const lista = document.getElementById("lista-usuarios");
  const contadorLista = document.getElementById("count-usuarios-lista");
  if (!lista) return;

  try {
    const q = query(collection(db, "usuarios"));
    const snapshot = await getDocs(q);
    lista.innerHTML = "";

    if (contadorLista) {
      contadorLista.textContent = `${snapshot.size} usuarios`;
    }

    if (snapshot.empty) {
      lista.innerHTML =
        "<p class='inbox-empty-text'>No hay usuarios registrados.</p>";
      return;
    }

    snapshot.forEach((documento) => {
      const u = documento.data();
      const idDoc = documento.id;

      const div = document.createElement("div");
      div.className = "inbox-item";

      div.innerHTML = `
                <div class="inbox-item-row">
                    <div class="inbox-item-content">
                        <h4>${u.nombre || "Sin nombre"} ${u.apellido || ""}</h4>
                        <p><strong>Correo:</strong> ${u.email || "Sin correo"} ${u.telefono ? "| <strong>Tel:</strong> " + u.telefono : ""}</p>
                    </div>
                    <button class="btn-delete-msg btn-delete-user" data-id="${idDoc}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

      div.onclick = (e) => {
        e.stopPropagation();
        abrirModalUsuario(u);
      };

      const botonBorrar = div.querySelector(".btn-delete-user");
      if (botonBorrar) {
        botonBorrar.onclick = (e) => {
          e.stopPropagation();
          idUsuarioAEliminar = idDoc;
          abrirModalConfirmacionUsuario();
        };
      }

      lista.appendChild(div);
    });

    lucide.createIcons();
  } catch (e) {
    console.error("Error al cargar usuarios:", e);
  }
}

function abrirModalUsuario(u) {
  const modal = document.getElementById("modal-usuario");
  const body = document.getElementById("detalle-modal-usuario-body");

  if (body) {
    body.innerHTML = `
            <h2 class="modal-detail-title">${u.nombre || "Usuario"} ${u.apellido || ""}</h2>
            <p class="modal-detail-info"><strong>Correo Electrónico:</strong> ${u.email || "N/A"}</p>
            <p class="modal-detail-info"><strong>Teléfono:</strong> ${u.telefono || "N/A"}</p>
            <p class="modal-detail-info"><strong>Rol / Tipo:</strong> ${u.rol || "Cliente"}</p>
        `;
  }
  if (modal) modal.classList.add("is-visible");
}

function abrirModalConfirmacionUsuario() {
  const modalConfirm = document.getElementById(
    "modal-confirmar-eliminar-usuario",
  );
  if (modalConfirm) modalConfirm.classList.add("is-visible");
}

function toggleMensajes() {
  const sec = document.getElementById("seccion-mensajes");
  const secUsers = document.getElementById("seccion-usuarios");

  if (secUsers) secUsers.classList.remove("is-visible");

  if (sec) {
    const estaVisible = sec.classList.contains("is-visible");
    if (estaVisible) {
      sec.classList.remove("is-visible");
    } else {
      sec.classList.add("is-visible");
      cargarBandeja();
    }
  }
}

function toggleUsuarios() {
  const sec = document.getElementById("seccion-usuarios");
  const secMensajes = document.getElementById("seccion-mensajes");

  if (secMensajes) secMensajes.classList.remove("is-visible");

  if (sec) {
    const estaVisible = sec.classList.contains("is-visible");
    if (estaVisible) {
      sec.classList.remove("is-visible");
    } else {
      sec.classList.add("is-visible");
      cargarUsuarios();
    }
  }
}

function configurarCierreModal() {
  const closeBtnMsg = document.querySelector(".close-modal");
  if (closeBtnMsg) {
    closeBtnMsg.onclick = () => {
      const modalMsg = document.getElementById("modal-mensaje");
      if (modalMsg) modalMsg.classList.remove("is-visible");
    };
  }

  const closeBtnUser = document.getElementById("close-modal-usuario");
  if (closeBtnUser) {
    closeBtnUser.onclick = () => {
      const modalUser = document.getElementById("modal-usuario");
      if (modalUser) modalUser.classList.remove("is-visible");
    };
  }
}

function abrirModalConfirmacion() {
  const modalConfirm = document.getElementById("modal-confirmar-eliminar");
  if (modalConfirm) modalConfirm.classList.add("is-visible");
}

function cerrarModalConfirmacion() {
  const modalConfirm = document.getElementById("modal-confirmar-eliminar");
  if (modalConfirm) modalConfirm.classList.remove("is-visible");
  idMensajeAEliminar = null;
}

function configurarModalEliminar() {
  const btnCancelar = document.getElementById("btn-cancelar-eliminar");
  const btnConfirmar = document.getElementById("btn-confirmar-eliminar");
  const btnCancelarX = document.getElementById("btn-cancelar-x");

  if (btnCancelar) btnCancelar.onclick = () => cerrarModalConfirmacion();
  if (btnCancelarX) btnCancelarX.onclick = () => cerrarModalConfirmacion();

  if (btnConfirmar) {
    btnConfirmar.onclick = async () => {
      if (idMensajeAEliminar) {
        try {
          await deleteDoc(doc(db, "mensajes", idMensajeAEliminar));
          cerrarModalConfirmacion();
          cargarBandeja();
          cargarMetricas();
        } catch (error) {
          console.error(error);
        }
      }
    };
  }

  const btnCancelarUser = document.getElementById(
    "btn-cancelar-eliminar-usuario",
  );
  const btnConfirmarUser = document.getElementById(
    "btn-confirmar-eliminar-usuario",
  );
  const btnCancelarUserX = document.getElementById("btn-cancelar-user-x");
  const modalConfirmUser = document.getElementById(
    "modal-confirmar-eliminar-usuario",
  );

  if (btnCancelarUser) {
    btnCancelarUser.onclick = () => {
      if (modalConfirmUser) modalConfirmUser.classList.remove("is-visible");
      idUsuarioAEliminar = null;
    };
  }
  if (btnCancelarUserX) {
    btnCancelarUserX.onclick = () => {
      if (modalConfirmUser) modalConfirmUser.classList.remove("is-visible");
      idUsuarioAEliminar = null;
    };
  }

  if (btnConfirmarUser) {
    btnConfirmarUser.onclick = async () => {
      if (idUsuarioAEliminar) {
        try {
          await deleteDoc(doc(db, "usuarios", idUsuarioAEliminar));
          if (modalConfirmUser) modalConfirmUser.classList.remove("is-visible");
          idUsuarioAEliminar = null;
          cargarUsuarios();
          cargarMetricas();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }
}

let idPlatoAEliminar = null;

async function cargarPlatos() {
    const lista = document.getElementById("lista-platos");
    const contador = document.getElementById("count-platos-lista");
    if (!lista) return;

    try {
        const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
        const snapshot = await getDocs(q);
        lista.innerHTML = "";

        if (contador) contador.textContent = `${snapshot.size} platos`;

        if (snapshot.empty) {
            lista.innerHTML = "<p class='inbox-empty-text'>No hay platos creados.</p>";
            return;
        }

        snapshot.forEach((documento) => {
            const p = documento.data();
            const idDoc = documento.id;

            const div = document.createElement("div");
            div.className = "inbox-item";

            const fecha = p.fecha ? new Date(p.fecha.seconds * 1000).toLocaleString() : "Reciente";
            const ingredientes = p.items ? p.items.map(i => i.name).join(", ") : "Sin ingredientes";

            div.innerHTML = `
                <div class="inbox-item-row">
                    <div class="inbox-item-content">
                        <h4>${p.nombrePlato || "Plato sin nombre"}</h4>
                        <p><strong>Total:</strong> $${p.total?.toLocaleString() || 0} COP | <strong>Fecha:</strong> ${fecha}</p>
                        <p><strong>Ingredientes:</strong> ${ingredientes}</p>
                    </div>
                    <button class="btn-delete-msg" data-id="${idDoc}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

            div.onclick = (e) => {
                e.stopPropagation();
                abrirModalPlato(p);
            };

            const btnBorrar = div.querySelector(".btn-delete-msg");
            if (btnBorrar) {
                btnBorrar.onclick = (e) => {
                    e.stopPropagation();
                    idPlatoAEliminar = idDoc;
                    abrirModalConfirmacionPlato();
                };
            }

            lista.appendChild(div);
        });

        lucide.createIcons();
    } catch (e) {
        console.error("Error al cargar platos:", e);
    }
}

function abrirModalPlato(p) {
    const modal = document.getElementById("modal-mensaje");
    const body = document.getElementById("detalle-modal-body");
    const fecha = p.fecha ? new Date(p.fecha.seconds * 1000).toLocaleString() : "Reciente";
    const ingredientes = p.items ? p.items.map(i => `<li>${i.name} — $${i.price?.toLocaleString()} COP</li>`).join("") : "";

    if (body) {
        body.innerHTML = `
            <h2 class="modal-detail-title">${p.nombrePlato || "Plato sin nombre"}</h2>
            <p class="modal-detail-info"><strong>Fecha:</strong> ${fecha}</p>
            <p class="modal-detail-info"><strong>Total:</strong> $${p.total?.toLocaleString() || 0} COP</p>
            <p class="modal-detail-info"><strong>Descripción:</strong> ${p.descripcion || "Sin descripción"}</p>
            <p class="modal-detail-info"><strong>Ingredientes:</strong></p>
            <ul style="margin-left:20px; font-size:14px;">${ingredientes}</ul>
        `;
    }
    if (modal) modal.classList.add("is-visible");
}

function abrirModalConfirmacionPlato() {
    const modalConfirm = document.getElementById("modal-confirmar-eliminar-plato");
    if (modalConfirm) modalConfirm.classList.add("is-visible");
}

function togglePlatos() {
    const sec = document.getElementById("seccion-platos");
    const secMensajes = document.getElementById("seccion-mensajes");
    const secUsuarios = document.getElementById("seccion-usuarios");

    if (secMensajes) secMensajes.classList.remove("is-visible");
    if (secUsuarios) secUsuarios.classList.remove("is-visible");

    if (sec) {
        const estaVisible = sec.classList.contains("is-visible");
        if (estaVisible) {
            sec.classList.remove("is-visible");
        } else {
            sec.classList.add("is-visible");
            cargarPlatos();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarMetricas();
  configurarCierreModal();
  configurarModalEliminar();

  document
    .getElementById("sidebar-btn-mensajes")
    ?.addEventListener("click", toggleMensajes);
  document
    .getElementById("sidebar-btn-usuarios")
    ?.addEventListener("click", toggleUsuarios);

  const btnCerrarSesion =
    document.getElementById("cerrar-sesion") ||
    document.getElementById("btn-logout");
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", (e) => {
      e.preventDefault();

      import("./firebase-config.js").then((module) => {
        const auth = module.auth;
        if (auth) {
          auth
            .signOut()
            .then(() => {
              window.location.href = "iniciarseccion.html";
            })
            .catch((error) => console.error("Error al cerrar sesión:", error));
        } else {
          window.location.href = "iniciarseccion.html";
        }
      });
    });
  }
  const tarjetasDato = document.querySelectorAll(".card-pro");

  if (tarjetasDato.length >= 4) {
    const tarjetaUsuarios = tarjetasDato[0];
    tarjetaUsuarios.style.cursor = "pointer";
    tarjetaUsuarios.onclick = (e) => {
      e.preventDefault();
      toggleUsuarios();
    };

    const itemsNavegacion = document.querySelectorAll('li');
itemsNavegacion.forEach(item => {
    const textoConEnlace = item.querySelector('span[href]');
    if (textoConEnlace) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const url = textoConEnlace.getAttribute('href');
            if (url) window.location.href = url;
        });
    }
});


    document.getElementById("sidebar-btn-platos")?.addEventListener("click", togglePlatos);
document.getElementById("card-platos-toggle")?.addEventListener("click", togglePlatos);

const btnCancelarPlato = document.getElementById("btn-cancelar-eliminar-plato");
const btnConfirmarPlato = document.getElementById("btn-confirmar-eliminar-plato");

if (btnCancelarPlato) {
    btnCancelarPlato.onclick = () => {
        document.getElementById("modal-confirmar-eliminar-plato")?.classList.remove("is-visible");
        idPlatoAEliminar = null;
    };
}

if (btnConfirmarPlato) {
    btnConfirmarPlato.onclick = async () => {
        if (idPlatoAEliminar) {
            try {
                await deleteDoc(doc(db, "pedidos", idPlatoAEliminar));
                document.getElementById("modal-confirmar-eliminar-plato")?.classList.remove("is-visible");
                idPlatoAEliminar = null;
                cargarPlatos();
                cargarMetricas();
            } catch (e) {
                console.error(e);
            }
        }
    };
}
    const tarjetaMensajes = tarjetasDato[3];
    tarjetaMensajes.style.cursor = "pointer";
    tarjetaMensajes.onclick = (e) => {
      e.preventDefault();
      toggleMensajes();
    };
  } else {
    tarjetasDato.forEach((tarjeta) => {
      tarjeta.style.cursor = "pointer";
      tarjeta.addEventListener("click", (e) => {
        const texto = e.currentTarget.textContent.toLowerCase();

        if (texto.includes("usuario")) {
          e.preventDefault();
          toggleUsuarios(); 
        } else if (texto.includes("correo") || texto.includes("mensaje")) {
          e.preventDefault();
          toggleMensajes(); 
        }
      });
    });
  }

  window.addEventListener("click", (e) => {
    const modalDetalle = document.getElementById("modal-mensaje");
    const modalConfirm = document.getElementById("modal-confirmar-eliminar");
    const modalUsuario = document.getElementById("modal-usuario");
    const modalConfirmUser = document.getElementById(
      "modal-confirmar-eliminar-usuario",
    );
    if (e.tarjeta.closest(".card-data")) return;
    if (e.target === modalDetalle) modalDetalle.classList.remove("is-visible");
    if (e.target === modalConfirm) cerrarModalConfirmacion();
    if (e.target === modalUsuario) modalUsuario.classList.remove("is-visible");
    if (e.target === modalConfirmUser) {
      modalConfirmUser.classList.remove("is-visible");
      idUsuarioAEliminar = null;
    }
  });

  if (window.lucide) {
        window.lucide.createIcons();
    } else if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
