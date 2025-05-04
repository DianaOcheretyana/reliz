// Функція для збереження кошика в localStorage
function saveCartToStorage(cart) {
    localStorage.setItem('handmadeCart', JSON.stringify(cart));
}

// Функція для отримання кошика з localStorage
function getCartFromStorage() {
    const cart = localStorage.getItem('handmadeCart');
    return cart ? JSON.parse(cart) : [];
}

// Функція для додавання товару до кошика
function addToCart(product) {
    const cart = getCartFromStorage();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCartToStorage(cart);
    updateCartCounter();
    showAddedToCartMessage(product.name);
}

// Функція для оновлення лічильника товарів у кошику
function updateCartCounter() {
    const cart = getCartFromStorage();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterElement = document.querySelector('.cart-counter');

    if (counterElement) {
        counterElement.textContent = totalItems;
        counterElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Функція для показу повідомлення про додавання товару
function showAddedToCartMessage(productName) {
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.innerHTML = `
        <span>Товар "${productName}" додано до кошика!</span>
    `;
    document.body.appendChild(message);

    setTimeout(() => {
        message.classList.add('show');
    }, 10);

    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 3000);
}

// Ініціалізація кошика при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Додаємо лічильник до кошика в навігації
    const navCartLink = document.querySelector('nav ul li a[href="cart.html"]');
    if (navCartLink) {
        navCartLink.innerHTML += '<span class="cart-counter"></span>';
        updateCartCounter();
    }

    // Обробка кліків на кнопках "Додати до кошика"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.querySelector('img').src,
                name: productCard.querySelector('h3').textContent,
                price: parseFloat(productCard.querySelector('p').textContent.replace(' грн', '')),
                image: productCard.querySelector('img').src
            };
            addToCart(product);
        });
    });

    // Заповнення сторінки кошика
    if (document.querySelector('.cart-items')) {
        renderCartPage();
    }
});

// Функція для відображення сторінки кошика
function renderCartPage() {
    const cart = getCartFromStorage();
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary h3');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Ваш кошик порожній</p>';
        cartSummary.textContent = 'Разом до сплати: 0 грн';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>${item.price} грн</p>
                <div class="quantity-controls">
                    <button class="decrease-quantity">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-quantity">+</button>
                </div>
                <button class="remove-item">Видалити</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);

        total += item.price * item.quantity;
    });

    cartSummary.textContent = `Разом до сплати: ${total} грн`;

    // Додаємо обробники подій для кнопок
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, -1);
        });
    });

    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(this, 1);
        });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            removeItem(this);
        });
    });
}

// Функція для оновлення кількості товару
function updateQuantity(button, change) {
    const cart = getCartFromStorage();
    const itemElement = button.closest('.cart-item');
    const itemImage = itemElement.querySelector('img').src;
    const item = cart.find(item => item.image === itemImage);

    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            cart.splice(cart.indexOf(item), 1);
        }

        saveCartToStorage(cart);
        renderCartPage();
        updateCartCounter();
    }
}

// Функція для видалення товару
function removeItem(button) {
    const cart = getCartFromStorage();
    const itemElement = button.closest('.cart-item');
    const itemImage = itemElement.querySelector('img').src;
    const itemIndex = cart.findIndex(item => item.image === itemImage);

    if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        saveCartToStorage(cart);
        renderCartPage();
        updateCartCounter();
    }
}
// Функція для оформлення замовлення
function checkout() {
    const cart = getCartFromStorage();
    
    if (cart.length === 0) {
        alert('Ваш кошик порожній!');
        return;
    }

    // Запитуємо дані користувача
    const name = prompt('Будь ласка, введіть ваше ім\'я:');
    if (!name) return;

    const phone = prompt('Введіть ваш номер телефону:');
    if (!phone) return;

    const address = prompt('Введіть адресу доставки:');
    if (!address) return;

    // Формуємо замовлення
    const order = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        customer: { name, phone, address },
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    // Зберігаємо замовлення (у реальному проекті тут буде відправка на сервер)
    saveOrder(order);
    
    // Очищаємо кошик
    localStorage.removeItem('handmadeCart');
    updateCartCounter();
    
    // Показуємо підтвердження
    showOrderConfirmation(order);
}

// Функція для збереження замовлення (в localStorage для прикладу)
function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('handmadeOrders') || '[]');
    orders.push(order);
    localStorage.setItem('handmadeOrders', JSON.stringify(orders));
}

// Функція для показу підтвердження замовлення
function showOrderConfirmation(order) {
    const confirmationHTML = `
        <div class="order-confirmation">
            <h3>Дякуємо за замовлення!</h3>
            <p>Номер замовлення: #${order.id}</p>
            <p>Дата: ${order.date}</p>
            <p>Сума: ${order.total} грн</p>
            <p>Замовник: ${order.customer.name}</p>
            <p>Телефон: ${order.customer.phone}</p>
            <p>Адреса: ${order.customer.address}</p>
            <button class="close-confirmation">Закрити</button>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = confirmationHTML;
    document.body.appendChild(overlay);
    
    // Додаємо обробник для кнопки закриття
    overlay.querySelector('.close-confirmation').addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (document.querySelector('.cart-items')) {
            renderCartPage(); // Оновлюємо сторінку кошика
        }
    });
}

// Додаємо обробник для кнопки оформлення замовлення
document.addEventListener('DOMContentLoaded', function() {
    // ... інший код ініціалізації ...
    
    const checkoutButton = document.querySelector('.checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', checkout);
    }
});
