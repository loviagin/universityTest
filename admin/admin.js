document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("productForm");
    const productList = document.getElementById("productList");

    function loadProducts() {
        fetch("/products")
            .then(res => res.json())
            .then(products => {
                productList.innerHTML = products.map(p => `
                    <div>
                        <h3>${p.name}</h3>
                        <p>${p.description}</p>
                        <p>Цена: ${p.price} руб.</p>
                        <p>Категории: ${p.category.join(", ")}</p>
                        <button onclick="deleteProduct(${p.id})">Удалить</button>
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
        const category = document.getElementById("category").value.split(",");

        fetch("/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, price, category })
        }).then(() => {
            form.reset();
            loadProducts();
        }).catch(err => console.error("Ошибка добавления товара:", err));
    });

    window.deleteProduct = (id) => {
        fetch(`/products/${id}`, { method: "DELETE" })
            .then(() => loadProducts())
            .catch(err => console.error("Ошибка удаления товара:", err));
    };

    loadProducts();
});