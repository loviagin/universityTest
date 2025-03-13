const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');

// Определение схемы
const schema = buildSchema(`
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    category: [String!]!
  }

  type ProductPreview {
    id: ID!
    name: String!
    price: Float!
  }

  type Query {
    products: [Product!]!
    productPreviews: [ProductPreview!]!
    product(id: ID!): Product
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
    category: [String!]!
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product
    deleteProduct(id: ID!): Boolean!
  }
`);

// Функции-резолверы
const root = {
    products: () => {
        const dataPath = path.join(__dirname, 'products.json');
        const data = fs.readFileSync(dataPath);
        return JSON.parse(data);
    },
    productPreviews: () => {
        const dataPath = path.join(__dirname, 'products.json');
        const data = fs.readFileSync(dataPath);
        const products = JSON.parse(data);
        return products.map(({ id, name, price }) => ({ id, name, price }));
    },
    product: ({ id }) => {
        const dataPath = path.join(__dirname, 'products.json');
        const data = fs.readFileSync(dataPath);
        const products = JSON.parse(data);
        return products.find(p => p.id == id);
    },
    createProduct: ({ input }) => {
        const dataPath = path.join(__dirname, 'products.json');
        const data = fs.readFileSync(dataPath);
        const products = JSON.parse(data);
        const newProduct = {
            id: Date.now(),
            ...input
        };
        products.push(newProduct);
        fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
        return newProduct;
    },
    updateProduct: ({ id, input }) => {
        const dataPath = path.join(__dirname, 'products.json');
        const data = fs.readFileSync(dataPath);
        const products = JSON.parse(data);
        const index = products.findIndex(p => p.id == id);
        if (index === -1) return null;
        
        products[index] = {
            ...products[index],
            ...input
        };
        fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
        return products[index];
    },
    deleteProduct: ({ id }) => {
        const dataPath = path.join(__dirname, 'products.json');
        const data = fs.readFileSync(dataPath);
        let products = JSON.parse(data);
        const initialLength = products.length;
        products = products.filter(p => p.id != id);
        fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
        return products.length < initialLength;
    }
};

module.exports = { schema, root }; 