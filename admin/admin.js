document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("productForm");
    const bulkForm = document.getElementById("bulkProductForm");
    const productList = document.getElementById("productList");
    const jsonError = document.getElementById("jsonError");
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const closeBtn = document.querySelector(".close");

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

            // Проверяем каждый товар на корректность
            products.forEach((product, index) => {
                if (!product.name || !product.description || !product.price || !product.category) {
                    throw new Error(`Товар ${index + 1} содержит не все обязательные поля`);
                }
                if (!Array.isArray(product.category)) {
                    product.category = product.category.split(",").map(c => c.trim());
                }
            });

            // Добавляем товары последовательно
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
            
            // Заполняем форму редактирования данными товара
            document.getElementById("editId").value = product.id;
            document.getElementById("editName").value = product.name;
            document.getElementById("editDescription").value = product.description;
            document.getElementById("editPrice").value = product.price;
            document.getElementById("editCategory").value = product.category.join(", ");
            
            // Показываем модальное окно
            editModal.style.display = "block";
        } catch (err) {
            console.error("Подробная ошибка при загрузке товара:", err);
            alert("Не удалось загрузить товар для редактирования");
        }
    };

    // Обработка формы редактирования
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

    // Закрытие модального окна
    closeBtn.addEventListener("click", () => {
        editModal.style.display = "none";
    });

    // Закрытие модального окна при клике вне его
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
});