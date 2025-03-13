document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("productForm");
    const bulkForm = document.getElementById("bulkProductForm");
    const productList = document.getElementById("productList");
    const jsonError = document.getElementById("jsonError");
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const closeBtn = document.querySelector(".close");

    // Инициализация чата
    class AdminChat {
        constructor() {
            this.ws = null;
            this.activeChat = null;
            this.chats = new Map();
            this.typingTimeout = null;

            this.chatList = document.getElementById('chatList');
            this.messages = document.getElementById('chatMessages');
            this.input = document.getElementById('messageInput');
            this.sendButton = document.getElementById('sendMessage');
            this.typingIndicator = document.getElementById('typingIndicator');

            this.connect();
            this.setupEventListeners();
        }

        connect() {
            this.ws = new WebSocket('ws://localhost:3000');

            this.ws.onopen = () => {
                this.ws.send(JSON.stringify({
                    type: 'auth',
                    role: 'admin'
                }));
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onclose = () => {
                console.log('Соединение закрыто');
                setTimeout(() => this.connect(), 1000);
            };
        }

        setupEventListeners() {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
                this.sendTyping(true);
            });

            this.input.addEventListener('keyup', () => {
                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    this.sendTyping(false);
                }, 1000);
            });

            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        handleMessage(data) {
            switch (data.type) {
                case 'chat_list':
                    this.initializeChats(data.chats);
                    break;
                case 'new_chat':
                    this.addChat(data.chatId, data.customerName);
                    break;
                case 'chat_message':
                case 'message_sent':
                    this.addMessage(data.chatId || this.activeChat, data.message);
                    break;
                case 'typing':
                    if (data.chatId === this.activeChat) {
                        this.typingIndicator.style.display = data.isTyping ? 'block' : 'none';
                    }
                    break;
                case 'chat_closed':
                    this.removeChat(data.chatId);
                    break;
            }
        }

        initializeChats(chats) {
            chats.forEach(chat => {
                this.addChat(chat.chatId, chat.customerName);
                chat.messages.forEach(msg => this.addMessage(chat.chatId, msg, false));
            });
        }

        addChat(chatId, customerName) {
            if (!this.chats.has(chatId)) {
                const chatDiv = document.createElement('div');
                chatDiv.className = 'chat-item';
                chatDiv.textContent = customerName;
                chatDiv.dataset.chatId = chatId;
                
                chatDiv.addEventListener('click', () => {
                    this.selectChat(chatId);
                });

                this.chatList.appendChild(chatDiv);
                this.chats.set(chatId, {
                    element: chatDiv,
                    messages: []
                });

                // Автоматически выбираем первый чат
                if (!this.activeChat) {
                    this.selectChat(chatId);
                }
            }
        }

        removeChat(chatId) {
            const chat = this.chats.get(chatId);
            if (chat) {
                chat.element.remove();
                this.chats.delete(chatId);
                
                if (this.activeChat === chatId) {
                    this.activeChat = null;
                    this.messages.innerHTML = '';
                    const nextChat = this.chats.keys().next().value;
                    if (nextChat) {
                        this.selectChat(nextChat);
                    }
                }
            }
        }

        selectChat(chatId) {
            // Убираем выделение с предыдущего чата
            if (this.activeChat) {
                const prevChat = this.chats.get(this.activeChat);
                if (prevChat) {
                    prevChat.element.classList.remove('active');
                }
            }

            // Выделяем новый чат
            const chat = this.chats.get(chatId);
            if (chat) {
                this.activeChat = chatId;
                chat.element.classList.add('active');
                
                // Показываем сообщения выбранного чата
                this.messages.innerHTML = '';
                chat.messages.forEach(msg => {
                    const messageDiv = this.createMessageElement(msg);
                    this.messages.appendChild(messageDiv);
                });
                this.messages.scrollTop = this.messages.scrollHeight;
            }
        }

        addMessage(chatId, message, scroll = true) {
            const chat = this.chats.get(chatId);
            if (chat) {
                chat.messages.push(message);
                
                if (chatId === this.activeChat) {
                    const messageDiv = this.createMessageElement(message);
                    this.messages.appendChild(messageDiv);
                    if (scroll) {
                        this.messages.scrollTop = this.messages.scrollHeight;
                    }
                }
            }
        }

        createMessageElement(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sender}`;
            messageDiv.textContent = `${message.senderName}: ${message.text}`;
            return messageDiv;
        }

        sendMessage() {
            if (!this.activeChat) return;
            
            const text = this.input.value.trim();
            if (!text) return;

            this.ws.send(JSON.stringify({
                type: 'message',
                chatId: this.activeChat,
                text: text
            }));

            this.input.value = '';
        }

        sendTyping(isTyping) {
            if (this.ws && this.activeChat) {
                this.ws.send(JSON.stringify({
                    type: 'typing',
                    chatId: this.activeChat,
                    isTyping
                }));
            }
        }
    }

    function loadProducts() {
        fetch("/products")
            .then(res => res.json())
            .then(products => {
                productList.innerHTML = products.map(p => `
                    <div class="product-card">
                        <h3>${p.name}</h3>
                        <p>${p.description}</p>
                        <p>Цена: ${p.price} руб.</p>
                        <p>Категории: ${p.category.join(", ")}</p>
                        <div class="button-group">
                            <button onclick="editProduct('${p.id}')">Редактировать</button>
                            <button onclick="deleteProduct('${p.id}')">Удалить</button>
                        </div>
                    </div>
                `).join("");
            })
            .catch(err => console.error("Ошибка загрузки товаров:", err));
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const price = document.getElementById("price").value;
        const category = document.getElementById("category").value.split(",").map(c => c.trim());

        fetch("/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, price, category })
        }).then(() => {
            form.reset();
            loadProducts();
        }).catch(err => console.error("Ошибка добавления товара:", err));
    });

    bulkForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const jsonText = document.getElementById("bulkProducts").value;
        
        try {
            const products = JSON.parse(jsonText);
            jsonError.style.display = "none";
            
            if (!Array.isArray(products)) {
                throw new Error("Данные должны быть массивом");
            }

            products.forEach((product, index) => {
                if (!product.name || !product.description || !product.price || !product.category) {
                    throw new Error(`Товар ${index + 1} содержит не все обязательные поля`);
                }
                if (!Array.isArray(product.category)) {
                    product.category = product.category.split(",").map(c => c.trim());
                }
            });

            for (const product of products) {
                await fetch("/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(product)
                });
            }

            bulkForm.reset();
            loadProducts();
            alert("Все товары успешно добавлены!");
        } catch (err) {
            console.error("Ошибка при добавлении товаров:", err);
            jsonError.textContent = `Ошибка: ${err.message}`;
            jsonError.style.display = "block";
        }
    });

    window.editProduct = async (id) => {
        try {
            console.log('Пытаемся загрузить товар с ID:', id);
            const response = await fetch(`/products/${id}`);
            console.log('Статус ответа:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const product = await response.json();
            console.log('Полученные данные товара:', product);
            
            document.getElementById("editId").value = product.id;
            document.getElementById("editName").value = product.name;
            document.getElementById("editDescription").value = product.description;
            document.getElementById("editPrice").value = product.price;
            document.getElementById("editCategory").value = product.category.join(", ");
            
            editModal.style.display = "block";
        } catch (err) {
            console.error("Подробная ошибка при загрузке товара:", err);
            alert("Не удалось загрузить товар для редактирования");
        }
    };

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("editId").value;
        const name = document.getElementById("editName").value;
        const description = document.getElementById("editDescription").value;
        const price = document.getElementById("editPrice").value;
        const category = document.getElementById("editCategory").value.split(",").map(c => c.trim());

        try {
            await fetch(`/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, price, category })
            });
            
            editModal.style.display = "none";
            loadProducts();
            alert("Товар успешно обновлен!");
        } catch (err) {
            console.error("Ошибка обновления товара:", err);
            alert("Не удалось обновить товар");
        }
    });

    closeBtn.addEventListener("click", () => {
        editModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === editModal) {
            editModal.style.display = "none";
        }
    });

    window.deleteProduct = (id) => {
        if (confirm("Вы уверены, что хотите удалить этот товар?")) {
            fetch(`/products/${id}`, { method: "DELETE" })
                .then(() => loadProducts())
                .catch(err => console.error("Ошибка удаления товара:", err));
        }
    };

    loadProducts();
    const adminChat = new AdminChat();
});