let cart = [];

const cartBadge = document.getElementById('cartBadge');
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
        const savedUser = JSON.parse(localStorage.getItem('supermarketUser'));
        if (savedUser) {
            const clientNameElem = document.getElementById('clientName');
            const clientPhoneElem = document.getElementById('clientPhone');
            if (clientNameElem) clientNameElem.value = savedUser.name || '';
            if (clientPhoneElem) clientPhoneElem.value = savedUser.phone || '';
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

// Пӯшидани модалҳо ҳангоми пахш дар берун
window.addEventListener('click', (e) => { 
    if (e.target === cartModal) cartModal.style.display = 'none';
    const profileModal = document.getElementById('profileModal');
    if (e.target === profileModal) profileModal.style.display = 'none';
    const settingsModal = document.getElementById('settingsModal');
    if (e.target === settingsModal) settingsModal.style.display = 'none';
    const dcQrModal = document.getElementById('dcQrModal');
    if (e.target === dcQrModal) dcQrModal.style.display = 'none';
});

// Менюи Гамбургер
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

if (closeDrawer) {
    closeDrawer.addEventListener('click', () => {
        sideDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
    });
}

if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => {
        sideDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
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

// Плюс ва минус кардани маҳсулот дар карточкаҳо
document.querySelectorAll('.product-card').forEach(card => {
    const minusBtn = card.querySelector('.minus-btn');
    const plusBtn = card.querySelector('.plus-btn');
    const qtyValue = card.querySelector('.qty-value');
    const priceDisplay = card.querySelector('.product-price');
    const basePrice = parseFloat(card.dataset.basePrice);

    let currentQty = 1;

    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            currentQty++;
            qtyValue.textContent = currentQty;
            priceDisplay.textContent = (basePrice * currentQty).toFixed(2) + ' сом';
        });
    }

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            if (currentQty > 1) {
                currentQty--;
                qtyValue.textContent = currentQty;
                priceDisplay.textContent = (basePrice * currentQty).toFixed(2) + ' сом';
            }
        });
    }

    const addBtn = card.querySelector('.add-to-cart-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const nameElem = card.querySelector('[data-i18n^="p"]');
            const name = nameElem ? nameElem.textContent : card.dataset.name;
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
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                <div>
                    <strong>${item.name}</strong>
                    <p style="margin: 0; font-size: 13px; color: #666;">${item.basePrice} сом × ${item.quantity} = ${itemTotal.toFixed(2)} сом</p>
                </div>
                <button class="remove-item-btn" onclick="removeItem(${index})" style="background: none; border: none; cursor: pointer; font-size: 16px;">❌</button>
            </div>
        `;
    });

    cartItemsList.innerHTML = html;
    modalTotalPrice.textContent = total.toFixed(2) + ' сом';
    
    // Навсозии маблағ ва QR-коди Душанбе Сити
    updateDushanbeCityPayment(total);
}

window.removeItem = function(index) {
    cart.splice(index, 1);
    updateBadge();
    updateCartUI();
}

// Системаи пардохти Dushanbe City ва QR Код
function updateDushanbeCityPayment(totalAmount) {
    const cardNum = "872090906";
    
    const dcCardPayBtn = document.getElementById('dcCardPayBtn');
    if (dcCardPayBtn) {
        dcCardPayBtn.href = `https://dushanbepay.tj/pay?card=${cardNum}&amount=${totalAmount}`;
    }

    const qrModalAmount = document.getElementById('qrModalAmount');
    if (qrModalAmount) {
        qrModalAmount.textContent = totalAmount.toFixed(2) + ' сом';
    }

    const qrcodeContainer = document.getElementById('qrcodeContainer');
    if (qrcodeContainer && typeof QRCode !== 'undefined') {
        qrcodeContainer.innerHTML = "";
        const qrData = `DUSHANBECITY:CARD=${cardNum};AMOUNT=${totalAmount.toFixed(2)}`;
        
        new QRCode(qrcodeContainer, {
            text: qrData,
            width: 160,
            height: 160,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Кушодани модали QR Код
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
    closeDcQr.addEventListener('click', () => {
        if (dcQrModal) dcQrModal.style.display = 'none';
    });
}

// Категорияҳо ва Филтр
const categoryCards = document.querySelectorAll('.category-card');
const productCards = document.querySelectorAll('.product-card');
const sectionTitle = document.getElementById('sectionTitle');

categoryCards.forEach(catCard => {
    catCard.addEventListener('click', () => {
        categoryCards.forEach(c => c.classList.remove('active'));
        catCard.classList.add('active');

        const selectedCategory = catCard.dataset.category;
        if (sectionTitle) {
            sectionTitle.textContent = catCard.querySelector('h3').textContent;
        }

        productCards.forEach(card => {
            if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// Ҷустуҷӯ (Search)
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

        if (emptySearchState) {
            emptySearchState.style.display = visibleCount === 0 ? "block" : "none";
        }
    });
}

// Режими торик (Dark Mode)
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
                    if (clientAddressInput) clientAddressInput.value = `GPS: https://maps.google.com/?q=${lat},${lon}`;
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

// Генерацияи матни фармоиш
function generateOrderText() {
    if (cart.length === 0) return null;
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const address = clientAddressInput ? clientAddressInput.value.trim() : '';

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

const sendWhatsApp = document.getElementById('sendWhatsApp');
if (sendWhatsApp) {
    sendWhatsApp.addEventListener('click', () => {
        const text = generateOrderText();
        if (!text) return;
        window.open(`https://wa.me/992900210802?text=${encodeURIComponent(text)}`, '_blank');
    });
}

const sendTelegram = document.getElementById('sendTelegram');
if (sendTelegram) {
    sendTelegram.addEventListener('click', () => {
        const text = generateOrderText();
        if (!text) return;
        window.open(`https://t.me/Amirshoev_2010?text=${encodeURIComponent(text)}`, '_blank');
    });
}

// Бахши Профил / Шахсият
const profileModal = document.getElementById('profileModal');
const profileModalBtn = document.getElementById('profileModalBtn');
const closeProfile = document.querySelector('.close-profile');
const authFormSection = document.getElementById('authFormSection');
const profileInfoSection = document.getElementById('profileInfoSection');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplayName = document.getElementById('userDisplayName');
const userDisplayPhone = document.getElementById('userDisplayPhone');

if (profileModalBtn) {
    profileModalBtn.addEventListener('click', () => {
        profileModal.style.display = 'flex';
        checkUserState();
    });
}

if (closeProfile) {
    closeProfile.addEventListener('click', () => { profileModal.style.display = 'none'; });
}

function checkUserState() {
    const savedUser = JSON.parse(localStorage.getItem('supermarketUser'));
    if (savedUser) {
        if (authFormSection) authFormSection.style.display = 'none';
        if (profileInfoSection) profileInfoSection.style.display = 'block';
        if (userDisplayName) userDisplayName.textContent = savedUser.name;
        if (userDisplayPhone) userDisplayPhone.textContent = savedUser.phone;
    } else {
        if (authFormSection) authFormSection.style.display = 'block';
        if (profileInfoSection) profileInfoSection.style.display = 'none';
    }
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
        const name = document.getElementById('authName').value.trim();
        const phone = document.getElementById('authPhone').value.trim();

        if (!name || !phone) {
            alert('Лутфан ном ва рақами телефонро ворид кунед!');
            return;
        }

        const userData = { name, phone };
        localStorage.setItem('supermarketUser', JSON.stringify(userData));
        checkUserState();
        alert('Маълумоти шумо бомуваффақият сабт шуд!');
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('supermarketUser');
        const authNameElem = document.getElementById('authName');
        const authPhoneElem = document.getElementById('authPhone');
        if (authNameElem) authNameElem.value = '';
        if (authPhoneElem) authPhoneElem.value = '';
        checkUserState();
    });
}

// Тарҷумаи забонҳо
const translations = {
    tj: {
        settings: "Танзимот", selectLang: "Интихоби забон:", cart: "Сабад", searchPlaceholder: "Ҷустуҷӯи маҳсулот...",
        heroTitle: "Маҳсулоти тозаи ватанӣ,<br>Расонидани босуръат.", heroDesc: "Беҳтарин маҳсулоти хӯроквориро бо нархи дастрас харидорӣ кунед!",
        shopNow: "Харидро оғоз кунед", categoriesTitle: "Категорияҳо", allCat: "🌐 Ҳамааш", fruitsCat: "🍎 Меваҷот ва Сабзавот",
        sweetsCat: "🍪 Шириниҳо", drinksCat: "🧃 Нӯшокиҳо", groceryCat: "🍞 Маҳсулоти хӯрокворӣ", allProducts: "Ҳамаи маҳсулот",
        contactUs: "📞 Тамос", addToCart: "🛒 Илова ба сабад", cartTitle: "Сабади харид", emptyCart: "Сабади шумо холӣ аст.",
        total: "Ҷами умумӣ:", deliveryInfo: "Маълумот барои таҳвил", namePlaceholder: "Номи шумо...", phonePlaceholder: "Рақами телефон...",
        addressPlaceholder: "Суроғаи худро нависед...", profileTitle: "👤 Шахсият / Ҳисоби ман", authDesc: "Барои сабти ном ё ворид шудан маълумоти худро ворид кунед:",
        saveProfile: "Сабт кардан", logout: "Баромадан", langTj: "Тоҷикӣ", langRu: "Русский", langEn: "English", langUz: "O‘zbekcha",
        dcPaymentTitle: "💳 Пардохт тавассути Dushanbe City", dcQrTitle: "Бо QR Код", dcQrDesc: "Скан кунед ва пардохт кунед",
        dcScanBtn: "Кушодан", dcCardTitle: "Картаи Душанбе Сити", dcPayBtn: "Пардохт", dcQrModalTitle: "QR Коди Dushanbe City",
        dcQrScanInfo: "Маблағ барои пардохт:",
        p1: "Себи Соҳилӣ", w1: "1 кг", p2: "Нони Фатири Тоҷикӣ", w2: "1 дона", p3: "Наботи Асли Хуҷанд", w3: "500 г",
        p4: "Оби Маъдании Сиёма", w4: "1.5 литр", p5: "Бананҳои тоза", w5: "1 кг", p6: "Помидори сабзавот", w6: "1 кг",
        p7: "Бодиринг", w7: "1 кг", p8: "Картошка", w8: "1 кг", p9: "Пиёз", w9: "1 кг", p10: "Шир (1 литр)", w10: "1 л",
        p11: "Қаймоқ", w11: "400 г", p12: "Тухм (1 дона)", w12: "1 дона", p13: "Равғани офтобпараст", w13: "1 л",
        p14: "Орд (1 кг)", w14: "1 кг", p15: "Шакар", w15: "1 кг", p16: "Чои сабз", w16: "100 г", p17: "Чои сиёҳ", w17: "100 г",
        p18: "Шоколад", w18: "1 дона", p19: "Печенье", w19: "300 г", p20: "Лимон", w20: "1 кг"
    },
    ru: {
        settings: "Настройки", selectLang: "Выберите язык:", cart: "Корзина", searchPlaceholder: "Поиск товаров...",
        heroTitle: "Свежие отечественные продукты,<br>Быстрая доставка.", heroDesc: "Покупайте лучшие продукты питания по доступным ценам!",
        shopNow: "Начать покупки", categoriesTitle: "Категории", allCat: "🌐 Все", fruitsCat: "🍎 Фрукты и Овощи",
        sweetsCat: "🍪 Сладости", drinksCat: "🧃 Напитки", groceryCat: "🍞 Продукты питания", allProducts: "Все продукты",
        contactUs: "📞 Контакты", addToCart: "🛒 В корзину", cartTitle: "Корзина покупок", emptyCart: "Ваша корзина пуста.",
        total: "Итого:", deliveryInfo: "Информация для доставки", namePlaceholder: "Ваше имя...", phonePlaceholder: "Номер телефона...",
        addressPlaceholder: "Введите ваш адрес...", profileTitle: "👤 Личный кабинет", authDesc: "Введите свои данные для входа или регистрации:",
        saveProfile: "Сохранить", logout: "Выйти", langTj: "Тоҷикӣ", langRu: "Русский", langEn: "English", langUz: "O‘zbekcha",
        dcPaymentTitle: "💳 Оплата через Dushanbe City", dcQrTitle: "По QR Коду", dcQrDesc: "Сканируйте и оплачивайте",
        dcScanBtn: "Открыть", dcCardTitle: "Карта Душанбе Сити", dcPayBtn: "Оплатить", dcQrModalTitle: "QR Код Dushanbe City",
        dcQrScanInfo: "Сумма к оплате:",
        p1: "Яблоко Береговое", w1: "1 кг", p2: "Таджикская лепешка", w2: "1 шт", p3: "Набот Худжандский", w3: "500 г",
        p4: "Минеральная вода Сиёма", w4: "1.5 литра", p5: "Свежие бананы", w5: "1 кг", p6: "Помидоры", w6: "1 кг",
        p7: "Огурцы", w7: "1 кг", p8: "Картофель", w8: "1 кг", p9: "Лук", w9: "1 кг", p10: "Молоко (1 литр)", w10: "1 л",
        p11: "Каймак (Сливки)", w11: "400 г", p12: "Яйцо (1 шт)", w12: "1 шт", p13: "Подсолнечное масло", w13: "1 л",
        p14: "Мука (1 кг)", w14: "1 кг", p15: "Сахар", w15: "1 кг", p16: "Зеленый чай", w16: "100 г", p17: "Черный чай", w17: "100 г",
        p18: "Шоколад", w18: "1 шт", p19: "Печенье", w19: "300 г", p20: "Лимон", w20: "1 кг"
    },
    en: {
        settings: "Settings", selectLang: "Select Language:", cart: "Cart", searchPlaceholder: "Search products...",
        heroTitle: "Fresh local products,<br>Fast delivery.", heroDesc: "Buy the best grocery products at affordable prices!",
        shopNow: "Start Shopping", categoriesTitle: "Categories", allCat: "🌐 All", fruitsCat: "🍎 Fruits & Vegetables",
        sweetsCat: "🍪 Sweets", drinksCat: "🧃 Drinks", groceryCat: "🍞 Groceries", allProducts: "All Products",
        contactUs: "📞 Contact", addToCart: "🛒 Add to Cart", cartTitle: "Shopping Cart", emptyCart: "Your cart is empty.",
        total: "Total:", deliveryInfo: "Delivery Information", namePlaceholder: "Your name...", phonePlaceholder: "Phone number...",
        addressPlaceholder: "Enter your address...", profileTitle: "👤 My Profile", authDesc: "Enter your details to sign in or register:",
        saveProfile: "Save", logout: "Log out", langTj: "Тоҷикӣ", langRu: "Русский", langEn: "English", langUz: "O‘zbekcha",
        dcPaymentTitle: "💳 Pay via Dushanbe City", dcQrTitle: "By QR Code", dcQrDesc: "Scan and pay",
        dcScanBtn: "Open", dcCardTitle: "Dushanbe City Card", dcPayBtn: "Pay", dcQrModalTitle: "Dushanbe City QR Code",
        dcQrScanInfo: "Amount to pay:",
        p1: "Coastal Apple", w1: "1 kg", p2: "Tajik Flatbread", w2: "1 pcs", p3: "Khujand Nabot", w3: "500 g",
        p4: "Siyoma Mineral Water", w4: "1.5 liters", p5: "Fresh Bananas", w5: "1 kg", p6: "Tomatoes", w6: "1 kg",
        p7: "Cucumbers", w7: "1 kg", p8: "Potatoes", w8: "1 kg", p9: "Onion", w9: "1 kg", p10: "Milk (1 liter)", w10: "1 L",
        p11: "Kaymak", w11: "400 g", p12: "Egg (1 pcs)", w12: "1 pcs", p13: "Sunflower Oil", w13: "1 L",
        p14: "Flour (1 kg)", w14: "1 kg", p15: "Sugar", w15: "1 kg", p16: "Green Tea", w16: "100 g", p17: "Black Tea", w17: "100 g",
        p18: "Chocolate", w18: "1 pcs", p19: "Cookies", w19: "300 g", p20: "Lemon", w20: "1 kg"
    },
    uz: {
        settings: "Sozlamalar", selectLang: "Tilni tanlang:", cart: "Savat", searchPlaceholder: "Mahsulotlarni qidirish...",
        heroTitle: "Yangi mahalliy mahsulotlar,<br>Tezkor yetkazib berish.", heroDesc: "Eng yaxshi oziq-ovqat mahsulotlarini hamyonbop narxlarda xarid qiling!",
        shopNow: "Xaridni boshlash", categoriesTitle: "Kategoriyalar", allCat: "🌐 Hammasi", fruitsCat: "🍎 Mevalar va Sabzavotlar",
        sweetsCat: "🍪 Shirinliklar", drinksCat: "🧃 Ichimliklar", groceryCat: "🍞 Oziq-ovqat", allProducts: "Barcha mahsulotlar",
        contactUs: "📞 Aloqa", addToCart: "🛒 Savatga qo'shish", cartTitle: "Savat", emptyCart: "Savatgiz bo'sh.",
        total: "Jami:", deliveryInfo: "Yetkazib berish uchun ma'lumot", namePlaceholder: "Ismingiz...", phonePlaceholder: "Telefon raqam...",
        addressPlaceholder: "Manzilingizni kiriting...", profileTitle: "👤 Shaxsiy kabinet", authDesc: "Kirish yoki ro'yxatdan o'tish uchun ma'lumotlaringizni kiriting:",
        saveProfile: "Saqlash", logout: "Chiqish", langTj: "Тоҷикӣ", langRu: "Русский", langEn: "English", langUz: "O‘zbekcha",
        dcPaymentTitle: "💳 Dushanbe City orqali to'lov", dcQrTitle: "QR Kod orqali", dcQrDesc: "Skanerlang va to'lang",
        dcScanBtn: "Ochish", dcCardTitle: "Dushanbe City Karti", dcPayBtn: "To'lash", dcQrModalTitle: "Dushanbe City QR Kodi",
        dcQrScanInfo: "To'lov summasi:",
        p1: "Qirg'oq olmasi", w1: "1 kg", p2: "Tojik noni", w2: "1 dona", p3: "Xo'jand naboti", w3: "500 g",
        p4: "Siyoma mineral suvi", w4: "1.5 litr", p5: "Yangi bananlar", w5: "1 kg", p6: "Pomidor", w6: "1 kg",
        p7: "Bodring", w7: "1 kg", p8: "Kartoshka", w8: "1 kg", p9: "Piyoz", w9: "1 kg", p10: "Sut (1 litr)", w10: "1 l",
        p11: "Qaymoq", w11: "400 g", p12: "Tuxum (1 dona)", w12: "1 dona", p13: "O'simlik yog'i", w13: "1 l",
        p14: "Un (1 kg)", w14: "1 kg", p15: "Shakar", w15: "1 kg", p16: "Yashil choy", w16: "100 g",
        p17: "Qora choy", w17: "100 g", p18: "Shokolad", w18: "1 dona", p19: "Pechenьe", w19: "300 g", p20: "Limon", w20: "1 kg"
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
    if (settingsModal) {
        settingsModal.style.display = 'none';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'tj';
    changeLanguage(savedLang);
});

const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettings = document.querySelector('.close-settings');

if (settingsBtn) {
    settingsBtn.addEventListener('click', () => { settingsModal.style.display = 'flex'; });
}

if (closeSettings) {
    closeSettings.addEventListener('click', () => { settingsModal.style.display = 'none'; });
}