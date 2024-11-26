// Constants
const CITIES = [
    'Москва',
    'Санкт-Петербург',
    'Казань',
    'Екатеринбург',
    'Новосибирск',
    'Владивосток',
    'Калининград',
    'Сочи'
];

const STATUS_MAP = {
    awaiting: { label: 'Ожидает отправки', color: 'status-awaiting' },
    in_transit: { label: 'В пути', color: 'status-in_transit' },
    delivered: { label: 'Доставлен', color: 'status-delivered' }
};

// Initial data
let cargos = [
    {
        id: "CARGO001",
        name: "Строительные материалы",
        status: "in_transit",
        origin: "Москва",
        destination: "Казань",
        departureDate: "2024-03-24"
    },
    {
        id: "CARGO002",
        name: "Хрупкий груз",
        status: "awaiting",
        origin: "Санкт-Петербург",
        destination: "Екатеринбург",
        departureDate: "2024-03-26"
    }
];

// DOM Elements
const cargoForm = document.getElementById('cargo-form');
const cargoList = document.getElementById('cargo-list');
const statusFilter = document.getElementById('status-filter');
const emptyState = document.getElementById('empty-state');
const emptyMessage = document.getElementById('empty-message');
const originSelect = document.getElementById('origin');
const destinationSelect = document.getElementById('destination');

// Initialize city selects
function initializeCitySelects() {
    const cityOptions = CITIES.map(city => 
        `<option value="${city}">${city}</option>`
    ).join('');
    
    originSelect.innerHTML = cityOptions;
    destinationSelect.innerHTML = cityOptions;
    destinationSelect.selectedIndex = 1; // Select second city by default
}

// Render cargo table
function renderCargoTable() {
    const tbody = cargoList.querySelector('tbody');
    const currentFilter = statusFilter.value;
    
    const filteredCargos = currentFilter === 'all' 
        ? cargos 
        : cargos.filter(cargo => cargo.status === currentFilter);

    if (filteredCargos.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        emptyMessage.textContent = currentFilter === 'all' 
            ? 'Начните с добавления нового груза'
            : 'Нет грузов с выбранным статусом';
        cargoList.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    cargoList.classList.remove('hidden');
    
    tbody.innerHTML = filteredCargos.map(cargo => `
        <tr>
            <td>${cargo.id}</td>
            <td>${cargo.name}</td>
            <td>
                <select class="status-select ${STATUS_MAP[cargo.status].color}" 
                        data-cargo-id="${cargo.id}">
                    ${Object.entries(STATUS_MAP).map(([value, { label }]) => 
                        `<option value="${value}" ${cargo.status === value ? 'selected' : ''}>
                            ${label}
                        </option>`
                    ).join('')}
                </select>
            </td>
            <td>${cargo.origin}</td>
            <td>${cargo.destination}</td>
            <td>${new Date(cargo.departureDate).toLocaleDateString('ru-RU')}</td>
        </tr>
    `).join('');

    // Add event listeners to status selects
    tbody.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', handleStatusChange);
    });
}

// Handle status change
function handleStatusChange(event) {
    const select = event.target;
    const cargoId = select.dataset.cargoId;
    const newStatus = select.value;
    const cargo = cargos.find(c => c.id === cargoId);

    if (!cargo) return;

    if (newStatus === 'delivered' && new Date(cargo.departureDate) > new Date()) {
        alert('Ошибка: Нельзя установить статус "Доставлен" для груза с будущей датой отправления');
        select.value = cargo.status;
        return;
    }

    cargo.status = newStatus;
    select.className = `status-select ${STATUS_MAP[newStatus].color}`;
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const nameInput = form.elements['name'];
    const originInput = form.elements['origin'];
    const destinationInput = form.elements['destination'];
    const departureDateInput = form.elements['departure-date'];

    // Validate form
    let hasError = false;
    
    if (!nameInput.value.trim()) {
        showError('name-error', 'Введите название груза');
        hasError = true;
    }

    if (originInput.value === destinationInput.value) {
        showError('destination-error', 'Пункт назначения должен отличаться от пункта отправления');
        hasError = true;
    }

    if (!departureDateInput.value) {
        showError('date-error', 'Выберите дату отправления');
        hasError = true;
    }

    if (hasError) return;

    // Add new cargo
    const newCargo = {
        id: `CARGO${String(cargos.length + 1).padStart(3, '0')}`,
        name: nameInput.value.trim(),
        status: 'awaiting',
        origin: originInput.value,
        destination: destinationInput.value,
        departureDate: departureDateInput.value
    };

    cargos.push(newCargo);
    renderCargoTable();
    form.reset();
    
    // Reset default values
    destinationSelect.selectedIndex = 1;
    document.getElementById('departure-date').value = new Date().toISOString().split('T')[0];
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCitySelects();
    document.getElementById('departure-date').value = new Date().toISOString().split('T')[0];
    renderCargoTable();
});

// Event listeners
cargoForm.addEventListener('submit', handleFormSubmit);
statusFilter.addEventListener('change', renderCargoTable);