//Conexion local

// const API_URL = 'http://localhost:3000/personas';
// const API_VIVIENDAS_URL = 'http://localhost:3000/viviendas';
// const API_MUNICIPIOS_URL = 'http://localhost:3000/municipios';

//Conexion en despliegue
const API_URL = 'https://crud-back-b7xc.onrender.com/personas';
const API_VIVIENDAS_URL = 'https://crud-back-b7xc.onrender.com/viviendas';
const API_MUNICIPIOS_URL = 'https://crud-back-b7xc.onrender.com/municipios';


// Llamar a las funciones para obtener viviendas y personas al cargar la página
window.onload = function() {

    getPersonas();  // Obtener personas para la tabla
    getPersonasForDependiente();  // Obtener personas para dependientes

    getViviendas();  // Llamar a la función para cargar las viviendas
    Cargarlistaviviendas();  // Obtener viviendas
    
    obtenerMunicipios(); // Inicializar lista de municipios
    cargarMunicipios(); // Llamar a la función cargarMunicipios para llenar el select de municipios
};

async function getPersonas() {
    const response = await fetch(API_URL);
    const personas = await response.json();
    const tbody = document.querySelector('#personasTable tbody');
    tbody.innerHTML = '';

    for (const persona of personas) {
        const viviendaPromise = fetch(`${API_VIVIENDAS_URL}/${persona.VIVIENDA_id_viv}`).then(res => res.json());
        const dependientePromise = persona.dependiente_de ? fetch(`${API_URL}/${persona.dependiente_de}`).then(res => res.json()) : Promise.resolve(null);

        const [vivienda, dependiente] = await Promise.all([viviendaPromise, dependientePromise]);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${persona.id}</td>
            <td>${persona.nombre}</td>
            <td>${persona.telefono}</td>
            <td>${persona.edad}</td>
            <td>${persona.sexo}</td>
            <td>${vivienda ? vivienda.direccion : 'N/A'}</td>
            <td>${dependiente ? dependiente.nombre : 'N/A'}</td>
            <td>
                <button class="btn btn-warning" onclick="editPersona(${persona.id})">Editar</button>
                <button class="btn btn-danger" onclick="deletePersona(${persona.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    }
}
async function getPersonasForDependiente() {
    const response = await fetch(API_URL);
    const personas = await response.json();
    const dependienteSelect = document.querySelector('#dependiente_de');
    const editDependienteSelect = document.querySelector('#editDependiente_de');
    
    // Llenar el select con personas
    dependienteSelect.innerHTML = '<option value="">Ninguno</option>';
    editDependienteSelect.innerHTML = '<option value="">Ninguno</option>';
    personas.forEach(persona => {
        const option = document.createElement('option');
        option.value = persona.id;
        option.textContent = persona.nombre;  // Mostrar el nombre como opción
        dependienteSelect.appendChild(option);
        editDependienteSelect.appendChild(option.cloneNode(true));
    });
}

// Función para obtener y mostrar viviendas
async function getViviendas() {
    const response = await fetch(API_VIVIENDAS_URL);
    const viviendas = await response.json();
    const tbody = document.querySelector('#viviendasTable tbody');
    tbody.innerHTML = '';

    // Obtener los municipios para relacionar con cada vivienda
    const municipiosResponse = await fetch(API_MUNICIPIOS_URL);
    const municipios = await municipiosResponse.json();

    // Crear un mapa para relacionar el ID del municipio con su nombre
    const municipioMap = municipios.reduce((map, municipio) => {
        map[municipio.id_mun] = municipio.nombre;
        return map;
    }, {});

    // Mostrar las viviendas en la tabla
    viviendas.forEach(vivienda => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vivienda.id_viv}</td>
            <td>${vivienda.direccion}</td>
            <td>${vivienda.capacidad}</td>
            <td>${vivienda.niveles}</td>
            <td>${municipioMap[vivienda.MUNICIPIO_id_mun] || 'Desconocido'}</td>
            <td>
                <button class="btn btn-warning" onclick="editVivienda(${vivienda.id_viv})">Editar</button>
                <button class="btn btn-danger" onclick="deleteVivienda(${vivienda.id_viv})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Obtener todas las viviendas
async function Cargarlistaviviendas() {
    const response = await fetch(API_VIVIENDAS_URL);
    const viviendas = await response.json();
    const viviendaSelect = document.querySelector('#VIVIENDA_id_viv');
    const editViviendaSelect = document.querySelector('#editVIVIENDA_id_viv');
    
    // Llenar el select con viviendas
    viviendaSelect.innerHTML = '<option value="" disabled selected>Selecciona Vivienda</option>';
    editViviendaSelect.innerHTML = '<option value="" disabled selected>Selecciona Vivienda</option>';
    viviendas.forEach(vivienda => {
        const option = document.createElement('option');
        option.value = vivienda.id_viv;
        option.textContent = vivienda.direccion;  // Mostrar la dirección como nombre
        viviendaSelect.appendChild(option);
        editViviendaSelect.appendChild(option.cloneNode(true));
    });
}

// Obtener lista de municipios
function obtenerMunicipios() {
    fetch(API_MUNICIPIOS_URL)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('municipios-list');
            tbody.innerHTML = '';
            data.forEach(municipio => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${municipio.id_mun}</td>
                    <td>${municipio.nombre}</td>
                    <td>${municipio.area}</td>
                    <td>${municipio.presupuesto}</td>
                    <td>
                        <button class="btn btn-warning" onclick="mostrarFormularioMunicipio(${municipio.id_mun}, '${municipio.nombre}', ${municipio.area}, ${municipio.presupuesto})">Editar</button>
                        <button class="btn btn-danger" onclick="eliminarMunicipio(${municipio.id_mun})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(err => console.error('Error al obtener municipios:', err));
}


// Función para cargar los municipios en el formulario
async function cargarMunicipios() {
    const response = await fetch(API_MUNICIPIOS_URL);
    const municipios = await response.json();
    const municipioSelect = document.getElementById('municipio');

    // Limpiar las opciones actuales
    municipioSelect.innerHTML = '<option value="" disabled selected>Selecciona Municipio</option>';

    // Llenar las opciones con los municipios disponibles
    municipios.forEach(municipio => {
        const option = document.createElement('option');
        option.value = municipio.id_mun;  // El valor que se enviará es el ID del municipio
        option.textContent = municipio.nombre;  // El texto visible es el nombre del municipio
        municipioSelect.appendChild(option);
    });
}







// Agregar una persona
personaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPersona = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        edad: document.getElementById('edad').value,
        sexo: document.getElementById('sexo').value,
        VIVIENDA_id_viv: document.getElementById('VIVIENDA_id_viv').value,
        dependiente_de: document.getElementById('dependiente_de').value || null,
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPersona),
    });
    getPersonas();  // Recargar la lista de personas
    Cargarlistaviviendas();  // Recargar viviendas
    getPersonasForDependiente();  // Recargar personas para dependientes
    personaForm.reset();  // Limpiar el formulario
});

async function editPersona(id) {
    // Obtener los datos de la persona
    const response = await fetch(`${API_URL}/${id}`);
    const persona = await response.json();

    // Rellenar el formulario con los datos de la persona
    document.getElementById('editId').value = persona.id;
    document.getElementById('editNombre').value = persona.nombre;
    document.getElementById('editTelefono').value = persona.telefono;
    document.getElementById('editEdad').value = persona.edad;
    document.getElementById('editSexo').value = persona.sexo;
    document.getElementById('editVIVIENDA_id_viv').value = persona.VIVIENDA_id_viv;
    document.getElementById('editDependiente_de').value = persona.dependiente_de || '';

    // Mostrar el formulario de edición
    document.getElementById('editFormContainer').style.display = 'block';
}

// Enviar la solicitud PUT para actualizar la persona
document.getElementById('editPersonaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const updatedPersona = {
        nombre: document.getElementById('editNombre').value,
        telefono: document.getElementById('editTelefono').value,
        edad: document.getElementById('editEdad').value,
        sexo: document.getElementById('editSexo').value,
        VIVIENDA_id_viv: document.getElementById('editVIVIENDA_id_viv').value,
        dependiente_de: document.getElementById('editDependiente_de').value || null,
    };

    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPersona),
    });

    getPersonas();  // Recargar la lista de personas
    getPersonasForDependiente();  // Recargar personas para dependientes

    document.getElementById('editFormContainer').style.display = 'none';  // Ocultar el formulario de edición
});

// Cancelar la edición y ocultar el formulario
function cancelEdit() {
    document.getElementById('editFormContainer').style.display = 'none';
}


// Eliminar una persona
async function deletePersona(id) {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    getPersonas();  // Recargar la lista de personas
    Cargarlistaviviendas();  // Recargar viviendas
    getPersonasForDependiente();  // Recargar personas para dependientes
}




// Función para agregar una nueva vivienda
async function addVivienda(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const direccion = document.getElementById('direccion').value;
    const capacidad = document.getElementById('capacidad').value;
    const niveles = document.getElementById('niveles').value;
    const municipio = document.getElementById('municipio').value;  // Aquí tomamos el ID del municipio seleccionado
    
    // Enviar la información de la vivienda, incluyendo el municipio seleccionado por su ID
    const response = await fetch(API_VIVIENDAS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            direccion,
            capacidad,
            niveles,
            MUNICIPIO_id_mun: municipio,  // Enviar el ID del municipio
        }),
    });

    if (response.ok) {
        alert('Vivienda agregada correctamente');
        getViviendas();  // Recargar la lista de viviendas
        Cargarlistaviviendas();  // Recargar viviendas
    } else {
        alert('Error al agregar vivienda');
    }
}
// Asignar el evento de submit al formulario de agregar vivienda
document.getElementById('addViviendaForm').addEventListener('submit', addVivienda);

// Función para editar una vivienda
// Mostrar el formulario de edición con los datos actuales de la vivienda
async function editVivienda(id) {
    const response = await fetch(`${API_VIVIENDAS_URL}/${id}`);
    const vivienda = await response.json();

    // Rellenar el formulario de edición con los datos de la vivienda
    document.getElementById('editViviendaId').value = vivienda.id_viv;
    document.getElementById('editDireccion').value = vivienda.direccion;
    document.getElementById('editCapacidad').value = vivienda.capacidad;
    document.getElementById('editNiveles').value = vivienda.niveles;
    document.getElementById('editMunicipio').value = vivienda.MUNICIPIO_id_mun;
    
    // Mostrar el formulario de edición
    document.getElementById('editViviendaForm').style.display = 'block';
}

// Función para actualizar una vivienda
async function updateVivienda(event) {
    event.preventDefault();  // Prevenir el comportamiento por defecto del formulario
    const id = document.getElementById('editViviendaId').value;
    const direccion = document.getElementById('editDireccion').value;
    const capacidad = document.getElementById('editCapacidad').value;
    const niveles = document.getElementById('editNiveles').value;
    const municipio = document.getElementById('editMunicipio').value;
    
    const response = await fetch(`${API_VIVIENDAS_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            direccion,
            capacidad,
            niveles,
            MUNICIPIO_id_mun: municipio,
        }),
    });

    if (response.ok) {
        alert('Vivienda modificada correctamente');
        getViviendas();  // Recargar la lista de viviendas
        Cargarlistaviviendas();  // Recargar viviendas
        document.getElementById('editViviendaForm').style.display = 'none'; // Ocultar formulario
    } else {
        alert('Error al modificar vivienda');
    }
}

// Asignar el evento de submit al formulario de editar vivienda
document.getElementById('editViviendaForm').addEventListener('submit', updateVivienda);


// Función para eliminar una vivienda
async function deleteVivienda(id) {
    const response = await fetch(`${API_VIVIENDAS_URL}/${id}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        alert('Vivienda eliminada correctamente');
        getViviendas();  // Recargar la lista de viviendas
        Cargarlistaviviendas();  // Recargar viviendas
    } else {
        alert('Error al eliminar vivienda');
    }
}





// Mostrar formulario para agregar/modificar municipio
function mostrarFormularioMunicipio(id = null, nombre = '', area = '', presupuesto = '') {
    const form = document.getElementById('municipio-form');
    document.getElementById('municipio-id').value = id;
    document.getElementById('municipio-nombre').value = nombre;
    document.getElementById('municipio-area').value = area;
    document.getElementById('municipio-presupuesto').value = presupuesto;
    form.style.display = 'block';
}

// Guardar municipio (Agregar o Modificar)
document.getElementById('municipio-form').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('municipio-id').value;
    const nombre = document.getElementById('municipio-nombre').value;
    const area = document.getElementById('municipio-area').value;
    const presupuesto = document.getElementById('municipio-presupuesto').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_MUNICIPIOS_URL}/${id}` : API_MUNICIPIOS_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, area, presupuesto })
        });

        if (response.ok) {
            alert(id ? 'Municipio actualizado correctamente' : 'Municipio agregado correctamente');
            obtenerMunicipios();  // Recargar la lista de municipios
            cargarMunicipios();
            document.getElementById('municipio-form').reset();
            document.getElementById('municipio-form').style.display = 'none';
        } else {
            alert('Error al guardar municipio');
        }
    } catch (error) {
        console.error('Error al guardar municipio:', error);
        alert('Hubo un error al procesar la solicitud');
    }
});


async function eliminarMunicipio(id) {
    const response = await fetch(`${API_MUNICIPIOS_URL}/${id}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        alert('Municipio eliminado correctamente');
        obtenerMunicipios();  // Recargar la lista de viviendas
        cargarMunicipios();
    } else {
        alert('Error al eliminar Municipio');
    }
}






