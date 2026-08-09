let cart = [];

const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const cartModalBtn = document.getElementById('cartModalBtn');
const closeModal = document.querySelector('.close-modal');
const cartItemsList = document.getElementById('cartItemsList');
const modalTotalPrice = document.getElementById('modalTotalPrice');

cartModalBtn.addEventListener('click', () => { 
    cartModal.style.display = 'block'; 
    updateCartUI(); 
    const savedUser = JSON.parse(localStorage.getItem('supermarketUser'));
    if (savedUser) {
        document.getElementById('clientName').value = savedUser.name || '';
        document.getElementById('clientPhone').value = savedUser.phone || '';
    }
});

closeModal.addEventListener('click', () => { cartModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.style.display = 'none'; });

// Менюи Гамбургер (Се полоска)
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
        document.getElementById('profileModal').style.display = 'block';
        checkUserState();
    });
}

if (drawerSettings) {
    drawerSettings.addEventListener('click', (e) => {
        e.preventDefault();
        sideDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
        document.getElementById('settingsModal').style.display = 'block';
    });
}

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
        cartItemsList.innerHTML = '<p class="empty-cart-text" data-i18n="emptyCart">Сабади шумо холӣ аст.</p>';
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

const darkModeBtn = document.getElementById('darkModeToggle');
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        darkModeBtn.textContent = document.body.classList.contains('dark-theme') ? "☀️" : "🌙";
    });
}

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
        profileModal.style.display = 'block';
        checkUserState();
    });
}

if (closeProfile) {
    closeProfile.addEventListener('click', () => { profileModal.style.display = 'none'; });
}

window.addEventListener('click', (e) => {
    if (e.target === profileModal) profileModal.style.display = 'none';
});

function checkUserState() {
    const savedUser = JSON.parse(localStorage.getItem('supermarketUser'));
    if (savedUser) {
        authFormSection.style.display = 'none';
        profileInfoSection.style.display = 'block';
        userDisplayName.textContent = savedUser.name;
        userDisplayPhone.textContent = savedUser.phone;
    } else {
        authFormSection.style.display = 'block';
        profileInfoSection.style.display = 'none';
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
        document.getElementById('authName').value = '';
        document.getElementById('authPhone').value = '';
        checkUserState();
    });
}

const translations = {
    tj: {
        settings: "Танзимот",
        selectLang: "Интихоби забон:",
        cart: "Сабад",
        searchPlaceholder: "Ҷустуҷӯи маҳсулот...",
        heroTitle: "Маҳсулоти тозаи ватанӣ,<br>Расонидани босуръат.",
        heroDesc: "Беҳтарин маҳсулоти хӯроквориро бо нархи дастрас харидорӣ кунед!",
        shopNow: "Харидро оғоз кунед",
        categoriesTitle: "Категорияҳо",
        allCat: "🌐 Ҳамааш",
        fruitsCat: "🍎 Меваҷот ва Сабзавот",
        sweetsCat: "🍪 Шириниҳо",
        drinksCat: "🧃 Нӯшокиҳо",
        groceryCat: "🍞 Маҳсулоти хӯрокворӣ",
        allProducts: "Ҳамаи маҳсулот",
        addToCart: "🛒 Илова ба сабад",
        cartTitle: "Сабади харид",
        emptyCart: "Сабади шумо холӣ аст.",
        total: "Ҷами умумӣ:",
        deliveryInfo: "Маълумот барои таҳвил",
        namePlaceholder: "Номи шумо...",
        phonePlaceholder: "Рақами телефон...",
        addressPlaceholder: "Суроғаи худро нависед...",
        profileTitle: "👤 Шахсият / Ҳисоби ман",
        authDesc: "Барои сабти ном ё ворид шудан маълумоти худро ворид кунед:",
        saveProfile: "Сабт кардан",
        logout: "Баромадан"
    },
    ru: {
        settings: "Настройки",
        selectLang: "Выберите язык:",
        cart: "Корзина",
        searchPlaceholder: "Поиск товаров...",
        heroTitle: "Свежие отечественные продукты,<br>Быстрая доставка.",
        heroDesc: "Покупайте лучшие продукты питания по доступным ценам!",
        shopNow: "Начать покупки",
        categoriesTitle: "Категории",
        allCat: "🌐 Все",
        fruitsCat: "🍎 Фрукты и Овощи",
        sweetsCat: "🍪 Сладости",
        drinksCat: "🧃 Напитки",
        groceryCat: "🍞 Продукты питания",
        allProducts: "Все продукты",
        addToCart: "🛒 В корзину",
        cartTitle: "Корзина покупок",
        emptyCart: "Ваша корзина пуста.",
        total: "Итого:",
        deliveryInfo: "Информация для доставки",
        namePlaceholder: "Ваше имя...",
        phonePlaceholder: "Номер телефона...",
        addressPlaceholder: "Введите ваш адрес...",
        profileTitle: "👤 Личный кабинет",
        authDesc: "Введите свои данные для входа или регистрации:",
        saveProfile: "Сохранить",
        logout: "Выйти"
    },
    en: {
        settings: "Settings",
        selectLang: "Select Language:",
        cart: "Cart",
        searchPlaceholder: "Search products...",
        heroTitle: "Fresh local products,<br>Fast delivery.",
        heroDesc: "Buy the best grocery products at affordable prices!",
        shopNow: "Start Shopping",
        categoriesTitle: "Categories",
        allCat: "🌐 All",
        fruitsCat: "🍎 Fruits & Vegetables",
        sweetsCat: "🍪 Sweets",
        drinksCat: "🧃 Drinks",
        groceryCat: "🍞 Groceries",
        allProducts: "All Products",
        addToCart: "🛒 Add to Cart",
        cartTitle: "Shopping Cart",
        emptyCart: "Your cart is empty.",
        total: "Total:",
        deliveryInfo: "Delivery Information",
        namePlaceholder: "Your name...",
        phonePlaceholder: "Phone number...",
        addressPlaceholder: "Enter your address...",
        profileTitle: "👤 My Profile",
        authDesc: "Enter your details to sign in or register:",
        saveProfile: "Save",
        logout: "Log out"
    },
    uz: {
        settings: "Sozlamalar",
        selectLang: "Tilni tanlang:",
        cart: "Savat",
        searchPlaceholder: "Mahsulotlarni qidirish...",
        heroTitle: "Yangi mahalliy mahsulotlar,<br>Tezkor yetkazib berish.",
        heroDesc: "Eng yaxshi oziq-ovqat mahsulotlarini hamyonbop narxlarda xarid qiling!",
        shopNow: "Xaridni boshlash",
        categoriesTitle: "Kategoriyalar",
        allCat: "🌐 Hammasi",
        fruitsCat: "🍎 Mevalar va Sabzavotlar",
        sweetsCat: "🍪 Shirinliklar",
        drinksCat: "🧃 Ichimliklar",
        groceryCat: "🍞 Oziq-ovqat",
        allProducts: "Barcha mahsulotlar",
        addToCart: "🛒 Savatga qo'shish",
        cartTitle: "Savat",
        emptyCart: "Savatgiz bo'sh.",
        total: "Jami:",
        deliveryInfo: "Yetkazib berish uchun ma'lumot",
        namePlaceholder: "Ismingiz...",
        phonePlaceholder: "Telefon raqam...",
        addressPlaceholder: "Manzilingizni kiriting...",
        profileTitle: "👤 Shaxsiy kabinet",
        authDesc: "Kirish yoki ro'yxatdan o'tish uchun ma'lumotlaringizni kiriting:",
        saveProfile: "Saqlash",
        logout: "Chiqish"
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
    settingsBtn.addEventListener('click', () => { settingsModal.style.display = 'block'; });
}

if (closeSettings) {
    closeSettings.addEventListener('click', () => { settingsModal.style.display = 'none'; });
}

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) { settingsModal.style.display = 'none'; }
});