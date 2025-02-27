document.addEventListener("DOMContentLoaded", () => {
    fetch("/products")
        .then(res => res.json())
        .then(products => {
            const container = document.getElementById("products");
            container.innerHTML = products.map(p => `
                <div>
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <p>Цена: ${p.price} руб.</p>
                    <p>Категории: ${p.category.join(", ")}</p>
                </div>
            `).join("");
        })
        .catch(err => console.error("Ошибка загрузки товаров:", err));
});