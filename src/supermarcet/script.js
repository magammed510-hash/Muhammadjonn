let cart = [];

const cartBadge = document.getElementById('cartBadge');
const cartBadgeDesktop = document.getElementById('cartBadgeDesktop');
const cartModal = document.getElementById('cartModal');
const cartModalBtn = document.getElementById('cartModalBtn');
const cartModalBtnMobile = document.getElementById('cartModalBtnMobile');
const closeModal = document.querySelector('.close-modal');
const cartItemsList = document.getElementById('cartItemsList');
const modalTotalPrice = document.getElementById('modalTotalPrice');

function openCart() {
    if (cartModal) {
        cartModal.style.display = 'flex'; 
        updateCartUI(); 
        const savedSession = JSON.parse(localStorage.getItem('market_user_session'));
        if (savedSession && savedSession.role !== 'admin') {
            const clientNameElem = document.getElementById('clientName');
            const clientPhoneElem = document.getElementById('clientPhone');
            if (clientNameElem) clientNameElem.value = savedSession.name || '';
            if (clientPhoneElem) clientPhoneElem.value = savedSession.phone || '';
        }
    }
}

if (cartModalBtn) cartModalBtn.addEventListener('click', openCart);
if (cartModalBtnMobile) cartModalBtnMobile.addEventListener('click', openCart);

if (closeModal) {
    closeModal.addEventListener('click', () => { 
        if (cartModal) cartModal.style.display = 'none'; 
    });
}

window.addEventListener('click', (e) => { 
    if (e.target === cartModal) cartModal.style.display = 'none';
    if (e.target === document.getElementById('profileModal')) document.getElementById('profileModal').style.display = 'none';
    if (e.target === document.getElementById('settingsModal')) document.getElementById('settingsModal').style.display = 'none';
    if (e.target === document.getElementById('dcQrModal')) document.getElementById('dcQrModal').style.display = 'none';
    if (e.target === document.getElementById('ratingModal')) document.getElementById('ratingModal').style.display = 'none';
});

// Sidebar menu
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sideDrawer = document.getElementById('sideDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const closeDrawer = document.getElementById('closeDrawer');
const drawerProfile = document.getElementById('drawerProfile');
const drawerSettings = document.getElementById('drawerSettings');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        sideDrawer.classList.add('active');
        drawerOverlay.classList.add('active');
    });
}

if (closeDrawer || drawerOverlay) {
    [closeDrawer, drawerOverlay].forEach(el => {
        if (el) el.addEventListener('click', () => {
            sideDrawer.classList.remove('active');
            drawerOverlay.classList.remove('active');
        });
    });
}

if (drawerProfile) {
    drawerProfile.addEventListener('click', (e) => {
        e.preventDefault();
        sideDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
        document.getElementById('profileModal').style.display = 'flex';
        checkUserState();
    });
}

if (drawerSettings) {
    drawerSettings.addEventListener('click', (e) => {
        e.preventDefault();
        sideDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
        document.getElementById('settingsModal').style.display = 'flex';
    });
}

/* ============================================================ */
/* ★★★ МАНТИҚИ НАВ: Интихоби ҳаҷм (variants) ва таъм/ранг (flavors) ★★★ */
/* ============================================================ */

function setupVariantsAndFlavors() {
    document.querySelectorAll('.product-card').forEach(card => {

        // --- Интихоби ҳаҷм (масалан 1.5л / 1л / 500г) ---
        const variantsRaw = card.dataset.variants;
        const variantSelect = card.querySelector('.variant-select');

        if (variantsRaw && variantSelect) {
            let variants = [];
            try { variants = JSON.parse(variantsRaw); } catch (e) { variants = []; }

            variantSelect.innerHTML = variants.map((v, i) =>
                `<option value="${i}">${v.label}</option>`
            ).join('');

            variantSelect.addEventListener('change', () => {
                applyVariant(card, variants[parseInt(variantSelect.value)]);
            });

            // Ҳолати аввалин (default)
            if (variants.length > 0) applyVariant(card, variants[0]);
        }

        // --- Интихоби таъм/ранг (масалан барои Мохито) ---
        const flavorsRaw = card.dataset.flavors;
        const flavorSelect = card.querySelector('.flavor-select');

        if (flavorsRaw && flavorSelect) {
            let flavors = [];
            try { flavors = JSON.parse(flavorsRaw); } catch (e) { flavors = []; }

            flavorSelect.innerHTML = flavors.map((f, i) =>
                `<option value="${i}">${f.label}</option>`
            ).join('');

            flavorSelect.addEventListener('change', () => {
                applyFlavor(card, flavors[parseInt(flavorSelect.value)]);
            });

            if (flavors.length > 0) applyFlavor(card, flavors[0]);
        }
    });
}

function applyVariant(card, variant) {
    if (!variant) return;

    // Нархи навро ба сифати "нархи асосӣ"-и корт менависем
    card.dataset.basePrice = variant.price;

    const weightEl = card.querySelector('.variant-weight') || card.querySelector('.weight');
    if (weightEl) weightEl.textContent = variant.weight || variant.label;

    const oldPriceEl = card.querySelector('.variant-old-price') || card.querySelector('.old-price');
    if (oldPriceEl && variant.oldPrice) oldPriceEl.textContent = parseFloat(variant.oldPrice).toFixed(2) + ' сом';

    // Аз нав ҳисоб кардани нархи намоён бо назардошти миқдори интихобшуда
    const qtyValueEl = card.querySelector('.qty-value');
    const priceDisplay = card.querySelector('.product-price');
    const qty = qtyValueEl ? parseInt(qtyValueEl.textContent) || 1 : 1;
    if (priceDisplay) {
        priceDisplay.textContent = (parseFloat(variant.price) * qty).toFixed(2) + ' сом';
    }

    card.dataset.currentVariantLabel = variant.label;
}

function applyFlavor(card, flavor) {
    if (!flavor) return;
    card.dataset.currentFlavor = flavor.value;

    // Ранги ҳошияи корт мувофиқи таъм/ранги интихобшуда тағйир меёбад
    if (flavor.color) {
        card.style.borderColor = flavor.color;
        card.style.boxShadow = `0 6px 20px ${flavor.color}33`;
    }
}

/* ============================================================ */
/* Миқдор ва Илова ба сабад (барои ҳамаи маҳсулот, аз ҷумла нав) */
/* ============================================================ */

document.querySelectorAll('.product-card').forEach(card => {
    const minusBtn = card.querySelector('.minus-btn');
    const plusBtn = card.querySelector('.plus-btn');
    const qtyValue = card.querySelector('.qty-value');
    const priceDisplay = card.querySelector('.product-price');

    let currentQty = 1;

    function refreshPrice() {
        const basePrice = parseFloat(card.dataset.basePrice) || 0;
        if (priceDisplay) priceDisplay.textContent = (basePrice * currentQty).toFixed(2) + ' сом';
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            currentQty++;
            qtyValue.textContent = currentQty;
            refreshPrice();
        });
    }

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            if (currentQty > 1) {
                currentQty--;
                qtyValue.textContent = currentQty;
                refreshPrice();
            }
        });
    }

    const addBtn = card.querySelector('.add-to-cart-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const nameElem = card.querySelector('[data-i18n^="p"]') || card.querySelector('h3');
            let name = nameElem ? nameElem.textContent : card.dataset.name;

            // Агар маҳсулот ҳаҷм дошта бошад — онро ба номаш илова мекунем
            if (card.dataset.currentVariantLabel) {
                name += ` (${card.dataset.currentVariantLabel})`;
            }
            // Агар маҳсулот таъм/ранг дошта бошад — онро низ илова мекунем
            if (card.dataset.currentFlavor) {
                name += ` — ${card.dataset.currentFlavor}`;
            }

            const basePrice = parseFloat(card.dataset.basePrice) || 0;

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += currentQty;
            } else {
                cart.push({ name, basePrice, quantity: currentQty });
            }
            updateBadge();
            
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = "Илова шуд! ✓";
            setTimeout(() => { addBtn.innerHTML = originalText; }, 1000);
        });
    }
});

function updateBadge() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) cartBadge.textContent = totalCount;
    if (cartBadgeDesktop) cartBadgeDesktop.textContent = totalCount;
}

function updateCartUI() {
    if (!cartItemsList || !modalTotalPrice) return;
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart-text" data-i18n="emptyCart">Сабади шумо холӣ аст.</p>';
        modalTotalPrice.textContent = '0.00 сом';
        updateDushanbeCityPayment(0);
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
                    <p style="margin: 0; font-size: 13px; color: #666;">${item.basePrice.toFixed(2)} сом × ${item.quantity} = ${itemTotal.toFixed(2)} сом</p>
                </div>
                <button class="remove-item-btn" onclick="removeItem(${index})">❌</button>
            </div>
        `;
    });

    cartItemsList.innerHTML = html;
    modalTotalPrice.textContent = total.toFixed(2) + ' сом';
    updateDushanbeCityPayment(total);
}

window.removeItem = function(index) {
    cart.splice(index, 1);
    updateBadge();
    updateCartUI();
}

function openDushanbeCityPay(event) {
    event.preventDefault();
    const cardNum = "872090906";
    let total = 0;
    if (cart.length > 0) {
        total = cart.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
    }
    window.open(`https://dushanbepay.tj/pay?card=${cardNum}&amount=${total.toFixed(2)}`, '_blank');
}

function updateDushanbeCityPayment(totalAmount) {
    const cardNum = "872090906";
    const dcCardPayBtn = document.getElementById('dcCardPayBtn');
    if (dcCardPayBtn) {
        dcCardPayBtn.href = `https://dushanbepay.tj/pay?card=${cardNum}&amount=${totalAmount.toFixed(2)}`;
    }

    const qrModalAmount = document.getElementById('qrModalAmount');
    if (qrModalAmount) qrModalAmount.textContent = totalAmount.toFixed(2) + ' сом';

    const qrcodeContainer = document.getElementById('qrcodeContainer');
    if (qrcodeContainer && typeof QRCode !== 'undefined') {
        qrcodeContainer.innerHTML = "";
        new QRCode(qrcodeContainer, {
            text: `https://dushanbepay.tj/pay?card=${cardNum}&amount=${totalAmount.toFixed(2)}`,
            width: 160,
            height: 160,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

const dcQrModal = document.getElementById('dcQrModal');
const openQrModalBtn = document.getElementById('openQrModalBtn');
const closeDcQr = document.querySelector('.close-dc-qr');

if (openQrModalBtn) {
    openQrModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (dcQrModal) dcQrModal.style.display = 'flex';
    });
}
if (closeDcQr) {
    closeDcQr.addEventListener('click', () => { if (dcQrModal) dcQrModal.style.display = 'none'; });
}

// Categories filter & Search
const categoryCards = document.querySelectorAll('.category-card');
const productCards = document.querySelectorAll('.product-card');
const sectionTitle = document.getElementById('sectionTitle');

categoryCards.forEach(catCard => {
    catCard.addEventListener('click', () => {
        categoryCards.forEach(c => c.classList.remove('active'));
        catCard.classList.add('active');
        const selectedCategory = catCard.dataset.category;
        if (sectionTitle) sectionTitle.textContent = catCard.querySelector('h3').textContent;

        productCards.forEach(card => {
            card.style.display = (selectedCategory === 'all' || card.dataset.category === selectedCategory) ? "block" : "none";
        });
    });
});

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
        if (emptySearchState) emptySearchState.style.display = visibleCount === 0 ? "block" : "none";
    });
}

// Dark Mode
const darkModeBtn = document.getElementById('darkModeToggle');
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        darkModeBtn.textContent = isDark ? "☀️" : "🌙";
        localStorage.setItem('dark_theme', isDark);
    });
}

// GPS
const clientAddressInput = document.getElementById('clientAddress');
const getGpsBtn = document.getElementById('getGpsBtn');
if (getGpsBtn) {
    getGpsBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            getGpsBtn.textContent = "⏳...";
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (clientAddressInput) clientAddressInput.value = `GPS: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
                    getGpsBtn.textContent = "📍 GPS";
                },
                () => { getGpsBtn.textContent = "📍 GPS"; alert('Хатогӣ дар гирифтани GPS.'); }
            );
        }
    });
}

// Save Order & Points (1 бал ба ҳар 10 сомонӣ)
function saveOrderToAdmin(clientName, clientPhone, productsSummary, totalAmount) {
    let allOrders = JSON.parse(localStorage.getItem('market_all_orders') || '[]');
    allOrders.push({ name: clientName, phone: clientPhone, products: productsSummary, date: new Date().toLocaleString() });
    localStorage.setItem('market_all_orders', JSON.stringify(allOrders));

    let addedPoints = Math.floor(totalAmount / 10);
    if (addedPoints > 0) {
        let allClients = JSON.parse(localStorage.getItem('market_all_clients') || '[]');
        let client = allClients.find(c => c.phone === clientPhone);
        if (client) {
            client.points = (client.points || 0) + addedPoints;
            localStorage.setItem('market_all_clients', JSON.stringify(allClients));
        }
    }
}

function generateOrderText() {
    if (cart.length === 0) return null;
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const address = clientAddressInput ? clientAddressInput.value.trim() : '';

    if (!name || !phone || !address) {
        alert('Лутфан майдонҳои таҳвилро пур кунед!');
        return null;
    }

    let text = `🛒 Фармоиш аз SuperMarket\n👤 Ном: ${name}\n📞 Телефон: ${phone}\n📍 Суроға: ${address}\n\n📦 Маҳсулот:\n`;
    let total = 0;
    let productsListStr = "";
    cart.forEach(item => {
        let sum = item.basePrice * item.quantity;
        total += sum;
        text += `- ${item.name} (${item.quantity} дона) — ${sum.toFixed(2)} сом\n`;
        productsListStr += `${item.name} (${item.quantity}д), `;
    });
    text += `\n💰 Ҷами умумӣ: ${total.toFixed(2)} сомонӣ`;
    saveOrderToAdmin(name, phone, productsListStr, total);
    return text;
}

const sendWhatsApp = document.getElementById('sendWhatsApp');
if (sendWhatsApp) {
    sendWhatsApp.addEventListener('click', () => {
        const text = generateOrderText();
        if (text) window.open(`https://wa.me/992900210802?text=${encodeURIComponent(text)}`, '_blank');
    });
}

// User Profile & Admin
const profileModal = document.getElementById('profileModal');
const profileModalBtn = document.getElementById('profileModalBtn');
const closeProfile = document.querySelector('.close-profile');
const authFormSection = document.getElementById('authFormSection');
const profileInfoSection = document.getElementById('profileInfoSection');
const adminPanelSection = document.getElementById('adminPanelSection');
const logoutBtn = document.getElementById('logoutBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

if (profileModalBtn) {
    profileModalBtn.addEventListener('click', () => { profileModal.style.display = 'flex'; checkUserState(); });
}
if (closeProfile) {
    closeProfile.addEventListener('click', () => { profileModal.style.display = 'none'; });
}

function checkUserState() {
    const savedSession = JSON.parse(localStorage.getItem('market_user_session'));
    if (!savedSession) { showAuthForm(); return; }
    if (savedSession.role === 'admin') { showAdminDashboard(); } 
    else { showClientCabinet(savedSession); }
}

function showAuthForm() {
    if (authFormSection) {
        authFormSection.style.display = 'block';
        authFormSection.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin-bottom: 5px;" data-i18n="authTitle">Регистратсияи Муштарӣ</h2>
                <p style="color: #64748b; font-size: 13px;" data-i18n="authDesc">Маълумот ва коди шахсии худро ворид кунед</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <input type="text" id="authName" placeholder="Номи Шумо..." data-i18n-placeholder="namePlaceholder">
                <input type="text" id="authPhone" placeholder="Рақами телефон..." data-i18n-placeholder="phonePlaceholder">
                <input type="password" id="authSecretCode" placeholder="Коди шахсии шумо (парол)...">
                <button id="saveProfileBtn" style="background: #4f46e5; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer;" data-i18n="saveProfile">Сабт ва Ворид шудан</button>
            </div>
        `;
        document.getElementById('saveProfileBtn').addEventListener('click', handleRegisterAction);
        changeLanguage(localStorage.getItem('selectedLanguage') || 'tj');
    }
    if (profileInfoSection) profileInfoSection.style.display = 'none';
    if (adminPanelSection) adminPanelSection.style.display = 'none';
}

function handleRegisterAction() {
    const name = document.getElementById('authName').value.trim();
    const phone = document.getElementById('authPhone').value.trim();
    const secretCode = document.getElementById('authSecretCode').value.trim();

    if (!name || !phone || !secretCode) { alert('Лутфан майдонҳоро пур кунед!'); return; }

    if (name === 'Muhammadjon' && phone === '900210802' && secretCode === '12mart2010admin') {
        localStorage.setItem('market_user_session', JSON.stringify({ role: 'admin', name: 'Muhammadjon', phone: '900210802' }));
        document.body.classList.remove('not-registered');
        document.querySelector('.close-profile').style.display = 'block';
        showAdminDashboard();
        return;
    }

    let allClients = JSON.parse(localStorage.getItem('market_all_clients') || '[]');
    let existing = allClients.find(c => c.phone === phone);

    if (existing) {
        if (existing.code !== secretCode) { alert('Коди шахсии шумо хато аст!'); return; }
    } else {
        allClients.push({ name, phone, code: secretCode, points: 0, date: new Date().toLocaleDateString() });
        localStorage.setItem('market_all_clients', JSON.stringify(allClients));
    }

    const userData = { role: 'client', name, phone, userId: 'USER-' + Math.floor(1000 + Math.random() * 9000) };
    localStorage.setItem('market_user_session', JSON.stringify(userData));
    document.body.classList.remove('not-registered');
    document.querySelector('.close-profile').style.display = 'block';
    showClientCabinet(userData);
}

function showClientCabinet(user) {
    if (authFormSection) authFormSection.style.display = 'none';
    if (adminPanelSection) adminPanelSection.style.display = 'none';
    if (profileInfoSection) {
        profileInfoSection.style.display = 'block';
        let allClients = JSON.parse(localStorage.getItem('market_all_clients') || '[]');
        let client = allClients.find(c => c.phone === user.phone) || { points: 0 };

        profileInfoSection.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 40px; margin-bottom: 8px;">👤</div>
                <h3 style="color: #0f172a; font-size: 20px;">${user.name}</h3>
                <p style="color: #64748b; font-size: 13px;">Рақам: ${user.phone}</p>
                <div style="margin-top: 10px; background: #fef3c7; color: #d97706; padding: 6px 12px; display: inline-block; border-radius: 20px; font-weight: bold; font-size: 13px;">
                    ⭐ Балҳои ман: ${client.points || 0} бал (1 бал = 10 сом)
                </div>
            </div>
            <button id="logoutBtn" style="width: 100%; background: #ef4444; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer;" data-i18n="logout">Баромадан</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    }
}

function showAdminDashboard() {
    if (authFormSection) authFormSection.style.display = 'none';
    if (profileInfoSection) profileInfoSection.style.display = 'none';
    if (adminPanelSection) adminPanelSection.style.display = 'block';

    renderAdminUsersTable();

    const ordersTable = document.getElementById('adminOrdersList');
    const allOrders = JSON.parse(localStorage.getItem('market_all_orders') || '[]');
    if (ordersTable) {
        ordersTable.innerHTML = allOrders.length > 0 ? allOrders.map(o => `<tr><td>${o.name}</td><td>${o.phone}</td><td>${o.products}</td><td>${o.date}</td></tr>`).join('') : `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">Ҳоло хариде нест</td></tr>`;
    }
}

function renderAdminUsersTable() {
    const clientsTable = document.getElementById('adminUsersList');
    let allClients = JSON.parse(localStorage.getItem('market_all_clients') || '[]');
    if (clientsTable) {
        clientsTable.innerHTML = allClients.length > 0 ? allClients.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.phone}</td>
                <td><strong>${c.points || 0}</strong></td>
                <td><button onclick="editClientPoints('${c.phone}')" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer;">Бал додан ➕</button></td>
            </tr>
        `).join('') : `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">Ҳоло мизоҷ нест</td></tr>`;
    }
}

window.editClientPoints = function(phone) {
    let allClients = JSON.parse(localStorage.getItem('market_all_clients') || '[]');
    let client = allClients.find(c => c.phone === phone);
    if (!client) return;
    let input = prompt(`Чанд бал ба (${client.name}) илова кунем? (Ҳозира: ${client.points || 0})`, "10");
    if (input !== null && !isNaN(input)) {
        client.points = (client.points || 0) + parseInt(input);
        localStorage.setItem('market_all_clients', JSON.stringify(allClients));
        showAdminDashboard();
        alert('Балҳо илова шуданд!');
    }
};

function handleLogout() {
    localStorage.removeItem('market_user_session');
    showAuthForm();
    alert('Шумо аз ҳисоб баромадед.');
}

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout);

// Рейтинг (Top 100)
function initRatingLogic() {
    const ratingModal = document.getElementById('ratingModal');
    const openRatingModalBtn = document.getElementById('openRatingModalBtn');
    const closeRatingModalBtn = document.getElementById('closeRatingModalBtn');

    if (openRatingModalBtn) {
        openRatingModalBtn.addEventListener('click', () => {
            if (ratingModal) { ratingModal.style.display = 'flex'; renderFullRatingModalList(); }
        });
    }
    if (closeRatingModalBtn) {
        closeRatingModalBtn.addEventListener('click', () => { if (ratingModal) ratingModal.style.display = 'none'; });
    }
}

function renderFullRatingModalList() {
    const modalListContainer = document.getElementById('topClientsModalList');
    const rankInfoText = document.getElementById('clientCurrentRankInfo');
    if (!modalListContainer) return;

    let allClients = JSON.parse(localStorage.getItem('market_all_clients') || '[]');
    allClients.sort((a, b) => (b.points || 0) - (a.points || 0));
    const top100List = allClients.slice(0, 100);

    const savedSession = JSON.parse(localStorage.getItem('market_user_session') || '{}');
    let myRank = savedSession.phone ? allClients.findIndex(c => c.phone === savedSession.phone) : -1;

    if (rankInfoText) {
        rankInfoText.innerHTML = myRank !== -1 ? `Мақоми Шумо: <b>#${myRank + 1} ҷой</b> (${allClients[myRank].points || 0} бал)` : `Шумо дар рейтинг ҳастед.`;
    }

    if (top100List.length === 0 || top100List.every(c => (c.points || 0) === 0)) {
        modalListContainer.innerHTML = `<p style="color: #94a3b8; font-size: 13px; text-align: center; padding: 20px;">Ҳоло маълумоти рейтингӣ нест.</p>`;
        return;
    }

    let html = '';
    top100List.forEach((client, index) => {
        let rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
        let badgeIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        html += `
            <div class="rating-item-card ${rankClass}">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 16px; font-weight: bold; width: 30px; text-align: center;">${badgeIcon}</span>
                    <div>
                        <strong style="font-size: 14px; display: block;">${client.name}</strong>
                        <span style="font-size: 11px; color: #64748b;">Рақам: ${client.phone}</span>
                    </div>
                </div>
                <div style="background: #4f46e5; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ⭐ ${client.points || 0} бал
                </div>
            </div>
        `;
    });
    modalListContainer.innerHTML = html;
}

// Забонҳо (Translations)
const translations = {
    tj: {
        settings: "Танзимот", selectLang: "Интихоби забон:", cart: "Сабад", searchPlaceholder: "Ҷустуҷӯи маҳсулот...",
        heroTitle: "Маҳсулоти тозаи ватанӣ,<br>Расонидани босуръат.", heroDesc: "Беҳтарин маҳсулоти хӯроквориро бо нархи дастрас харидорӣ кунед!",
        shopNow: "Харидро оғоз кунед", categoriesTitle: "Категорияҳо", allCat: "🌐 Ҳамааш", fruitsCat: "🍎 Меваҷот ва Сабзавот",
        sweetsCat: "🍪 Шириниҳо", drinksCat: "🧃 Нӯшокиҳо", groceryCat: "🍞 Маҳсулоти хӯрокворӣ", allProducts: "Ҳамаи маҳсулот",
        addToCart: "🛒 Илова ба сабад", cartTitle: "Сабади харид", emptyCart: "Сабади шумо холӣ аст.",
        total: "Ҷами умумӣ:", deliveryInfo: "Маълумот барои таҳвил", namePlaceholder: "Номи шумо...", phonePlaceholder: "Рақами телефон...",
        addressPlaceholder: "Суроғаи худро нависед...", profileTitle: "👤 Шахсият / Ҳисоби ман", 
        authTitle: "Регистратсияи Муштарӣ", authDesc: "Маълумот ва коди шахсии худро ворид кунед",
        saveProfile: "Сабт ва Ворид шудан", logout: "Баромадан", langTj: "Тоҷикӣ", langRu: "Русский", langEn: "English", langUz: "O‘zbekcha",
        dcPaymentTitle: "💳 Пардохт тавассути Dushanbe City", dcQrTitle: "Бо QR Код", dcQrDesc: "Скан кунед ва пардохт кунед",
        dcScanBtn: "Кушодан", dcCardTitle: "Картаи Душанбе Сити", dcPayBtn: "Пардохт", dcQrModalTitle: "QR Коди Dushanbe City",
        dcQrScanInfo: "Маблағ барои пардохт:", ratingBtnText: "Рейтинг", ratingTitle: "🏆 Рейтинги Пешсафон (Top 100)"
    },
    ru: {
        settings: "Настройки", selectLang: "Выберите язык:", cart: "Корзина", searchPlaceholder: "Поиск товаров...",
        heroTitle: "Свежие отечественные продукты,<br>Быстрая доставка.", heroDesc: "Покупайте лучшие продукты питания по доступным ценам!",
        shopNow: "Начать покупки", categoriesTitle: "Категории", allCat: "🌐 Все", fruitsCat: "🍎 Фрукты и Овощи",
        sweetsCat: "🍪 Сладости", drinksCat: "🧃 Напитки", groceryCat: "🍞 Продукты питания", allProducts: "Все продукты",
        addToCart: "🛒 В корзину", cartTitle: "Корзина покупок", emptyCart: "Ваша корзина пуста.",
        total: "Итого:", deliveryInfo: "Информация для доставки", namePlaceholder: "Ваше имя...", phonePlaceholder: "Номер телефона...",
        addressPlaceholder: "Введите ваш адрес...", profileTitle: "👤 Личный кабинет", 
        authTitle: "Регистрация клиента", authDesc: "Введите свои данные и секретный код",
        saveProfile: "Сохранить и войти", logout: "Выйти", langTj: "Тоҷикӣ", langRu: "Русский", langEn: "English", langUz: "O‘zbekcha",
        dcPaymentTitle: "💳 Оплата через Dushanbe City", dcQrTitle: "По QR Коду", dcQrDesc: "Сканируйте и оплачивайте",
        dcScanBtn: "Открыть", dcCardTitle: "Карта Душанбе Сити", dcPayBtn: "Оплатить", dcQrModalTitle: "QR Код Dushanbe City",
        dcQrScanInfo: "Сумма к оплате:", ratingBtnText: "Рейтинг", ratingTitle: "🏆 Рейтинг Лидеров (Top 100)"
    },
    en: {
        settings: "Settings", selectLang: "Select Language:", cart: "Cart", searchPlaceholder: "Search products...",
        heroTitle: "Fresh local products,<br>Fast delivery.", heroDesc: "Buy the best grocery products at affordable prices!",
        shopNow: "Start Shopping", categoriesTitle: "Categories", allCat: "🌐 All", fruitsCat: "🍎 Fruits & Vegetables",
        sweetsCat: "🍪 Sweets", drinksCat: "🧃 Drinks", groceryCat: "🍞 Groceries", allProducts: "All Products",
        addToCart: "🛒 Add to Cart", cartTitle: "Shopping Cart", emptyCart: "Your cart is empty.",
        total: "Total:", deliveryInfo: "Delivery Information", namePlaceholder: "Your name...", phonePlaceholder: "Phone number...",
        addressPlaceholder: "Enter your address...", profileTitle: "👤 My Profile", 
        authTitle: "Customer Registration", authDesc: "Enter your details and secret code",
        saveProfile: "Save & Sign In", logout: "Log out", langTj: "Тоҷикӣ", langRu: "Русский", langEn: "English", langUz: "O‘zbekcha",
        dcPaymentTitle: "💳 Pay via Dushanbe City", dcQrTitle: "By QR Code", dcQrDesc: "Scan and pay",
        dcScanBtn: "Open", dcCardTitle: "Dushanbe City Card", dcPayBtn: "Pay", dcQrModalTitle: "Dushanbe City QR Code",
        dcQrScanInfo: "Amount to pay:", ratingBtnText: "Rating", ratingTitle: "🏆 Top Leaders (Top 100)"
    },
    uz: {
        settings: "Sozlamalar", selectLang: "Tilni tanlang:", cart: "Savat", searchPlaceholder: "Mahsulotlarni qidirish...",
        heroTitle: "Yangi mahalliy mahsulotlar,<br>Tezkor yetkazib berish.", heroDesc: "Eng yaxshi oziq-ovqat mahsulotlarini hamyonbop narxlarda xarid qiling!",
        shopNow: "Xaridni boshlash", categoriesTitle: "Kategoriyalar", allCat: "🌐 Hammasi", fruitsCat: "🍎 Mevalar va Sabzavotlar",
        sweetsCat: "🍪 Shirinliklar", drinksCat: "🧃 Ichimliklar", groceryCat: "🍞 Oziq-ovqat", allProducts: "Barcha mahsulotlar",
        addToCart: "🛒 Savatga qo'shish", cartTitle: "Savat", emptyCart: "Savatgiz bo'sh.",
        total: "Jami:", deliveryInfo: "Yetkazib berish uchun ma'lumot", namePlaceholder: "Ismingiz...", phonePlaceholder: "Telefon raqam...",
        addressPlaceholder: "Manzilingizni kiriting...", profileTitle: "👤 Shaxsiy kabinet", 
        authTitle: "Mijozni ro'yxatdan o'tkazish", authDesc: "Ma'lumotlaringiz va maxfiy kuningizni kiriting",
        saveProfile: "Saqlash va kirish", logout: "Chiqish", langTj: "Тоҷикӣ", langRu: "Русский", langEn: "English", langUz: "O‘zbekcha",
        dcPaymentTitle: "💳 Dushanbe City orqali to'lov", dcQrTitle: "QR Kod orqali", dcQrDesc: "Skanerlang va to'lang",
        dcScanBtn: "Ochish", dcCardTitle: "Dushanbe City Karti", dcPayBtn: "To'lash", dcQrModalTitle: "Dushanbe City QR Kodi",
        dcQrScanInfo: "To'lov summasi:", ratingBtnText: "Reyting", ratingTitle: "🏆 Yetakchilar Reytingi (Top 100)"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.getAttribute("data-i18n-placeholder");
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) settingsModal.style.display = 'none';
}

const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettings = document.querySelector('.close-settings');

if (settingsBtn) settingsBtn.addEventListener('click', () => { settingsModal.style.display = 'flex'; });
if (closeSettings) closeSettings.addEventListener('click', () => { settingsModal.style.display = 'none'; });

window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'tj';
    changeLanguage(savedLang);

    // ★ Роҳандозии интихоби ҳаҷм ва таъм/ранг барои маҳсулоти нав
    setupVariantsAndFlavors();

    if (localStorage.getItem('dark_theme') === 'true') {
        document.body.classList.add('dark-theme');
        const darkModeBtn = document.getElementById('darkModeToggle');
        if (darkModeBtn) darkModeBtn.textContent = "☀️";
    }

    initRatingLogic();

    const savedSession = JSON.parse(localStorage.getItem('market_user_session'));
    const profileModal = document.getElementById('profileModal');
    const closeProfileBtn = document.querySelector('.close-profile');
    
    if (!savedSession) {
        if (closeProfileBtn) closeProfileBtn.style.display = 'none';
        if (profileModal) profileModal.style.display = 'flex';
        document.body.classList.add('not-registered');
        checkUserState();
    } else {
        if (closeProfileBtn) closeProfileBtn.style.display = 'block';
        document.body.classList.remove('not-registered');
        checkUserState();
    }
});
// Пайваст кардани кнопкаи рейтинги меню ба модал
document.addEventListener('DOMContentLoaded', () => {
    const drawerRating = document.getElementById('drawerRating');
    const ratingModal = document.getElementById('ratingModal');
    const sideDrawer = document.getElementById('sideDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');

    if (drawerRating) {
        drawerRating.addEventListener('click', (e) => {
            e.preventDefault();
            // Менюи паҳлӯиро мепӯширад
            if (sideDrawer) sideDrawer.classList.remove('active');
            if (drawerOverlay) drawerOverlay.classList.remove('active');
            
            // Модали рейтингро мекушояд
            if (ratingModal) {
                ratingModal.style.display = 'flex';
            }
        });
    }
});
// --- ФУНКСИЯИ РЕГИСТРАТСИЯИ КУРЬЕР ---
function registerCourier(e) {
if (e) e.preventDefault();

// Гирифтани маълумот аз input-ҳо  
const name = document.getElementById('courierRegName').value.trim();  
const surname = document.getElementById('courierRegSurname').value.trim();  
const phone = document.getElementById('courierRegPhone').value.trim();  
const address = document.getElementById('courierRegAddress').value.trim();  
const age = document.getElementById('courierRegAge').value.trim();  
const password = document.getElementById('courierRegPass').value.trim();  

// Гирифтани базаи корбарон аз localStorage  
let users = JSON.parse(localStorage.getItem('shop_users')) || [];  
  
// Санҷиши мавҷуд будани рақам  
if (users.find(u => u.phone === phone)) {  
    alert("Ин рақами телефон аллакай ба қайд гирифта шудааст!");  
    return;  
}  

// Сохтани объекти курьер  
const newCourier = {  
    id: Date.now(), // ID-и беназир  
    name: `${name} ${surname}`,  
    phone: phone,  
    address: address,  
    age: age,  
    password: password,  
    role: "courier",  
    status: "pending", // Дар интизори санҷиши Админ  
    approved: false    // То тасдиқи админ дастрасӣ надорад  
};  

// Захира кардан дар localStorage  
users.push(newCourier);  
localStorage.setItem('shop_users', JSON.stringify(users));  
// Отправка уведомления в Telegram админу
    const token = "8255937787:AAHz4_F47ogwah3g75Jt_eFDy_0K0DgGngE";
const chatId = "6121488024";
    const text = `🚨 Новая заявка курьера!\n👤 Имя: ${name} ${surname}\n📞 Телефон: ${phone}\n📍 Адрес: ${address}`;
    
    fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=` + encodeURIComponent(text))
        .catch(err => console.log("Ошибка отправки в Telegram:", err));
alert("Дархости шумо барои курьер шудан бомуваффақият фиристода шуд!\nПас аз тасдиқи Админ шумо метавонед ворид шавед.");  
  
// Пӯшидани модал (агар функцияи closeAuthModal мавҷуд бошад)  
if (typeof closeAuthModal === 'function') {  
    closeAuthModal();  
}

}
// Функция открытия/закрытия чата
function openChatModal() {
    document.getElementById('chatModal').style.display = 'block';
}
function closeChatModal() {
    document.getElementById('chatModal').style.display = 'none';
}

// Отправка текстового сообщения
function sendTextMessage() {
    const input = document.getElementById('chatMessageInput');
    const text = input.value.trim();
    if (!text) return;

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `<div style="align-self: flex-end; background: #4f46e5; color: white; padding: 8px 12px; border-radius: 8px; max-width: 70%; word-break: break-word; margin-bottom: 5px;">${text}</div>`;
    
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Отправка фото (видео заблокировано через accept="image/*")
function sendPhotoMessage(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка, что это точно картинка
    if (!file.type.startsWith('image/')) {
        alert("Разрешено отправлять только изображения!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML += `
            <div style="align-self: flex-end; background: #4f46e5; color: white; padding: 6px; border-radius: 8px; max-width: 70%;">
                <img src="${e.target.result}" style="max-width: 100%; border-radius: 6px; display: block;">
            </div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // сброс инпута
}
function sendOrderToChat() {
    // Гирифтани маълумот аз майдонҳои форма
    const nameInput = document.querySelector('input[placeholder*="Ном"]') || document.getElementById('deliveryName');
    const phoneInput = document.querySelector('input[placeholder*="Телефон"]') || document.getElementById('deliveryPhone');
    const gpsInput = document.querySelector('input[placeholder*="GPS"]') || document.getElementById('deliveryGps');

    const name = nameInput ? nameInput.value : "Номаълум";
    const phone = phoneInput ? phoneInput.value : "Телефон нест";
    const gps = gpsInput ? gpsInput.value : "GPS нест";

    // Тайёр кардани матни паём
    const orderMessage = `🛒 Фармоиши нав:\n👤 Ном: ${name}\n📞 Тел: ${phone}\n📍 Ҷойгиршавӣ (GPS): ${gps}`;

    // Намоиш додани паём дар чат
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML += `<div style="background: #e5e7eb; padding: 10px; border-radius: 8px; margin: 5px 0; color: #333;">${orderMessage}</div>`;
    }

    // Кушодани равзанаи чат
    if (typeof openChatModal === 'function') {
        openChatModal();
    }

    alert("Маълумот бо муваффақият ба чати админ фиристода шуд!");
}
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Рақами корт нусхабардорӣ шуд: " + text);
    }).catch(err => {
        console.error('Хатогӣ дар нусхабардорӣ: ', err);
    });
}
function openDushanbeCity() {
    // Нусхабардории рақам ҳангоми пахши тугма
    copyToClipboard('872090906');
    
    // Кӯшиши кушодани барнома
    window.location.href = "intent://dushanbe.city#Intent;scheme=dushanbepay;package=tj.dushanbepay.app;end";
    
    // Агар кор накунад, хабар медиҳем
    setTimeout(() => {
        alert("Рақам нусхабардорӣ шуд! Лутфан барномаи 'Душанбе Сити'-ро кушоед ва рақамро ворид кунед.");
    }, 500);
}