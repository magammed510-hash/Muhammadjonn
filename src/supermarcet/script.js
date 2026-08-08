let cart = [];

const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const cartModalBtn = document.getElementById('cartModalBtn');
const closeModal = document.querySelector('.close-modal');
const cartItemsList = document.getElementById('cartItemsList');
const modalTotalPrice = document.getElementById('modalTotalPrice');

cartModalBtn.addEventListener('click', () => { cartModal.style.display = 'block'; updateCartUI(); });
closeModal.addEventListener('click', () => { cartModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.style.display = 'none'; });

document.querySelectorAll('.product-card').forEach(card => {
    const minusBtn = card.querySelector('.minus-btn');
    const plusBtn = card.querySelector('.plus-btn');
    const qtyValue = card.querySelector('.qty-value');
    const priceDisplay = card.querySelector('.product-price');
    const basePrice = parseFloat(card.dataset.basePrice);

    let currentQty = 1;

    plusBtn.addEventListener('click', () => {
        currentQty++;
        qtyValue.textContent = currentQty;
        priceDisplay.textContent = (basePrice * currentQty).toFixed(2) + ' сом';
    });

    minusBtn.addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            qtyValue.textContent = currentQty;
            priceDisplay.textContent = (basePrice * currentQty).toFixed(2) + ' сом';
        }
    });

    const addBtn = card.querySelector('.add-to-cart-btn');
    addBtn.addEventListener('click', () => {
        const name = card.dataset.name;
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += currentQty;
        } else {
            cart.push({ name, basePrice, quantity: currentQty });
        }
        updateBadge();
        
        const originalText = addBtn.textContent;
        addBtn.textContent = "Илова шуд! ✓";
        setTimeout(() => { addBtn.textContent = originalText; }, 1000);
    });
});

function updateBadge() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;
}

function updateCartUI() {
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart-text">Сабади шумо холӣ аст.</p>';
        modalTotalPrice.textContent = '0.00 сом';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        let itemTotal = item.basePrice * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong>
                    <p>${item.basePrice} сом × ${item.quantity} = ${itemTotal.toFixed(2)} сом</p>
                </div>
                <button class="remove-item-btn" onclick="removeItem(${index})">❌</button>
            </div>
        `;
    });

    cartItemsList.innerHTML = html;
    modalTotalPrice.textContent = total.toFixed(2) + ' сом';
}

window.removeItem = function(index) {
    cart.splice(index, 1);
    updateBadge();
    updateCartUI();
}

// Категорияҳо
const categoryCards = document.querySelectorAll('.category-card');
const productCards = document.querySelectorAll('.product-card');
const sectionTitle = document.getElementById('sectionTitle');

categoryCards.forEach(catCard => {
    catCard.addEventListener('click', () => {
        categoryCards.forEach(c => c.classList.remove('active'));
        catCard.classList.add('active');

        const selectedCategory = catCard.dataset.category;
        sectionTitle.textContent = catCard.querySelector('h3').textContent;

        productCards.forEach(card => {
            if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// Ҷустуҷӯ
const searchInput = document.getElementById('searchInput');
const emptySearchState = document.getElementById('emptySearchState');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        let visibleCount = 0;

        productCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        emptySearchState.style.display = visibleCount === 0 ? "block" : "none";
    });
}

// Режими торик
const darkModeBtn = document.getElementById('darkModeToggle');
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        darkModeBtn.textContent = document.body.classList.contains('dark-theme') ? "☀️" : "🌙";
    });
}

// GPS ва суроға
const clientAddressInput = document.getElementById('clientAddress');
const getGpsBtn = document.getElementById('getGpsBtn');

if (getGpsBtn) {
    getGpsBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            getGpsBtn.textContent = "⏳...";
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    clientAddressInput.value = `GPS: https://maps.google.com/?q=${lat},${lon}`;
                    getGpsBtn.textContent = "📍 GPS";
                },
                () => {
                    getGpsBtn.textContent = "📍 GPS";
                    alert('Имкони гирифтани ҷойгиршавӣ нест.');
                }
            );
        }
    });
}

// Фиристодан
function generateOrderText() {
    if (cart.length === 0) return null;
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const address = clientAddressInput.value.trim();

    if (!name || !phone || !address) {
        alert('Лутфан майдонҳоро пур кунед!');
        return null;
    }

    let text = `🛒 Фармоиш аз SuperMarket\n`;
    text += `👤 Ном: ${name}\n`;
    text += `📞 Телефон: ${phone}\n`;
    text += `📍 Суроға: ${address}\n\n`;
    text += `📦 Маҳсулот:\n`;

    let total = 0;
    cart.forEach(item => {
        let sum = item.basePrice * item.quantity;
        total += sum;
        text += `- ${item.name} (${item.quantity} дона) — ${sum.toFixed(2)} сом\n`;
    });

    text += `\n💰 Ҷами умумӣ: ${total.toFixed(2)} сомонӣ`;
    return text;
}

document.getElementById('sendWhatsApp').addEventListener('click', () => {
    const text = generateOrderText();
    if (!text) return;
    window.open(`https://wa.me/992900210802?text=${encodeURIComponent(text)}`, '_blank');
});

document.getElementById('sendTelegram').addEventListener('click', () => {
    const text = generateOrderText();
    if (!text) return;
    window.open(`https://t.me/Amirshoev_2010?text=${encodeURIComponent(text)}`, '_blank');
});