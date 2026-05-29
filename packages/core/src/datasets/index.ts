import { ok, err } from "neverthrow"
import { ImportError } from "@sqlose/shared"
import type { Dataset, AsyncAppResult } from "@sqlose/shared"

export interface DatasetSQL {
   datasetId: string
   sql: string
}

const DATASETS: Dataset[] = [
   {
      id: "ds-ecommerce",
      name: "Brazilian Ecommerce",
      description: "Olist marketplace with customers, products, orders, payments and reviews across Brazil",
      category: "ecommerce",
      dbTypes: ["postgres", "mysql", "sqlite"],
   },
   {
      id: "ds-retail",
      name: "Retail Inventory",
      description: "Multi-store retail chain with inventory, suppliers, products and point-of-sale transactions",
      category: "retail",
      dbTypes: ["postgres", "mysql", "sqlite"],
   },
   {
      id: "ds-healthcare",
      name: "Hospital Management",
      description: "Hospital system with patients, doctors, appointments, diagnoses and prescriptions",
      category: "healthcare",
      dbTypes: ["postgres", "mysql", "sqlite"],
   },
   {
      id: "ds-analytics",
      name: "Web Analytics",
      description: "Website analytics with user sessions, page views, events and conversion tracking",
      category: "analytics",
      dbTypes: ["postgres", "mysql", "sqlite"],
   },
   {
      id: "ds-social",
      name: "Social Network",
      description: "Social media platform with users, posts, comments, likes and follower relationships",
      category: "social",
      dbTypes: ["postgres", "mysql", "sqlite"],
   },
   {
      id: "ds-finance",
      name: "Personal Finance",
      description: "Personal finance tracker with accounts, transactions, budgets, investments and categories",
      category: "finance",
      dbTypes: ["postgres", "mysql", "sqlite"],
   },
]

export const SAMPLE_DATASETS: Record<string, string> = {
   "ds-ecommerce": `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (1, 'Alice Santos', 'alice.santos@gmail.com', 'São Paulo', 'SP', '01310-100', '2024-01-15');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (2, 'Bruno Oliveira', 'bruno.oliveira@yahoo.com', 'Rio de Janeiro', 'RJ', '20040-020', '2024-02-20');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (3, 'Carla Mendes', 'carla.m@outlook.com', 'Belo Horizonte', 'MG', '30140-070', '2024-03-10');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (4, 'Diego Costa', 'diego.costa@hotmail.com', 'Porto Alegre', 'RS', '90035-001', '2024-03-22');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (5, 'Eduarda Lima', 'eduarda.lima@gmail.com', 'Salvador', 'BA', '40020-010', '2024-04-05');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (6, 'Felipe Souza', 'felipe.souza@icloud.com', 'Brasília', 'DF', '70070-100', '2024-05-12');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (7, 'Gabriela Rocha', 'gabriela.r@uol.com.br', 'Curitiba', 'PR', '80020-010', '2024-06-01');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (8, 'Henrique Martins', 'henrique.m@yahoo.com', 'Fortaleza', 'CE', '60115-000', '2024-06-18');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (9, 'Isabela Pereira', 'isabela.p@gmail.com', 'Recife', 'PE', '50030-010', '2024-07-03');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (10, 'João Barbosa', 'joao.barbosa@hotmail.com', 'Manaus', 'AM', '69010-000', '2024-07-28');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (11, 'Karina Almeida', 'karina.a@outlook.com', 'Florianópolis', 'SC', '88010-000', '2024-08-14');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (12, 'Leonardo Nunes', 'leonardo.n@live.com', 'Campinas', 'SP', '13010-000', '2024-09-01');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (13, 'Mariana Castro', 'mariana.castro@gmail.com', 'São Luís', 'MA', '65010-000', '2024-09-20');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (14, 'Nathalia Ribeiro', 'nathalia.r@yahoo.com', 'Goiânia', 'GO', '74010-000', '2024-10-05');
INSERT INTO customers (id, name, email, city, state, zip_code, signup_date) VALUES (15, 'Otávio Fernandes', 'otavio.fernandes@icloud.com', 'Belém', 'PA', '66010-000', '2024-10-25');

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  cost REAL NOT NULL,
  weight_kg REAL,
  description TEXT
);

INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (1, 'Smartphone X Pro 5G', 'eletrônicos', 2999.00, 2100.00, 0.18, 'Smartphone com 256GB e câmera tripla');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (2, 'Notebook Ultra Slim', 'eletrônicos', 5499.00, 3850.00, 1.20, 'Notebook 15 polegadas 16GB RAM');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (3, 'Fone Bluetooth Pro', 'eletrônicos', 299.90, 175.00, 0.05, 'Headset com cancelamento de ruído');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (4, 'Sofá 3 Lugares', 'móveis', 1899.00, 1200.00, 45.00, 'Sofá em couro sintético premium');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (5, 'Mesa de Jantar 6 Cadeiras', 'móveis', 2499.00, 1650.00, 80.00, 'Mesa em madeira maciça com 6 cadeiras');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (6, 'Cadeira Escritório Ergonômica', 'móveis', 1299.00, 850.00, 15.00, 'Cadeira com suporte lombar ajustável');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (7, 'Vestido Floral', 'moda', 149.90, 85.00, 0.25, 'Vestido longo floral algodão');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (8, 'Tênis Runner Supreme', 'moda', 399.90, 220.00, 0.45, 'Tênis esportivo com amortecimento');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (9, 'Relógio Clássico Automático', 'moda', 899.00, 520.00, 0.08, 'Relógio com movimento automático suíço');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (10, 'Panela de Pressão Elétrica', 'casa', 229.90, 140.00, 2.80, 'Panela elétrica 6 litros digital');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (11, 'Jogo de Panelas Antiaderente', 'casa', 379.90, 230.00, 4.50, 'Kit 5 peças com tampa de vidro');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (12, 'Cafeteira Expresso Premium', 'casa', 599.00, 380.00, 3.20, 'Cafeteira 15 bares de pressão');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (13, 'Livro Clean Code', 'livros', 89.90, 52.00, 0.40, 'Robert C. Martin - Princípios de programação');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (14, 'Kit Chá Orgânico 12 unidades', 'alimentos', 59.90, 32.00, 0.30, 'Chás selecionados orgânicos');
INSERT INTO products (id, name, category, price, cost, weight_kg, description) VALUES (15, 'Cesta Café da Manhã Premium', 'alimentos', 129.90, 75.00, 1.50, 'Cesta com café, biscoitos e geleias importadas');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total REAL NOT NULL,
  shipping_days INTEGER
);

INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (1, 1, 'delivered', '2024-02-01', 3298.90, 5);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (2, 3, 'delivered', '2024-03-15', 5499.00, 7);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (3, 2, 'shipped', '2024-04-10', 598.80, 3);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (4, 5, 'delivered', '2024-04-22', 149.90, 4);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (5, 7, 'processing', '2024-06-05', 3798.80, NULL);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (6, 4, 'delivered', '2024-05-01', 1299.00, 6);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (7, 8, 'shipped', '2024-06-20', 899.00, 2);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (8, 10, 'delivered', '2024-08-01', 599.00, 8);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (9, 6, 'cancelled', '2024-05-18', 2999.00, NULL);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (10, 12, 'delivered', '2024-09-10', 129.90, 3);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (11, 9, 'processing', '2024-07-15', 229.90, NULL);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (12, 14, 'delivered', '2024-10-10', 89.90, 5);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (13, 11, 'shipped', '2024-09-28', 449.80, 4);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (14, 13, 'delivered', '2024-10-01', 129.90, 6);
INSERT INTO orders (id, customer_id, status, order_date, total, shipping_days) VALUES (15, 15, 'processing', '2024-11-01', 1899.00, NULL);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (1, 1, 1, 1, 2999.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (2, 1, 3, 1, 299.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (3, 2, 2, 1, 5499.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (4, 3, 8, 1, 399.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (5, 3, 7, 1, 149.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (6, 3, 14, 1, 49.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (7, 4, 7, 1, 149.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (8, 5, 4, 1, 1899.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (9, 5, 12, 1, 599.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (10, 5, 15, 2, 129.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (11, 6, 6, 1, 1299.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (12, 7, 9, 1, 899.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (13, 8, 12, 1, 599.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (14, 9, 1, 1, 2999.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (15, 10, 15, 1, 129.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (16, 11, 10, 1, 229.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (17, 12, 13, 1, 89.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (18, 13, 11, 1, 379.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (19, 13, 14, 1, 59.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (20, 14, 15, 1, 129.90);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (21, 15, 5, 1, 2499.00);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  method TEXT NOT NULL,
  installments INTEGER DEFAULT 1,
  amount REAL NOT NULL
);

INSERT INTO payments (id, order_id, method, installments, amount) VALUES (1, 1, 'credit_card', 3, 3298.90);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (2, 2, 'boleto', 1, 5499.00);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (3, 3, 'credit_card', 1, 598.80);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (4, 4, 'pix', 1, 149.90);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (5, 5, 'credit_card', 6, 3798.80);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (6, 6, 'debit_card', 1, 1299.00);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (7, 7, 'pix', 1, 899.00);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (8, 8, 'credit_card', 2, 599.00);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (9, 9, 'credit_card', 1, 2999.00);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (10, 10, 'pix', 1, 129.90);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (11, 11, 'boleto', 1, 229.90);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (12, 12, 'debit_card', 1, 89.90);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (13, 13, 'credit_card', 2, 439.80);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (14, 14, 'pix', 1, 129.90);
INSERT INTO payments (id, order_id, method, installments, amount) VALUES (15, 15, 'credit_card', 10, 1899.00);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (1, 1, 1, 5, 'Excelente smartphone! Muito rápido e a câmera é incrível.', '2024-02-10');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (2, 1, 3, 4, 'Fone muito bom, mas poderia vir com estojo.', '2024-02-10');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (3, 2, 2, 5, 'Notebook superou expectativas. Bateria dura o dia todo.', '2024-03-25');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (4, 3, 8, 3, 'Tênis confortável mas tamanho veio menor.', '2024-04-15');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (5, 4, 7, 4, 'Vestido lindo, tecido de qualidade.', '2024-04-28');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (6, 6, 6, 5, 'Melhor cadeira que já tive. Vale cada centavo.', '2024-05-10');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (7, 7, 9, 4, 'Relógio bonito e preciso. A pulseira poderia ser melhor.', '2024-06-25');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (8, 8, 12, 5, 'Cafeteira fantástica, faz um espresso cremoso!', '2024-08-10');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (9, 10, 15, 4, 'Cesta linda, veio bem embalada. Ótimo presente.', '2024-09-15');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (10, 12, 13, 5, 'Leitura essencial para todo desenvolvedor.', '2024-10-15');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (11, 13, 11, 4, 'Panelas bonitas e funcionais. Antiaderente de verdade.', '2024-10-05');
INSERT INTO reviews (id, order_id, product_id, rating, comment, review_date) VALUES (12, 14, 15, 5, 'Comprei para presentear e foi sucesso!', '2024-10-08');`,

   "ds-retail": `CREATE TABLE stores (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  size_sqft INTEGER NOT NULL,
  opened_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stores (id, name, city, state, size_sqft, opened_date) VALUES (1, 'MegaMart Centro', 'São Paulo', 'SP', 25000, '2020-03-15');
INSERT INTO stores (id, name, city, state, size_sqft, opened_date) VALUES (2, 'MegaMart Norte', 'São Paulo', 'SP', 18000, '2021-06-01');
INSERT INTO stores (id, name, city, state, size_sqft, opened_date) VALUES (3, 'MegaMart Sul', 'Rio de Janeiro', 'RJ', 22000, '2020-11-20');
INSERT INTO stores (id, name, city, state, size_sqft, opened_date) VALUES (4, 'MegaMart Barra', 'Rio de Janeiro', 'RJ', 30000, '2022-01-10');
INSERT INTO stores (id, name, city, state, size_sqft, opened_date) VALUES (5, 'MegaMart Savassi', 'Belo Horizonte', 'MG', 15000, '2021-09-05');
INSERT INTO stores (id, name, city, state, size_sqft, opened_date) VALUES (6, 'MegaMart Moinhos', 'Porto Alegre', 'RS', 12000, '2023-04-18');
INSERT INTO stores (id, name, city, state, size_sqft, opened_date) VALUES (7, 'MegaMart Asa Sul', 'Brasília', 'DF', 20000, '2022-08-12');
INSERT INTO stores (id, name, city, state, size_sqft, opened_date) VALUES (8, 'MegaMart Batista', 'Salvador', 'BA', 16000, '2023-02-28');

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  rating INTEGER DEFAULT 3
);

INSERT INTO suppliers (id, name, contact_name, email, phone, city, state, rating) VALUES (1, 'Distribuidora Nacional S.A.', 'Carlos Andrade', 'carlos@dnacional.com.br', '(11) 3000-1000', 'São Paulo', 'SP', 5);
INSERT INTO suppliers (id, name, contact_name, email, phone, city, state, rating) VALUES (2, 'Alimentos Fresh Ltda.', 'Marina Costa', 'marina@freshalimentos.com', '(21) 4000-2000', 'Rio de Janeiro', 'RJ', 4);
INSERT INTO suppliers (id, name, contact_name, email, phone, city, state, rating) VALUES (3, 'Eletro Distribuidora', 'Roberto Lima', 'roberto@eletrodist.com.br', '(31) 5000-3000', 'Belo Horizonte', 'MG', 4);
INSERT INTO suppliers (id, name, contact_name, email, phone, city, state, rating) VALUES (4, 'HP&C Logística', 'Patrícia Souza', 'patricia@hpclog.com', '(41) 6000-4000', 'Curitiba', 'PR', 5);
INSERT INTO suppliers (id, name, contact_name, email, phone, city, state, rating) VALUES (5, 'Vestuário Fashion Group', 'André Oliveira', 'andre@vfgroup.com.br', '(51) 7000-5000', 'Porto Alegre', 'RS', 3);
INSERT INTO suppliers (id, name, contact_name, email, phone, city, state, rating) VALUES (6, 'Limpeza Total Produtos', 'Juliana Mendes', 'juliana@limpezatotal.com', '(61) 8000-6000', 'Brasília', 'DF', 4);
INSERT INTO suppliers (id, name, contact_name, email, phone, city, state, rating) VALUES (7, 'Bebidas Premium Sul', 'Fernando Castro', 'fernando@bebidaspremium.com', '(71) 9000-7000', 'Salvador', 'BA', 4);
INSERT INTO suppliers (id, name, contact_name, email, phone, city, state, rating) VALUES (8, 'Orgânicos da Terra', 'Camila Rocha', 'camila@organicdaterra.com', '(81) 1000-8000', 'Recife', 'PE', 5);

CREATE TABLE retail_products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  price REAL NOT NULL,
  cost REAL NOT NULL,
  margin REAL,
  barcode TEXT
);

INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (1, 'Arroz Agulhinha 5kg', 'alimentos', 'Tio João', 24.90, 18.50, 0.257, '7891000100011');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (2, 'Feijão Carioca 1kg', 'alimentos', 'Camil', 8.90, 6.20, 0.303, '7891000100028');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (3, 'Óleo de Soja 900ml', 'alimentos', 'Liza', 7.50, 5.10, 0.320, '7891000100035');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (4, 'Leite Integral 1L', 'laticínios', 'Itambé', 5.90, 4.20, 0.288, '7891000100042');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (5, 'Queijo Muçarela 500g', 'laticínios', 'President', 22.90, 16.80, 0.266, '7891000100059');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (6, 'Iogurte Natural 400g', 'laticínios', 'Nestlé', 6.90, 4.80, 0.304, '7891000100066');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (7, 'Detergente Líquido 500ml', 'limpeza', 'Ypê', 3.50, 2.20, 0.371, '7891000100073');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (8, 'Sabão em Pó 800g', 'limpeza', 'Omo', 15.90, 11.50, 0.277, '7891000100080');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (9, 'Desinfetante 1L', 'limpeza', 'Pinho Sol', 6.50, 4.30, 0.338, '7891000100097');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (10, 'TV LED 50" 4K', 'eletrônicos', 'Samsung', 2899.00, 2100.00, 0.276, '7891000100103');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (11, 'Microondas 30L', 'eletrônicos', 'Electrolux', 599.00, 420.00, 0.299, '7891000100110');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (12, 'Geladeira Frost Free 400L', 'eletrônicos', 'Brastemp', 3899.00, 2800.00, 0.282, '7891000100127');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (13, 'Camiseta Algodão Masculina', 'vestuário', 'Hering', 59.90, 35.00, 0.416, '7891000100134');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (14, 'Calça Jeans Feminina', 'vestuário', 'Levis', 189.90, 120.00, 0.368, '7891000100141');
INSERT INTO retail_products (id, name, category, brand, price, cost, margin, barcode) VALUES (15, 'Tênis Casual Masculino', 'vestuário', 'Adidas', 349.90, 230.00, 0.343, '7891000100158');

CREATE TABLE inventory (
  id INTEGER PRIMARY KEY,
  store_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  min_stock INTEGER DEFAULT 10,
  max_stock INTEGER DEFAULT 200,
  last_restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (1, 1, 1, 200, 50, 500, '2024-11-01');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (2, 1, 2, 150, 50, 400, '2024-11-01');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (3, 1, 10, 30, 5, 50, '2024-10-20');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (4, 1, 13, 80, 20, 150, '2024-11-05');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (5, 2, 1, 120, 50, 500, '2024-10-28');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (6, 2, 4, 300, 100, 600, '2024-11-02');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (7, 2, 8, 90, 30, 200, '2024-10-30');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (8, 3, 7, 250, 40, 300, '2024-11-03');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (9, 3, 11, 15, 5, 30, '2024-10-25');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (10, 3, 5, 60, 20, 100, '2024-11-01');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (11, 4, 12, 20, 5, 40, '2024-10-15');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (12, 4, 14, 40, 10, 80, '2024-11-04');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (13, 4, 3, 200, 50, 400, '2024-11-01');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (14, 5, 6, 30, 20, 80, '2024-10-22');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (15, 5, 9, 45, 15, 100, '2024-10-29');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (16, 6, 2, 60, 30, 200, '2024-11-05');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (17, 6, 15, 25, 10, 60, '2024-10-18');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (18, 7, 1, 180, 50, 500, '2024-11-02');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (19, 7, 7, 120, 40, 300, '2024-11-01');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (20, 8, 4, 160, 80, 400, '2024-10-30');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (21, 8, 13, 55, 20, 150, '2024-11-03');
INSERT INTO inventory (id, store_id, product_id, quantity, min_stock, max_stock, last_restocked) VALUES (22, 2, 10, 12, 5, 50, '2024-10-20');

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  store_id INTEGER NOT NULL,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  customer_id INTEGER
);

INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (1, 1, '2024-11-01', 156.50, 'credit_card', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (2, 1, '2024-11-01', 45.90, 'pix', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (3, 2, '2024-11-01', 2899.00, 'credit_card', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (4, 3, '2024-11-02', 67.20, 'cash', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (5, 3, '2024-11-02', 599.00, 'debit_card', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (6, 4, '2024-11-02', 3899.00, 'credit_card', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (7, 4, '2024-11-03', 89.70, 'pix', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (8, 5, '2024-11-03', 34.50, 'cash', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (9, 5, '2024-11-04', 189.90, 'credit_card', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (10, 6, '2024-11-04', 259.80, 'pix', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (11, 6, '2024-11-05', 349.90, 'debit_card', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (12, 7, '2024-11-05', 512.00, 'credit_card', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (13, 8, '2024-11-05', 24.90, 'cash', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (14, 1, '2024-11-06', 119.80, 'pix', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (15, 2, '2024-11-06', 45.00, 'credit_card', NULL);
INSERT INTO sales (id, store_id, sale_date, total, payment_method, customer_id) VALUES (16, 4, '2024-11-06', 598.00, 'credit_card', NULL);`,

   "ds-healthcare": `CREATE TABLE patients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date TIMESTAMP,
  gender TEXT,
  blood_type TEXT,
  address TEXT,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (1, 'Maria Aparecida Silva', 'maria.silva@email.com', '(11) 91234-5678', '1985-03-12', 'F', 'O+', 'Rua Augusta, 1500, São Paulo - SP', '2023-06-01');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (2, 'João Pereira Santos', 'joao.psantos@email.com', '(21) 98765-4321', '1972-08-25', 'M', 'A+', 'Av. Atlântica, 500, Rio de Janeiro - RJ', '2023-06-15');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (3, 'Ana Beatriz Costa', 'ana.costa@email.com', '(31) 99876-5432', '1990-11-03', 'F', 'B+', 'Rua Bahia, 320, Belo Horizonte - MG', '2023-07-10');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (4, 'Pedro Henrique Lima', 'pedro.lima@email.com', '(41) 98888-7777', '1965-06-18', 'M', 'AB-', 'Av. Paraná, 800, Curitiba - PR', '2023-08-05');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (5, 'Carla Regina Oliveira', 'carla.oliveira@email.com', '(51) 97777-6666', '1995-01-29', 'F', 'O-', 'Rua dos Andradas, 1200, Porto Alegre - RS', '2023-09-20');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (6, 'Lucas Fernando Almeida', 'lucas.almeida@email.com', '(61) 96666-5555', '2000-09-14', 'M', 'A-', 'SQS 308 Bloco K, Brasília - DF', '2023-10-01');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (7, 'Juliana Cristina Martins', 'juliana.martins@email.com', '(71) 95555-4444', '1988-12-08', 'F', 'AB+', 'Rua Chile, 45, Salvador - BA', '2023-11-12');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (8, 'Roberto Carlos Souza', 'roberto.souza@email.com', '(81) 94444-3333', '1958-04-22', 'M', 'O+', 'Av. Boa Viagem, 2000, Recife - PE', '2024-01-05');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (9, 'Fernanda Lima Rocha', 'fernanda.rocha@email.com', '(85) 93333-2222', '1992-07-16', 'F', 'A+', 'Rua Barão do Rio Branco, 600, Fortaleza - CE', '2024-02-14');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (10, 'Carlos Eduardo Nunes', 'carlos.nunes@email.com', '(51) 92222-1111', '1978-10-30', 'M', 'B-', 'Av. Ipiranga, 4000, Porto Alegre - RS', '2024-03-01');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (11, 'Patrícia Gomes Dias', 'patricia.dias@email.com', '(31) 91111-0000', '2002-05-11', 'F', 'O+', 'Rua Pernambuco, 150, Belo Horizonte - MG', '2024-04-18');
INSERT INTO patients (id, name, email, phone, birth_date, gender, blood_type, address, registered_at) VALUES (12, 'Antônio Carlos Barbosa', 'antonio.barbosa@email.com', '(11) 90000-9999', '1950-12-01', 'M', 'A+', 'Rua da Consolação, 2000, São Paulo - SP', '2024-05-22');

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  floor INTEGER NOT NULL,
  phone TEXT
);

INSERT INTO departments (id, name, code, floor, phone) VALUES (1, 'Emergência', 'ER', 1, '(11) 3000-1001');
INSERT INTO departments (id, name, code, floor, phone) VALUES (2, 'Cardiologia', 'CAR', 3, '(11) 3000-1002');
INSERT INTO departments (id, name, code, floor, phone) VALUES (3, 'Pediatria', 'PED', 4, '(11) 3000-1003');
INSERT INTO departments (id, name, code, floor, phone) VALUES (4, 'Ortopedia', 'ORT', 2, '(11) 3000-1004');
INSERT INTO departments (id, name, code, floor, phone) VALUES (5, 'Neurologia', 'NEU', 5, '(11) 3000-1005');
INSERT INTO departments (id, name, code, floor, phone) VALUES (6, 'Ginecologia', 'GIN', 3, '(11) 3000-1006');

CREATE TABLE doctors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  crm TEXT NOT NULL,
  specialty TEXT NOT NULL,
  department_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  hire_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO doctors (id, name, crm, specialty, department_id, email, phone, hire_date) VALUES (1, 'Dr. Ricardo Alves Mendes', 'CRM/SP 12345', 'Cardiologista', 2, 'ricardo.mendes@hospital.com', '(11) 3000-2001', '2019-03-01');
INSERT INTO doctors (id, name, crm, specialty, department_id, email, phone, hire_date) VALUES (2, 'Dra. Beatriz Torres Campos', 'CRM/SP 23456', 'Pediatra', 3, 'beatriz.campos@hospital.com', '(11) 3000-2002', '2020-06-15');
INSERT INTO doctors (id, name, crm, specialty, department_id, email, phone, hire_date) VALUES (3, 'Dr. Marcos Paulo Oliveira', 'CRM/SP 34567', 'Ortopedista', 4, 'marcos.oliveira@hospital.com', '(11) 3000-2003', '2018-09-20');
INSERT INTO doctors (id, name, crm, specialty, department_id, email, phone, hire_date) VALUES (4, 'Dra. Camila Rangel Santos', 'CRM/SP 45678', 'Neurologista', 5, 'camila.santos@hospital.com', '(11) 3000-2004', '2021-01-10');
INSERT INTO doctors (id, name, crm, specialty, department_id, email, phone, hire_date) VALUES (5, 'Dr. Fernando Kato', 'CRM/SP 56789', 'Emergencista', 1, 'fernando.kato@hospital.com', '(11) 3000-2005', '2017-11-05');
INSERT INTO doctors (id, name, crm, specialty, department_id, email, phone, hire_date) VALUES (6, 'Dra. Renata Costa Lima', 'CRM/SP 67890', 'Ginecologista', 6, 'renata.lima@hospital.com', '(11) 3000-2006', '2022-04-01');
INSERT INTO doctors (id, name, crm, specialty, department_id, email, phone, hire_date) VALUES (7, 'Dr. Gustavo Henrique Silva', 'CRM/SP 78901', 'Cardiologista', 2, 'gustavo.silva@hospital.com', '(11) 3000-2007', '2020-08-12');
INSERT INTO doctors (id, name, crm, specialty, department_id, email, phone, hire_date) VALUES (8, 'Dra. Amanda Ribeiro Nunes', 'CRM/SP 89012', 'Pediatra', 3, 'amanda.nunes@hospital.com', '(11) 3000-2008', '2023-02-28');

CREATE TABLE appointments (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  department_id INTEGER NOT NULL,
  appointment_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (1, 1, 1, 2, '2024-01-10 09:00:00', 'completed', 'Check-up anual paciente hipertensa.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (2, 3, 2, 3, '2024-01-15 14:30:00', 'completed', 'Criança com febre persistente.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (3, 2, 5, 1, '2024-02-03 22:15:00', 'completed', 'Paciente deu entrada com fortes dores no peito.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (4, 5, 3, 4, '2024-02-20 10:00:00', 'completed', 'Fratura no tornozelo direito.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (5, 7, 6, 6, '2024-03-05 16:00:00', 'completed', 'Exame de rotina anual.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (6, 9, 4, 5, '2024-03-18 11:30:00', 'completed', 'Enxaquecas frequentes.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (7, 4, 1, 2, '2024-04-01 08:00:00', 'completed', 'Acompanhamento pós-infarto.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (8, 11, 2, 3, '2024-04-22 15:00:00', 'completed', 'Consulta pediátrica de rotina.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (9, 6, 5, 1, '2024-05-10 19:00:00', 'completed', 'Paciente com crise alérgica.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (10, 8, 3, 4, '2024-06-05 09:30:00', 'scheduled', 'Cirurgia de quadril agendada.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (11, 10, 7, 2, '2024-06-15 14:00:00', 'scheduled', 'Teste ergométrico.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (12, 12, 8, 3, '2024-07-01 10:00:00', 'cancelled', 'Paciente cancelou por motivos pessoais.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (13, 2, 7, 2, '2024-07-20 11:00:00', 'scheduled', 'Retorno avaliação cardíaca.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (14, 4, 4, 5, '2024-08-05 16:30:00', 'scheduled', 'Exame de eletroencefalograma.');
INSERT INTO appointments (id, patient_id, doctor_id, department_id, appointment_date, status, notes) VALUES (15, 1, 1, 2, '2024-08-15 09:00:00', 'scheduled', 'Retorno anual.');

CREATE TABLE diagnoses (
  id INTEGER PRIMARY KEY,
  appointment_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  diagnosis_code TEXT NOT NULL,
  diagnosis_desc TEXT NOT NULL,
  severity INTEGER DEFAULT 1,
  diagnosed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (1, 1, 1, 'I10', 'Hipertensão essencial', 2, '2024-01-10');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (2, 2, 2, 'J06.9', 'Infecção aguda das vias aéreas superiores', 1, '2024-01-15');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (3, 3, 5, 'I21.9', 'Infarto agudo do miocárdio', 5, '2024-02-03');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (4, 4, 3, 'S82.6', 'Fratura do tornozelo', 3, '2024-02-20');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (5, 5, 6, 'Z01.4', 'Exame ginecológico de rotina', 1, '2024-03-05');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (6, 6, 4, 'G43.9', 'Enxaqueca não especificada', 2, '2024-03-18');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (7, 7, 1, 'I25.1', 'Doença cardíaca aterosclerótica', 4, '2024-04-01');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (8, 8, 2, 'Z00.1', 'Exame de rotina para criança sadia', 1, '2024-04-22');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (9, 9, 5, 'T78.3', 'Angioedema por alergia', 3, '2024-05-10');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (10, 10, 3, 'M16.5', 'Coxartrose pós-traumática', 3, '2024-06-05');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (11, 11, 7, 'R94.3', 'Resultado anormal de teste cardiovascular', 2, '2024-06-15');
INSERT INTO diagnoses (id, appointment_id, doctor_id, diagnosis_code, diagnosis_desc, severity, diagnosed_at) VALUES (12, 12, 8, 'Z00.1', 'Exame pediátrico de rotina', 1, '2024-07-01');

CREATE TABLE prescriptions (
  id INTEGER PRIMARY KEY,
  appointment_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  prescribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (1, 1, 1, 1, 'Losartana 50mg', '1 comprimido', '1x ao dia', 30, '2024-01-10');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (2, 2, 3, 2, 'Paracetamol 200mg/ml', '10 gotas', '6/6h se febre', 5, '2024-01-15');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (3, 3, 2, 5, 'AAS 100mg', '1 comprimido', '1x ao dia', 90, '2024-02-03');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (4, 3, 2, 5, 'Atorvastatina 20mg', '1 comprimido', '1x ao dia', 90, '2024-02-03');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (5, 4, 5, 3, 'Ibuprofeno 600mg', '1 comprimido', '8/8h', 7, '2024-02-20');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (6, 6, 9, 4, 'Sumatriptana 50mg', '1 comprimido', 'no início da crise', 10, '2024-03-18');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (7, 7, 4, 1, 'Metoprolol 50mg', '1 comprimido', '2x ao dia', 30, '2024-04-01');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (8, 8, 11, 2, 'Vitamina D 1000UI', '1 gota', '1x ao dia', 60, '2024-04-22');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (9, 9, 6, 5, 'Loratadina 10mg', '1 comprimido', '1x ao dia', 14, '2024-05-10');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (10, 10, 8, 3, 'Dipirona 500mg', '1 comprimido', '6/6h se dor', 5, '2024-06-05');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (11, 11, 10, 7, 'Propranolol 40mg', '1 comprimido', '2x ao dia', 30, '2024-06-15');
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication, dosage, frequency, duration_days, prescribed_at) VALUES (12, 14, 4, 4, 'Clonazepam 2mg', '1 comprimido', '1x ao dia ao deitar', 15, '2024-08-05');`,

   "ds-analytics": `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  plan TEXT NOT NULL,
  country TEXT
);

INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (1, 'joaosilva', 'joao@email.com', '2024-01-05', 'free', 'BR');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (2, 'marina_dev', 'marina@devmail.com', '2024-01-12', 'pro', 'US');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (3, 'carlos_tech', 'carlos@techcorp.com', '2024-01-20', 'enterprise', 'BR');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (4, 'emma_data', 'emma@analytics.io', '2024-02-01', 'pro', 'UK');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (5, 'rafael_mkt', 'rafael@agencia.com', '2024-02-15', 'free', 'BR');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (6, 'sarah_codes', 'sarah@gmail.com', '2024-03-01', 'pro', 'CA');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (7, 'tiago_prod', 'tiago@startup.io', '2024-03-10', 'enterprise', 'BR');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (8, 'laura_inbound', 'laura@marketing.com', '2024-04-05', 'free', 'US');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (9, 'diego_fullstack', 'diego@devhouse.com', '2024-04-20', 'pro', 'BR');
INSERT INTO users (id, username, email, signup_date, plan, country) VALUES (10, 'olivia_ux', 'olivia@design.studio', '2024-05-01', 'free', 'DE');

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  session_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  browser TEXT NOT NULL,
  os TEXT NOT NULL,
  ip_address TEXT,
  country TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER DEFAULT 0
);

INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (1, 1, 'sess_A1B2C3D4', 'mobile', 'Chrome Mobile', 'Android 14', '177.54.32.10', 'BR', '2024-01-10 08:30:00', '2024-01-10 08:45:12', 912);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (2, 2, 'sess_E5F6G7H8', 'desktop', 'Chrome 120', 'macOS 14', '192.168.1.50', 'US', '2024-01-15 14:00:00', '2024-01-15 15:23:45', 5025);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (3, 1, 'sess_I9J0K1L2', 'mobile', 'Safari Mobile', 'iOS 17', '177.54.32.10', 'BR', '2024-01-12 19:15:00', '2024-01-12 19:18:30', 210);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (4, 3, 'sess_M3N4O5P6', 'desktop', 'Firefox 122', 'Windows 11', '191.10.25.80', 'BR', '2024-01-25 09:00:00', '2024-01-25 09:45:20', 2720);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (5, 4, 'sess_Q7R8S9T0', 'desktop', 'Chrome 120', 'Windows 11', '85.12.45.67', 'UK', '2024-02-05 11:30:00', '2024-02-05 12:15:00', 2700);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (6, 5, 'sess_U1V2W3X4', 'mobile', 'Chrome Mobile', 'Android 13', '179.22.18.40', 'BR', '2024-02-20 10:00:00', '2024-02-20 10:08:55', 535);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (7, 2, 'sess_Y5Z6A7B8', 'desktop', 'Safari', 'macOS 14', '192.168.1.50', 'US', '2024-03-01 08:00:00', '2024-03-01 09:30:00', 5400);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (8, 6, 'sess_C9D0E1F2', 'mobile', 'Chrome Mobile', 'iOS 17', '67.89.12.34', 'CA', '2024-03-05 16:45:00', '2024-03-05 16:47:10', 130);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (9, 7, 'sess_G3H4I5J6', 'desktop', 'Edge 122', 'Windows 11', '189.45.67.23', 'BR', '2024-03-15 13:00:00', '2024-03-15 14:10:00', 4200);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (10, NULL, 'sess_K7L8M9N0', 'mobile', 'Safari Mobile', 'iOS 17', '201.50.30.10', 'BR', '2024-04-01 20:00:00', '2024-04-01 20:01:05', 65);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (11, 8, 'sess_O1P2Q3R4', 'desktop', 'Firefox 123', 'Windows 10', '98.76.54.32', 'US', '2024-04-10 15:00:00', '2024-04-10 15:30:45', 1845);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (12, 9, 'sess_S5T6U7V8', 'desktop', 'Chrome 121', 'Linux', '143.22.11.55', 'BR', '2024-04-25 10:30:00', '2024-04-25 11:15:00', 2700);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (13, 10, 'sess_W9X0Y1Z2', 'mobile', 'Brave Mobile', 'Android 14', '89.12.34.56', 'DE', '2024-05-05 09:00:00', '2024-05-05 09:02:30', 150);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (14, 3, 'sess_A3B4C5D6', 'tablet', 'Safari', 'iPadOS 17', '191.10.25.80', 'BR', '2024-05-10 21:00:00', '2024-05-10 21:35:00', 2100);
INSERT INTO sessions (id, user_id, session_id, device_type, browser, os, ip_address, country, started_at, ended_at, duration_seconds) VALUES (15, 1, 'sess_E7F8G9H0', 'desktop', 'Chrome 122', 'Windows 11', '177.54.32.10', 'BR', '2024-05-20 07:30:00', '2024-05-20 08:45:00', 4500);

CREATE TABLE page_views (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  time_on_page_seconds INTEGER DEFAULT 0,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (1, 'sess_A1B2C3D4', '/', 'Home', 'direct', 45, '2024-01-10 08:30:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (2, 'sess_A1B2C3D4', '/pricing', 'Pricing', '/', 120, '2024-01-10 08:30:45');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (3, 'sess_A1B2C3D4', '/signup', 'Sign Up', '/pricing', 300, '2024-01-10 08:32:45');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (4, 'sess_E5F6G7H8', '/dashboard', 'Dashboard', 'direct', 1800, '2024-01-15 14:00:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (5, 'sess_E5F6G7H8', '/settings', 'Settings', '/dashboard', 90, '2024-01-15 14:30:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (6, 'sess_E5F6G7H8', '/reports', 'Reports', '/dashboard', 300, '2024-01-15 14:31:30');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (7, 'sess_I9J0K1L2', '/blog', 'Blog', 'https://twitter.com', 120, '2024-01-12 19:15:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (8, 'sess_M3N4O5P6', '/', 'Home', 'direct', 30, '2024-01-25 09:00:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (9, 'sess_M3N4O5P6', '/features', 'Features', '/', 240, '2024-01-25 09:00:30');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (10, 'sess_M3N4O5P6', '/docs', 'Documentation', '/features', 600, '2024-01-25 09:04:30');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (11, 'sess_Q7R8S9T0', '/', 'Home', 'https://google.com', 60, '2024-02-05 11:30:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (12, 'sess_Q7R8S9T0', '/pricing', 'Pricing', '/', 180, '2024-02-05 11:31:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (13, 'sess_U1V2W3X4', '/blog/how-to-start', 'How to Start', 'https://google.com', 300, '2024-02-20 10:00:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (14, 'sess_Y5Z6A7B8', '/dashboard', 'Dashboard', 'direct', 900, '2024-03-01 08:00:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (15, 'sess_Y5Z6A7B8', '/team', 'Team', '/dashboard', 120, '2024-03-01 08:15:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (16, 'sess_Y5Z6A7B8', '/integrations', 'Integrations', '/dashboard', 600, '2024-03-01 08:17:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (17, 'sess_G3H4I5J6', '/', 'Home', 'direct', 15, '2024-03-15 13:00:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (18, 'sess_K7L8M9N0', '/blog', 'Blog', 'https://linkedin.com', 65, '2024-04-01 20:00:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (19, 'sess_W9X0Y1Z2', '/', 'Home', 'direct', 90, '2024-05-05 09:00:00');
INSERT INTO page_views (id, session_id, url, page_title, referrer, time_on_page_seconds, viewed_at) VALUES (20, 'sess_E7F8G9H0', '/dashboard', 'Dashboard', 'direct', 600, '2024-05-20 07:30:00');

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  value INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (1, 'sess_A1B2C3D4', 'button_click', 'engagement', 1, '2024-01-10 08:31:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (2, 'sess_A1B2C3D4', 'form_start', 'conversion', 1, '2024-01-10 08:31:30');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (3, 'sess_A1B2C3D4', 'form_submit', 'conversion', 1, '2024-01-10 08:35:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (4, 'sess_E5F6G7H8', 'export_report', 'action', 1, '2024-01-15 14:15:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (5, 'sess_E5F6G7H8', 'theme_change', 'preference', 1, '2024-01-15 14:30:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (6, 'sess_M3N4O5P6', 'search', 'engagement', 3, '2024-01-25 09:01:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (7, 'sess_M3N4O5P6', 'doc_scroll', 'engagement', 80, '2024-01-25 09:05:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (8, 'sess_Q7R8S9T0', 'pricing_view', 'engagement', 1, '2024-02-05 11:31:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (9, 'sess_Q7R8S9T0', 'faq_open', 'engagement', 2, '2024-02-05 11:32:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (10, 'sess_Y5Z6A7B8', 'invite_team', 'action', 5, '2024-03-01 08:20:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (11, 'sess_Y5Z6A7B8', 'api_key_create', 'action', 1, '2024-03-01 08:25:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (12, 'sess_G3H4I5J6', 'error_page', 'error', 1, '2024-03-15 13:01:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (13, 'sess_G3H4I5J6', 'support_chat', 'support', 1, '2024-03-15 13:05:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (14, 'sess_O1P2Q3R4', 'tutorial_start', 'onboarding', 1, '2024-04-10 15:05:00');
INSERT INTO events (id, session_id, event_name, event_category, value, created_at) VALUES (15, 'sess_S5T6U7V8', 'deploy', 'action', 1, '2024-04-25 10:45:00');

CREATE TABLE conversions (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id INTEGER,
  conversion_type TEXT NOT NULL,
  value REAL NOT NULL,
  converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (1, 'sess_A1B2C3D4', 1, 'signup', 0.00, '2024-01-10 08:35:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (2, 'sess_E5F6G7H8', 2, 'upgrade_pro', 199.00, '2024-01-15 15:00:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (3, 'sess_M3N4O5P6', 3, 'signup', 0.00, '2024-01-25 09:10:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (4, 'sess_Q7R8S9T0', 4, 'signup', 0.00, '2024-02-05 11:35:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (5, 'sess_Q7R8S9T0', 4, 'upgrade_pro', 199.00, '2024-02-10 14:00:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (6, 'sess_Y5Z6A7B8', 2, 'upgrade_enterprise', 999.00, '2024-03-01 09:00:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (7, 'sess_S5T6U7V8', 9, 'signup', 0.00, '2024-04-25 11:00:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (8, 'sess_S5T6U7V8', 9, 'upgrade_pro', 199.00, '2024-04-28 09:00:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (9, 'sess_W9X0Y1Z2', 10, 'signup', 0.00, '2024-05-05 09:01:00');
INSERT INTO conversions (id, session_id, user_id, conversion_type, value, converted_at) VALUES (10, 'sess_O1P2Q3R4', 8, 'signup', 0.00, '2024-04-10 15:20:00');`,

   "ds-social": `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (1, 'luna_star', 'Luna Star', 'luna@social.com', 'Fotógrafa e viajante. Amante de café e gatos.', '/avatars/1.jpg', 1240, 380, '2023-06-01');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (2, 'tech_wizard', 'Tech Wizard', 'tech@devhouse.com', 'Full-stack dev. Open source enthusiast.', '/avatars/2.jpg', 3400, 520, '2023-06-15');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (3, 'art_by_ana', 'Ana Artista', 'ana@artstudio.com', 'Ilustradora digital. Rio de Janeiro.', '/avatars/3.jpg', 890, 210, '2023-07-01');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (4, 'green_earth', 'Green Earth', 'green@eco.org', 'Ambientalista. Menos plástico, mais vida!', '/avatars/4.jpg', 5600, 890, '2023-07-20');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (5, 'chef_maestro', 'Chef Maestro', 'chef@gourmet.com', 'Chef de cozinha. Receitas e dicas.', '/avatars/5.jpg', 2100, 340, '2023-08-05');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (6, 'fit_life', 'Fit Life', 'fit@wellness.com', 'Personal trainer. Saúde e bem-estar.', '/avatars/6.jpg', 7800, 420, '2023-08-20');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (7, 'music_maker', 'Music Maker', 'music@studio.com', 'Produtor musical. Guitarrista.', '/avatars/7.jpg', 1500, 290, '2023-09-01');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (8, 'bookworm_br', 'Bookworm BR', 'books@reader.com', 'Leitora voraz. 50 livros por ano.', '/avatars/8.jpg', 4300, 670, '2023-09-15');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (9, 'astro_observer', 'Astro Observer', 'astro@space.com', 'Astrofotografia amadora. Astronomia.', '/avatars/9.jpg', 980, 150, '2023-10-01');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (10, 'retro_gamer', 'Retro Gamer', 'gamer@retro.com', 'Games retrô e colecionáveis.', '/avatars/10.jpg', 3200, 480, '2023-10-15');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (11, 'travel_tales', 'Travel Tales', 'travel@explorer.com', 'Moendo o mundo. 30 países e contando.', '/avatars/11.jpg', 12500, 920, '2023-11-01');
INSERT INTO users (id, username, display_name, email, bio, avatar_url, followers_count, following_count, created_at) VALUES (12, 'coder_pixel', 'Coder Pixel', 'pixel@code.dev', 'Game dev e pixel artist.', '/avatars/12.jpg', 670, 180, '2023-11-20');

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (1, 1, 'Pôr do sol na Praia do Rosa hoje. Que lugar mágico!', '/posts/sunset.jpg', 234, 18, 12, 1, '2024-01-05 18:30:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (2, 2, 'Acabei de contribuir com meu primeiro PR para o React! 🚀', NULL, 567, 45, 89, 1, '2024-01-10 14:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (3, 3, 'Nova ilustração finalizada: Floresta Encantada. O que acham?', '/posts/forest.jpg', 445, 32, 56, 1, '2024-01-15 10:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (4, 4, 'Mutirão de limpeza na praia esse sábado. Quem vem?', '/posts/beach-clean.jpg', 892, 67, 145, 1, '2024-02-01 09:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (5, 5, 'Receita nova: Risoto de Limão Siciliano com Aspargos. Link nos comentários!', '/posts/risoto.jpg', 345, 28, 34, 1, '2024-02-10 12:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (6, 6, 'Treino de pernas de hoje: 4 exercícios, 4 séries cada. Bora crescer!', '/posts/workout.jpg', 678, 52, 23, 1, '2024-02-20 07:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (7, 7, 'Nova música no SoundCloud! Link na bio. É uma balada instrumental.', NULL, 156, 12, 45, 1, '2024-03-05 20:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (8, 8, 'Resenha: "O Problema dos Três Corpos" - Simplesmente genial. Nota 9.5/10', NULL, 423, 38, 67, 1, '2024-03-15 19:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (9, 9, 'Registrei a Via Láctea hoje de madrugada. 3h de exposição!', '/posts/milky-way.jpg', 1234, 89, 234, 1, '2024-04-01 05:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (10, 10, 'Completei minha coleção de cartuchos do Super Nintendo! Todos originais!', '/posts/snes-collection.jpg', 567, 43, 78, 1, '2024-04-15 15:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (11, 11, 'Tóquio é surreal! Cada esquina é uma foto nova.', '/posts/tokyo.jpg', 2345, 156, 345, 1, '2024-05-01 11:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (12, 12, 'Meu primeiro jogo está na Steam! Link na bio. 2 anos de desenvolvimento!', '/posts/game-launch.jpg', 890, 67, 123, 1, '2024-05-10 18:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (13, 2, 'Dica rápida: use TypeScript satisfiability operators para tipos mais seguros. Thread abaixo.', NULL, 234, 15, 56, 1, '2024-05-20 09:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (14, 6, 'Transformação em 6 meses de treino consistente. Resultados vêm com disciplina!', '/posts/transformation.jpg', 3456, 234, 567, 1, '2024-06-01 08:00:00');
INSERT INTO posts (id, user_id, content, image_url, likes_count, comments_count, shares_count, is_published, created_at) VALUES (15, 4, 'Mais de 1000 mudas plantadas esse ano! Cada árvore importa 🌳', '/posts/planting.jpg', 4567, 345, 890, 1, '2024-06-10 10:00:00');

CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (1, 1, 3, 'Que foto linda! Qual câmera você usou?', 12, '2024-01-05 19:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (2, 1, 5, 'Praia do Rosa é meu lugar favorito no Brasil!', 8, '2024-01-05 19:30:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (3, 2, 7, 'Parabéns pela contribuição! React fica melhor com você!', 34, '2024-01-10 15:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (4, 2, 8, 'Qual foi o PR? Manda o link!', 15, '2024-01-10 15:30:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (5, 3, 1, 'Uau, que detalhamento! Você vende prints?', 23, '2024-01-15 11:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (6, 4, 1, 'Estarei lá! Levo sacos extras.', 45, '2024-02-01 10:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (7, 4, 9, 'Vou levar minha família também!', 32, '2024-02-01 11:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (8, 5, 11, 'Fiz essa receita ontem! Ficou divina!', 18, '2024-02-10 13:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (9, 6, 10, 'Qual exercício você recomenda para iniciante?', 7, '2024-02-20 08:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (10, 8, 12, 'Esse livro é fantástico! A trilogia inteira é incrível.', 28, '2024-03-15 20:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (11, 9, 2, 'Que foto espetacular! Qual configuração usou?', 56, '2024-04-01 06:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (12, 10, 3, 'Inveja boa! Quanto tempo de coleção?', 15, '2024-04-15 16:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (13, 11, 7, 'Tóquio está na minha lista! Alguma dica?', 34, '2024-05-01 12:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (14, 11, 4, 'O contraste entre tradição e modernidade é fascinante!', 22, '2024-05-01 13:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (15, 12, 2, 'Parabéns pelo lançamento! Vou baixar hoje!', 45, '2024-05-10 19:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (16, 13, 6, 'Thread sensacional! Já salvei pra estudar.', 12, '2024-05-20 10:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (17, 14, 5, 'Resultado incrível! Qual sua dieta?', 67, '2024-06-01 09:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (18, 14, 8, 'Disciplina é tudo! Inspirador!', 45, '2024-06-01 10:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (19, 15, 1, 'Que projeto lindo! O planeta agradece 🌎', 89, '2024-06-10 11:00:00');
INSERT INTO comments (id, post_id, user_id, content, likes_count, created_at) VALUES (20, 15, 3, 'Como posso participar? Quero ajudar!', 56, '2024-06-10 12:00:00');

CREATE TABLE likes (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO likes (id, user_id, post_id, created_at) VALUES (1, 2, 1, '2024-01-05 19:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (2, 3, 1, '2024-01-05 19:15:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (3, 5, 1, '2024-01-05 19:30:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (4, 1, 2, '2024-01-10 14:30:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (5, 3, 2, '2024-01-10 15:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (6, 4, 2, '2024-01-10 15:30:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (7, 7, 2, '2024-01-10 16:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (8, 8, 2, '2024-01-10 16:30:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (9, 1, 3, '2024-01-15 11:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (10, 2, 3, '2024-01-15 12:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (11, 6, 3, '2024-01-15 13:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (12, 1, 4, '2024-02-01 10:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (13, 3, 4, '2024-02-01 11:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (14, 9, 4, '2024-02-01 12:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (15, 10, 4, '2024-02-01 13:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (16, 2, 5, '2024-02-10 13:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (17, 11, 5, '2024-02-10 14:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (18, 1, 6, '2024-02-20 08:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (19, 10, 6, '2024-02-20 09:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (20, 12, 6, '2024-02-20 10:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (21, 4, 7, '2024-03-05 21:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (22, 5, 8, '2024-03-15 20:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (23, 1, 8, '2024-03-15 21:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (24, 12, 8, '2024-03-15 22:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (25, 2, 9, '2024-04-01 06:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (26, 4, 9, '2024-04-01 07:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (27, 7, 9, '2024-04-01 08:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (28, 1, 10, '2024-04-15 16:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (29, 3, 10, '2024-04-15 17:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (30, 8, 10, '2024-04-15 18:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (31, 2, 11, '2024-05-01 12:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (32, 4, 11, '2024-05-01 13:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (33, 6, 11, '2024-05-01 14:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (34, 10, 11, '2024-05-01 15:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (35, 1, 12, '2024-05-10 19:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (36, 3, 12, '2024-05-10 20:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (37, 5, 12, '2024-05-10 21:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (38, 7, 12, '2024-05-10 22:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (39, 9, 12, '2024-05-10 23:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (40, 4, 14, '2024-06-01 09:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (41, 5, 14, '2024-06-01 10:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (42, 8, 14, '2024-06-01 11:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (43, 10, 14, '2024-06-01 12:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (44, 1, 15, '2024-06-10 11:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (45, 2, 15, '2024-06-10 12:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (46, 3, 15, '2024-06-10 13:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (47, 5, 15, '2024-06-10 14:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (48, 7, 15, '2024-06-10 15:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (49, 9, 15, '2024-06-10 16:00:00');
INSERT INTO likes (id, user_id, post_id, created_at) VALUES (50, 11, 15, '2024-06-10 17:00:00');

CREATE TABLE follows (
  id INTEGER PRIMARY KEY,
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (1, 1, 2, '2024-01-06');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (2, 1, 4, '2024-01-06');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (3, 2, 1, '2024-01-11');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (4, 2, 6, '2024-01-11');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (5, 3, 1, '2024-01-16');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (6, 3, 8, '2024-01-16');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (7, 4, 1, '2024-02-02');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (8, 4, 9, '2024-02-02');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (9, 5, 4, '2024-02-11');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (10, 5, 11, '2024-02-11');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (11, 6, 2, '2024-02-21');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (12, 6, 5, '2024-02-21');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (13, 7, 11, '2024-03-06');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (14, 8, 3, '2024-03-16');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (15, 8, 4, '2024-03-16');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (16, 9, 11, '2024-04-02');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (17, 10, 1, '2024-04-16');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (18, 10, 8, '2024-04-16');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (19, 11, 1, '2024-05-02');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (20, 11, 4, '2024-05-02');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (21, 11, 6, '2024-05-02');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (22, 12, 2, '2024-05-11');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (23, 12, 4, '2024-05-11');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (24, 1, 11, '2024-06-01');
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (25, 12, 10, '2024-06-01');`,

   "ds-finance": `CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT,
  color TEXT
);

INSERT INTO categories (id, name, type, icon, color) VALUES (1, 'Salário', 'income', 'briefcase', '#22c55e');
INSERT INTO categories (id, name, type, icon, color) VALUES (2, 'Freelance', 'income', 'code', '#3b82f6');
INSERT INTO categories (id, name, type, icon, color) VALUES (3, 'Investimentos', 'income', 'trending-up', '#8b5cf6');
INSERT INTO categories (id, name, type, icon, color) VALUES (4, 'Alimentação', 'expense', 'shopping-cart', '#ef4444');
INSERT INTO categories (id, name, type, icon, color) VALUES (5, 'Transporte', 'expense', 'car', '#f97316');
INSERT INTO categories (id, name, type, icon, color) VALUES (6, 'Moradia', 'expense', 'home', '#eab308');
INSERT INTO categories (id, name, type, icon, color) VALUES (7, 'Saúde', 'expense', 'heart', '#ec4899');
INSERT INTO categories (id, name, type, icon, color) VALUES (8, 'Lazer', 'expense', 'gamepad-2', '#06b6d4');
INSERT INTO categories (id, name, type, icon, color) VALUES (9, 'Educação', 'expense', 'book-open', '#6366f1');
INSERT INTO categories (id, name, type, icon, color) VALUES (10, 'Assinaturas', 'expense', 'repeat', '#14b8a6');

CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  bank TEXT NOT NULL,
  balance REAL NOT NULL,
  credit_limit REAL,
  due_day INTEGER,
  closing_day INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO accounts (id, name, type, bank, balance, credit_limit, due_day, closing_day, created_at) VALUES (1, 'Conta Corrente', 'checking', 'Nubank', 5430.50, NULL, NULL, NULL, '2023-01-01');
INSERT INTO accounts (id, name, type, bank, balance, credit_limit, due_day, closing_day, created_at) VALUES (2, 'Conta Salário', 'checking', 'Itaú', 3200.00, NULL, NULL, NULL, '2023-01-01');
INSERT INTO accounts (id, name, type, bank, balance, credit_limit, due_day, closing_day, created_at) VALUES (3, 'Poupança', 'savings', 'Caixa', 25000.00, NULL, NULL, NULL, '2023-01-01');
INSERT INTO accounts (id, name, type, bank, balance, credit_limit, due_day, closing_day, created_at) VALUES (4, 'Cartão Nubank', 'credit', 'Nubank', -1280.00, 5000.00, 15, 10, '2023-02-01');
INSERT INTO accounts (id, name, type, bank, balance, credit_limit, due_day, closing_day, created_at) VALUES (5, 'Cartão Itaú', 'credit', 'Itaú', -230.00, 8000.00, 20, 15, '2023-03-01');
INSERT INTO accounts (id, name, type, bank, balance, credit_limit, due_day, closing_day, created_at) VALUES (6, 'Carteira Investimento', 'investment', 'XP Investimentos', 45000.00, NULL, NULL, NULL, '2023-04-01');
INSERT INTO accounts (id, name, type, bank, balance, credit_limit, due_day, closing_day, created_at) VALUES (7, 'Criptomoedas', 'investment', 'Binance', 8500.00, NULL, NULL, NULL, '2024-01-01');

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_recurring INTEGER DEFAULT 0
);

INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (1, 1, 1, 6500.00, 'Salário Janeiro', '2024-01-05', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (2, 1, 4, -450.00, 'Supermercado Extra', '2024-01-06', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (3, 1, 6, -1800.00, 'Aluguel', '2024-01-08', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (4, 1, 5, -120.00, 'Uber', '2024-01-10', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (5, 4, 4, -89.00, 'Restaurante Osaka', '2024-01-12', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (6, 4, 8, -35.00, 'Netflix', '2024-01-15', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (7, 4, 10, -19.90, 'Spotify', '2024-01-15', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (8, 1, 2, 2500.00, 'Projeto Site Cliente X', '2024-01-20', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (9, 1, 7, -200.00, 'Plano de Saúde', '2024-01-22', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (10, 6, 3, 1000.00, 'Dividendos Janeiro', '2024-01-25', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (11, 1, 1, 6500.00, 'Salário Fevereiro', '2024-02-05', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (12, 1, 6, -1800.00, 'Aluguel', '2024-02-08', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (13, 4, 9, -250.00, 'Curso Udemy React Avançado', '2024-02-10', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (14, 1, 5, -300.00, 'Seguro Carro', '2024-02-15', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (15, 1, 4, -320.00, 'Supermercado Pão de Açúcar', '2024-02-18', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (16, 7, 3, -500.00, 'Compra Bitcoin', '2024-02-20', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (17, 1, 8, -150.00, 'Cinema e Jantar', '2024-02-22', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (18, 1, 1, 6500.00, 'Salário Março', '2024-03-05', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (19, 1, 6, -1800.00, 'Aluguel', '2024-03-08', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (20, 4, 4, -65.00, 'Ifood', '2024-03-10', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (21, 1, 9, -800.00, 'Faculdade Mensalidade', '2024-03-12', 1);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (22, 6, 3, 1500.00, 'Venda Ações', '2024-03-15', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (23, 1, 4, -550.00, 'Supermercado Carrefour', '2024-03-20', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (24, 7, 3, 1200.00, 'Venda Ethereum', '2024-03-25', 0);
INSERT INTO transactions (id, account_id, category_id, amount, description, transaction_date, is_recurring) VALUES (25, 1, 5, -45.00, 'Gasolina', '2024-03-28', 0);

CREATE TABLE budgets (
  id INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  limit_amount REAL NOT NULL,
  spent_amount REAL DEFAULT 0
);

INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (1, 4, 'January', 2024, 1200.00, 980.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (2, 5, 'January', 2024, 500.00, 420.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (3, 8, 'January', 2024, 300.00, 185.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (4, 4, 'February', 2024, 1200.00, 320.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (5, 5, 'February', 2024, 500.00, 300.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (6, 9, 'February', 2024, 500.00, 250.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (7, 4, 'March', 2024, 1200.00, 615.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (8, 5, 'March', 2024, 500.00, 45.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (9, 8, 'March', 2024, 300.00, 150.00);
INSERT INTO budgets (id, category_id, month, year, limit_amount, spent_amount) VALUES (10, 9, 'March', 2024, 800.00, 800.00);

CREATE TABLE investments (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount_invested REAL NOT NULL,
  current_value REAL NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  maturity_date TIMESTAMP
);

INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (1, 6, 'Tesouro Selic 2026', 'Tesouro Direto', 5000.00, 5230.00, '2023-06-01', '2026-06-01');
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (2, 6, 'Tesouro IPCA+ 2028', 'Tesouro Direto', 8000.00, 8760.00, '2023-08-15', '2028-08-15');
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (3, 6, 'Fundo Multimercado XP', 'Fundos', 10000.00, 11200.00, '2023-03-10', NULL);
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (4, 6, 'Ações PETR4', 'Ações', 3000.00, 3850.00, '2023-09-20', NULL);
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (5, 6, 'Ações VALE3', 'Ações', 4000.00, 4280.00, '2023-10-05', NULL);
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (6, 6, 'ETF BOVA11', 'ETF', 6000.00, 6480.00, '2024-01-08', NULL);
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (7, 6, 'FII XPML11', 'FII', 5000.00, 5300.00, '2024-02-01', NULL);
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (8, 7, 'Bitcoin', 'Criptomoeda', 4000.00, 5600.00, '2024-01-15', NULL);
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (9, 7, 'Ethereum', 'Criptomoeda', 3000.00, 2900.00, '2024-02-20', NULL);
INSERT INTO investments (id, account_id, name, type, amount_invested, current_value, purchase_date, maturity_date) VALUES (10, 7, 'Solana', 'Criptomoeda', 2000.00, 1800.00, '2024-03-01', NULL);`,
}

export function listDatasets(): AsyncAppResult<Dataset[]> {
   return Promise.resolve(ok(DATASETS))
}

export function getDatasetSQL(datasetId: string): AsyncAppResult<string> {
   const sql = SAMPLE_DATASETS[datasetId]
   if (!sql)
      return Promise.resolve(
         err(new ImportError("import:parse_failed", `Dataset ${datasetId} not found`))
      )
   return Promise.resolve(ok(sql))
}
