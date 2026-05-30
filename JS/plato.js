import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const cards = document.querySelectorAll('.ingredient-card');
    const dropzone = document.getElementById('bowl-dropzone');
    const bowlWrapper = document.querySelector('.bowl-wrapper');
    const summaryList = document.getElementById('summary-dynamic-list');
    const txtSubtotal = document.getElementById('txt-subtotal');
    const txtTotal = document.getElementById('txt-total');
    
    const inputNombre = document.querySelector('.form-group input[type="text"]');
    const inputDescripcion = document.querySelector('.form-group textarea');

    let totalAcumulado = 10000;
    let ingredientesAgregados = [];

    const imagenesPicadas = {
        tomate:   'img/imagen_2026-05-29_204748503-removebg-preview.png',
        aguacate: 'img/imagen_2026-05-29_205007370-removebg-preview.png',
        pepino:   'img/imagen_2026-05-29_204938872-removebg-preview.png',
        brocoli:  'img/loquesea.png',
        maiz:     'img/imagen_2026-05-29_204842614-removebg-preview.png',
        espinaca: 'img/imagen_2026-05-29_204902478-removebg-preview.png',
    };

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-wrapper';
    modal.innerHTML = `
        <div class="preparacion-modal">
            <div class="modal-header">
                <h3 id="modal-titulo">🔪 Preparando...</h3>
            </div>
            <div class="modal-body">
                <div class="ingredient-preview">
                    <img id="modal-img-ingrediente" src="" alt="">
                    <img src="img/imagen_2026-05-29_204300789-removebg-preview.png" class="cuchillo-anim" alt="">
                </div>
                
                <p class="pregunta-preparacion">¿Cómo lo quieres agregar?</p>
                
                <div class="corte-preview">
                    <img id="modal-img-picado" src="" alt="">
                </div>
                
                <div class="tamanio-opciones">
                    <button id="btn-tamanio-entero">🍃 Sin cortar</button>
                    <button id="btn-tamanio-pequeno">🔹 Pequeño</button>
                    <button id="btn-tamanio-mediano">🔸 Mediano</button>
                    <button id="btn-tamanio-grande">🔶 Grande</button>
                </div>
            </div>
            <div class="modal-footer">
                <button id="btn-modal-agregar">✅ Agregar al plato</button>
                <button id="btn-modal-cancelar">❌ Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    let ingredienteActual = null;
    let tamanioActual = '35%';
    let modoCorteActual = 'picado';

    const btnEntero  = document.getElementById('btn-tamanio-entero');
    const btnPequeno = document.getElementById('btn-tamanio-pequeno');
    const btnMediano = document.getElementById('btn-tamanio-mediano');
    const btnGrande  = document.getElementById('btn-tamanio-grande');
    const btnAgregarAlPlato = document.getElementById('btn-modal-agregar');

    function seleccionarOpcion(btn, tamanio, modoCorte) {
        if (!btn || !btnAgregarAlPlato) return;
        
        [btnEntero, btnPequeno, btnMediano, btnGrande].forEach(b => {
            if (b) b.classList.remove('active');
        });
        
        btn.classList.add('active');
        btnAgregarAlPlato.classList.add('active');
        
        tamanioActual = tamanio;
        modoCorteActual = modoCorte;

        if (ingredienteActual) {
            document.getElementById('modal-img-picado').src = 
                modoCorte === 'entero' ? ingredienteActual.img : (imagenesPicadas[ingredienteActual.id] || ingredienteActual.img);
        }
    }

    if (btnEntero)  btnEntero.addEventListener('click',  () => seleccionarOpcion(btnEntero,  '45%', 'entero'));
    if (btnPequeno) btnPequeno.addEventListener('click', () => seleccionarOpcion(btnPequeno, '25%', 'picado'));
    if (btnMediano) btnMediano.addEventListener('click', () => seleccionarOpcion(btnMediano, '35%', 'picado'));
    if (btnGrande)  btnGrande.addEventListener('click',  () => seleccionarOpcion(btnGrande,  '55%', 'picado'));

    function abrirModalPicado(ing) {
        ingredienteActual = ing;
        seleccionarOpcion(btnMediano, '35%', 'picado');

        document.getElementById('modal-titulo').textContent = `🔪 Preparando ${ing.name}`;
        document.getElementById('modal-img-ingrediente').src = ing.img;
        document.getElementById('modal-img-picado').src = imagenesPicadas[ing.id] || ing.img;

        modal.style.display = 'flex';
    }

    const btnCancelar = document.getElementById('btn-modal-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modal.style.display = 'none';
            ingredienteActual = null;
            if (btnAgregarAlPlato) btnAgregarAlPlato.classList.remove('active');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            ingredienteActual = null;
            if (btnAgregarAlPlato) btnAgregarAlPlato.classList.remove('active');
        }
    });

    if (btnAgregarAlPlato) {
        btnAgregarAlPlato.addEventListener('click', () => {
            if (!ingredienteActual) return;
            modal.style.display = 'none';
            btnAgregarAlPlato.classList.remove('active');

            const imgFinal = modoCorteActual === 'entero' ? ingredienteActual.img : (imagenesPicadas[ingredienteActual.id] || ingredienteActual.img);
            agregarIngredienteEnPosicion(ingredienteActual, imgFinal, 30, 30, tamanioActual);
        });
    }

    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            const dataObjeto = {
                id: card.getAttribute('data-id'),
                name: card.getAttribute('data-name'),
                price: parseInt(card.getAttribute('data-price')) || 0,
                cat: card.getAttribute('data-cat'),
                img: card.querySelector('img').getAttribute('src')
            };
            e.dataTransfer.setData('application/json', JSON.stringify(dataObjeto));
        });

        card.addEventListener('dragend', () => card.classList.remove('dragging'));

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-ingredient')) return;
            abrirModalPicado({
                id: card.getAttribute('data-id'),
                name: card.getAttribute('data-name'),
                price: parseInt(card.getAttribute('data-price')) || 0,
                cat: card.getAttribute('data-cat'),
                img: card.querySelector('img').getAttribute('src')
            });
        });

        const btnAdd = card.querySelector('.btn-add-ingredient');
        if (btnAdd) {
            btnAdd.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalPicado({
                    id: card.getAttribute('data-id'),
                    name: card.getAttribute('data-name'),
                    price: parseInt(card.getAttribute('data-price')) || 0,
                    cat: card.getAttribute('data-cat'),
                    img: card.querySelector('img').getAttribute('src')
                });
            });
        }
    });

    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-hover');
        });

        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-hover'));

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-hover');
            try {
                const rawData = e.dataTransfer.getData('application/json');
                if (rawData) {
                    const data = JSON.parse(rawData);
                    abrirModalPicado(data);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    function agregarIngredienteEnPosicion(ing, imgSrc, x, y, tamanio) {
        const nuevoIngrediente = { ...ing, imgEnPlato: imgSrc, posX: x, posY: y, escala: tamanio };
        ingredientesAgregados.push(nuevoIngrediente);
        totalAcumulado += nuevoIngrediente.price;

        const imgIngrediente = document.createElement('img');
        imgIngrediente.src = imgSrc;
        imgIngrediente.alt = nuevoIngrediente.name;
        imgIngrediente.className = 'ingrediente-libre';
        imgIngrediente.title = `${nuevoIngrediente.name} — doble clic para eliminar`;
        imgIngrediente.style.left = `${x}%`;
        imgIngrediente.style.top = `${y}%`;
        imgIngrediente.style.width = tamanio;

        hacerMovible(imgIngrediente, bowlWrapper, nuevoIngrediente);
        if (bowlWrapper) bowlWrapper.appendChild(imgIngrediente);
        actualizarResumen();
    }

    function hacerMovible(el, contenedor, objReferencia) {
        if (!contenedor) return;
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        el.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            el.classList.add('dragging');

            const rect = contenedor.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = (parseFloat(el.style.left) / 100) * rect.width;
            startTop = (parseFloat(el.style.top) / 100) * rect.height;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const rect = contenedor.getBoundingClientRect();
            let newLeft = startLeft + (e.clientX - startX);
            let newTop = startTop + (e.clientY - startY);
            
            newLeft = Math.max(0, Math.min(newLeft, rect.width - el.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, rect.height - el.offsetHeight));
            
            let finalX = (newLeft / rect.width * 100);
            let finalY = (newTop / rect.height * 100);
            
            el.style.left = finalX + '%';
            el.style.top = finalY + '%';
            
            objReferencia.posX = finalX;
            objReferencia.posY = finalY;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                el.classList.remove('dragging');
            }
        });

        el.addEventListener('dblclick', () => {
            const srcAtributo = el.getAttribute('src');
            const indice = ingredientesAgregados.findIndex(i => i.imgEnPlato === srcAtributo);
            
            if (indice !== -1) {
                totalAcumulado -= ingredientesAgregados[indice].price;
                ingredientesAgregados.splice(indice, 1);
            }
            el.remove();
            actualizarResumen();
        });
    }

    function actualizarResumen() {
        if (!summaryList || !txtSubtotal || !txtTotal) return;

        if (ingredientesAgregados.length === 0) {
            summaryList.innerHTML = '<div class="summary-placeholder">Arrastra un ingrediente al bol para comenzar.</div>';
            txtSubtotal.innerText = '$0 COP';
            txtTotal.innerText = '$0 COP';
            return;
        }

        summaryList.innerHTML = '';
        ingredientesAgregados.forEach(ing => {
            const catDiv = document.createElement('div');
            catDiv.className = 'summary-category';
            catDiv.innerHTML = `
                <h4>${ing.cat}</h4>
                <div class="summary-item">
                    <div class="item-info">
                        <img src="${ing.imgEnPlato}" style="width:16px;height:16px;object-fit:contain;">
                        <span>${ing.name}</span>
                    </div>
                    <span class="item-cost">+ $${ing.price.toLocaleString()} COP</span>
                </div>
            `;
            summaryList.appendChild(catDiv);
        });

        txtSubtotal.innerText = `$${totalAcumulado.toLocaleString()} COP`;
        txtTotal.innerText = `$${totalAcumulado.toLocaleString()} COP`;
    }

    async function guardarPedidoEnFirebase() {
        if (ingredientesAgregados.length === 0) {
            alert("Agrega ingredientes antes de confirmar.");
            return;
        }
        try {
            const pedido = {
                nombrePlato: inputNombre ? inputNombre.value : "Plato Personalizado",
                descripcion: inputDescripcion ? inputDescripcion.value : "",
                items: ingredientesAgregados.map(i => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    cat: i.cat,
                    posX: i.posX,
                    posY: i.posY,
                    escala: i.escala
                })),
                total: totalAcumulado,
                fecha: serverTimestamp()
            };
            await addDoc(collection(db, "pedidos"), pedido);
            alert("Pedido guardado con éxito.");
            
            ingredientesAgregados = [];
            totalAcumulado = 28000;
            if (bowlWrapper) {
                bowlWrapper.querySelectorAll('.ingrediente-libre').forEach(el => el.remove());
            }
            actualizarResumen();
        } catch (error) {
            console.error(error);
        }
    }

    const btnConfirmar = document.querySelector('.btn-submit-order');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', guardarPedidoEnFirebase);
    }

    const botonesNavegacion = document.querySelectorAll('li');
botonesNavegacion.forEach(item => {
    const enlace = item.querySelector('span[href]');
    if (enlace) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const url = enlace.getAttribute('href');
            if (url) {
                window.location.href = url;
            }
        });
    }
});

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
});