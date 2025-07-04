export class MemStorage {
    constructor() {
        this.users = new Map();
        this.products = new Map();
        this.categories = new Map();
        this.cartItems = new Map();
        this.orders = new Map();
        this.orderItems = new Map();
        this.currentUserId = 1;
        this.currentProductId = 1;
        this.currentCategoryId = 1;
        this.currentCartItemId = 1;
        this.currentOrderId = 1;
        this.currentOrderItemId = 1;
        this.seedData();
    }

    seedData() {
        // Seed categories
        const categoriesData = [
            {
                name: "Web Developers & Agencies",
                slug: "web-developers",
                icon: "fas fa-code",
                description: "VPS plans for web development and agency workflows",
            },
            {
                name: "E-Commerce Stores",
                slug: "ecommerce-stores",
                icon: "fas fa-shopping-cart",
                description: "VPS plans for online stores and e-commerce platforms",
            },
            {
                name: "SaaS Startups",
                slug: "saas-startups",
                icon: "fas fa-server",
                description: "VPS plans for SaaS applications and startups",
            },
            {
                name: "Game Servers",
                slug: "game-servers",
                icon: "fas fa-gamepad",
                description: "VPS plans for hosting game servers with low latency",
            },
            {
                name: "Forex Traders",
                slug: "forex-traders",
                icon: "fas fa-chart-line",
                description: "VPS plans for automated trading and financial algorithms",
            },
            {
                name: "VPN Hosting",
                slug: "vpn-hosting",
                icon: "fas fa-lock",
                description: "VPS plans for secure VPN hosting and tunneling",
            },
            {
                name: "Developers / DevOps",
                slug: "devops",
                icon: "fas fa-terminal",
                description: "VPS plans for DevOps pipelines and development workflows",
            },
            {
                name: "Crypto / Blockchain",
                slug: "crypto-blockchain",
                icon: "fas fa-coins",
                description: "VPS plans for blockchain nodes and crypto applications",
            },
            {
                name: "Bloggers & Creators",
                slug: "bloggers-creators",
                icon: "fas fa-blog",
                description: "VPS plans for blogs, podcasts, and content creators",
            },
            {
                name: "Ethical Hackers / Cybersecurity",
                slug: "cybersecurity",
                icon: "fas fa-shield-alt",
                description: "VPS plans for ethical hacking and security testing",
            },
        ];
        categoriesData.forEach((cat) => {
            const category = { id: this.currentCategoryId++, ...cat };
            this.categories.set(category.id, category);
        });

        // Seed products
        const productsData = [
            // Web Developers & Agencies (Category ID: 1)
            {
                title: "DevBox Lite",
                description: "Entry-level VPS for web developers with optimized resources.",
                price: "140.00",
                categoryId: 1,
                tags: ["web-dev", "vps", "lite"],
                isFree: false,
            },
            {
                title: "CodeNest Pro",
                description: "Professional VPS for agencies with enhanced performance.",
                price: "260.00",
                categoryId: 1,
                tags: ["web-dev", "vps", "pro"],
                isFree: false,
            },
            {
                title: "BuildStack Pro",
                description: "Balanced VPS for development teams with robust resources.",
                price: "180.00",
                categoryId: 1,
                tags: ["web-dev", "vps", "build"],
                isFree: false,
            },
            {
                title: "GitReady VPS",
                description: "High-performance VPS for Git workflows.",
                price: "310.00",
                categoryId: 1,
                tags: ["web-dev", "vps", "git"],
                isFree: false,
            },
            {
                title: "StackForge Elite",
                description: "Elite VPS for large-scale web projects.",
                price: "485.00",
                categoryId: 1,
                tags: ["web-dev", "vps", "elite"],
                isFree: false,
            },
            // E-Commerce Stores (Category ID: 2)
            {
                title: "ShopLaunch VPS",
                description: "VPS for small e-commerce stores with reliable performance.",
                price: "250.00",
                categoryId: 2,
                tags: ["ecommerce", "vps", "shop"],
                isFree: false,
            },
            {
                title: "CarSpeed Turbo",
                description: "Fast VPS for e-commerce with optimized speed.",
                price: "195.00",
                categoryId: 2,
                tags: ["ecommerce", "vps", "turbo"],
                isFree: false,
            },
            {
                title: "EonCore XL",
                description: "Powerful VPS for large e-commerce stores.",
                price: "410.00",
                categoryId: 2,
                tags: ["ecommerce", "vps", "xl"],
                isFree: false,
            },
            {
                title: "StorePilot Pro",
                description: "Advanced VPS for e-commerce platforms.",
                price: "350.00",
                categoryId: 2,
                tags: ["ecommerce", "vps", "pro"],
                isFree: false,
            },
            {
                title: "CheckoutMax VPS",
                description: "High-capacity VPS for e-commerce checkouts.",
                price: "445.00",
                categoryId: 2,
                tags: ["ecommerce", "vps", "max"],
                isFree: false,
            },
            // SaaS Startups (Category ID: 3)
            {
                title: "SaaSBoot Lite",
                description: "Lightweight VPS for SaaS startups with essential resources.",
                price: "285.00",
                categoryId: 3,
                tags: ["saas", "vps", "lite"],
                isFree: false,
            },
            {
                title: "CodeScale VPS",
                description: "Entry-level VPS for scalable SaaS applications.",
                price: "120.00",
                categoryId: 3,
                tags: ["saas", "vps", "scale"],
                isFree: false,
            },
            {
                title: "APIForge Cloud",
                description: "High-performance VPS for SaaS APIs.",
                price: "475.00",
                categoryId: 3,
                tags: ["saas", "vps", "api"],
                isFree: false,
            },
            {
                title: "LambdaPro Node",
                description: "VPS for serverless SaaS applications.",
                price: "325.00",
                categoryId: 3,
                tags: ["saas", "vps", "lambda"],
                isFree: false,
            },
            {
                title: "ScaleShip X",
                description: "Scalable VPS for growing SaaS platforms.",
                price: "410.00",
                categoryId: 3,
                tags: ["saas", "vps", "scale"],
                isFree: false,
            },
            // Game Servers (Category ID: 4)
            {
                title: "GameForge VPS",
                description: "VPS for game servers with high performance.",
                price: "320.00",
                categoryId: 4,
                tags: ["gaming", "vps", "game"],
                isFree: false,
            },
            {
                title: "UltraPing Pro",
                description: "Low-latency VPS for gaming servers.",
                price: "290.00",
                categoryId: 4,
                tags: ["gaming", "vps", "low-latency"],
                isFree: false,
            },
            {
                title: "HostArena Max",
                description: "High-capacity VPS for large game servers.",
                price: "445.00",
                categoryId: 4,
                tags: ["gaming", "vps", "max"],
                isFree: false,
            },
            {
                title: "BattleCore Elite",
                description: "VPS for competitive gaming with robust resources.",
                price: "190.00",
                categoryId: 4,
                tags: ["gaming", "vps", "elite"],
                isFree: false,
            },
            {
                title: "StreamCraft VPS",
                description: "VPS for game streaming with high bandwidth.",
                price: "365.00",
                categoryId: 4,
                tags: ["gaming", "vps", "streaming"],
                isFree: false,
            },
            // Forex Traders (Category ID: 5)
            {
                title: "ForexPing VPS",
                description: "Low-latency VPS for forex trading.",
                price: "125.00",
                categoryId: 5,
                tags: ["forex", "vps", "low-latency"],
                isFree: false,
            },
            {
                title: "FXUltraNode",
                description: "High-performance VPS for forex trading.",
                price: "390.00",
                categoryId: 5,
                tags: ["forex", "vps", "ultra"],
                isFree: false,
            },
            {
                title: "TradeSync Pro",
                description: "VPS for synchronized forex trading.",
                price: "235.00",
                categoryId: 5,
                tags: ["forex", "vps", "pro"],
                isFree: false,
            },
            {
                title: "MetaBox VPS",
                description: "VPS optimized for MetaTrader platforms.",
                price: "305.00",
                categoryId: 5,
                tags: ["forex", "vps", "metatrader"],
                isFree: false,
            },
            {
                title: "ScalperEdge X",
                description: "Elite VPS for forex scalping strategies.",
                price: "475.00",
                categoryId: 5,
                tags: ["forex", "vps", "scalping"],
                isFree: false,
            },
            // VPN Hosting (Category ID: 6)
            {
                title: "VPNForge Node",
                description: "VPS for secure VPN hosting.",
                price: "270.00",
                categoryId: 6,
                tags: ["vpn", "vps", "node"],
                isFree: false,
            },
            {
                title: "AnonyBox VPS",
                description: "Entry-level VPS for VPN anonymity.",
                price: "110.00",
                categoryId: 6,
                tags: ["vpn", "vps", "anonymity"],
                isFree: false,
            },
            {
                title: "TunnelX Pro",
                description: "VPS for secure VPN tunneling.",
                price: "325.00",
                categoryId: 6,
                tags: ["vpn", "vps", "pro"],
                isFree: false,
            },
            {
                title: "MaskedNet Elite",
                description: "High-performance VPS for VPN networks.",
                price: "440.00",
                categoryId: 6,
                tags: ["vpn", "vps", "elite"],
                isFree: false,
            },
            {
                title: "OpenWire VPS",
                description: "VPS for open-source VPN solutions.",
                price: "155.00",
                categoryId: 6,
                tags: ["vpn", "vps", "open-source"],
                isFree: false,
            },
            // Developers / DevOps (Category ID: 7)
            {
                title: "DevOpsNode VPS",
                description: "VPS for DevOps workflows with essential resources.",
                price: "180.00",
                categoryId: 7,
                tags: ["devops", "vps", "node"],
                isFree: false,
            },
            {
                title: "Ci/CD Runner",
                description: "VPS for CI/CD pipelines with optimized performance.",
                price: "230.00",
                categoryId: 7,
                tags: ["devops", "vps", "cicd"],
                isFree: false,
            },
            {
                title: "CodeOps Elite",
                description: "Elite VPS for advanced DevOps workflows.",
                price: "365.00",
                categoryId: 7,
                tags: ["devops", "vps", "elite"],
                isFree: false,
            },
            {
                title: "BuildZone Pro",
                description: "High-performance VPS for DevOps builds.",
                price: "420.00",
                categoryId: 7,
                tags: ["devops", "vps", "pro"],
                isFree: false,
            },
            {
                title: "AutoStack VPS",
                description: "Automated VPS for DevOps pipelines.",
                price: "290.00",
                categoryId: 7,
                tags: ["devops", "vps", "auto"],
                isFree: false,
            },
            // Crypto / Blockchain (Category ID: 8)
            {
                title: "BlockNode VPS",
                description: "VPS for blockchain nodes with high capacity.",
                price: "460.00",
                categoryId: 8,
                tags: ["crypto", "vps", "blockchain"],
                isFree: false,
            },
            {
                title: "CryptoPulse Pro",
                description: "VPS for crypto applications with optimized resources.",
                price: "205.00",
                categoryId: 8,
                tags: ["crypto", "vps", "pro"],
                isFree: false,
            },
            {
                title: "ChainCore VPS",
                description: "VPS for blockchain infrastructure.",
                price: "395.00",
                categoryId: 8,
                tags: ["crypto", "vps", "core"],
                isFree: false,
            },
            {
                title: "MinerVault Elite",
                description: "VPS for crypto mining operations.",
                price: "330.00",
                categoryId: 8,
                tags: ["crypto", "vps", "mining"],
                isFree: false,
            },
            {
                title: "DefiDrive Node",
                description: "VPS for DeFi applications with essential resources.",
                price: "115.00",
                categoryId: 8,
                tags: ["crypto", "vps", "defi"],
                isFree: false,
            },
            // Bloggers & Creators (Category ID: 9)
            {
                title: "BlogBoost VPS",
                description: "VPS for blogs with optimized performance.",
                price: "140.00",
                categoryId: 9,
                tags: ["blog", "vps", "content"],
                isFree: false,
            },
            {
                title: "StoryHost Pro",
                description: "VPS for content creators with robust resources.",
                price: "245.00",
                categoryId: 9,
                tags: ["blog", "vps", "pro"],
                isFree: false,
            },
            {
                title: "WriteZone Elite",
                description: "VPS for blogging platforms with high performance.",
                price: "190.00",
                categoryId: 9,
                tags: ["blog", "vps", "elite"],
                isFree: false,
            },
            {
                title: "ContentCore VPS",
                description: "High-performance VPS for content creators.",
                price: "385.00",
                categoryId: 9,
                tags: ["blog", "vps", "core"],
                isFree: false,
            },
            {
                title: "PodPage VPS",
                description: "VPS for podcasters with optimized resources.",
                price: "320.00",
                categoryId: 9,
                tags: ["blog", "vps", "podcast"],
                isFree: false,
            },
            // Ethical Hackers / Cybersecurity (Category ID: 10)
            {
                title: "KaliX Lab VPS",
                description: "VPS for ethical hacking labs with essential resources.",
                price: "170.00",
                categoryId: 10,
                tags: ["cybersecurity", "vps", "kali"],
                isFree: false,
            },
            {
                title: "GhostOps Node",
                description: "VPS for security testing with robust performance.",
                price: "260.00",
                categoryId: 10,
                tags: ["cybersecurity", "vps", "ops"],
                isFree: false,
            },
            {
                title: "HackLab Elite",
                description: "High-performance VPS for cybersecurity labs.",
                price: "490.00",
                categoryId: 10,
                tags: ["cybersecurity", "vps", "elite"],
                isFree: false,
            },
            {
                title: "ParrotShell VPS",
                description: "VPS for cybersecurity testing with optimized resources.",
                price: "145.00",
                categoryId: 10,
                tags: ["cybersecurity", "vps", "parrot"],
                isFree: false,
            },
            {
                title: "AnonBox Pro",
                description: "VPS for anonymous security testing.",
                price: "365.00",
                categoryId: 10,
                tags: ["cybersecurity", "vps", "anon"],
                isFree: false,
            },
        ];
        productsData.forEach((prod) => {
            const product = {
                id: this.currentProductId++,
                ...prod,
                originalPrice: null,
                downloadUrl: `/downloads/${prod.title.toLowerCase().replace(/\s+/g, "-")}.zip`,
                rating: "4.5",
                reviewCount: 100,
                downloadCount: 500,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.products.set(product.id, product);
        });
    }

    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async getUserByEmail(email) {
        return Array.from(this.users.values()).find((user) => user.email === email);
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = {
            ...insertUser,
            firstName: insertUser.firstName || null,
            lastName: insertUser.lastName || null,
            id,
            createdAt: new Date(),
        };
        this.users.set(id, user);
        return user;
    }
    async getAllCategories() {
        return Array.from(this.categories.values());
    }
    async createCategory(insertCategory) {
        const id = this.currentCategoryId++;
        const category = {
            ...insertCategory,
            description: insertCategory.description || null,
            id,
        };
        this.categories.set(id, category);
        return category;
    }
    async getAllProducts() {
        const products = Array.from(this.products.values());
        return products.map((product) => ({
            ...product,
            category: this.categories.get(product.categoryId),
        }));
    }
    async getProductById(id) {
        const product = this.products.get(id);
        if (!product)
            return undefined;
        return {
            ...product,
            category: this.categories.get(product.categoryId),
        };
    }
    async getProductsByCategory(categoryId) {
        const products = Array.from(this.products.values()).filter((p) => p.categoryId === categoryId);
        return products.map((product) => ({
            ...product,
            category: this.categories.get(product.categoryId),
        }));
    }
    async searchProducts(query) {
        const lowercaseQuery = query.toLowerCase();
        const products = Array.from(this.products.values()).filter((product) => product.title.toLowerCase().includes(lowercaseQuery) ||
            product.description.toLowerCase().includes(lowercaseQuery) ||
            (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))));
        return products.map((product) => ({
            ...product,
            category: this.categories.get(product.categoryId),
        }));
    }
    async createProduct(insertProduct) {
        const id = this.currentProductId++;
        const product = {
            ...insertProduct,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.products.set(id, product);
        return product;
    }
    async getCartItems(userId) {
        const userCartItems = Array.from(this.cartItems.values()).filter((item) => item.userId === userId);
        return userCartItems.map((item) => {
            const product = this.products.get(item.productId);
            return {
                ...item,
                product: {
                    ...product,
                    category: this.categories.get(product.categoryId),
                },
            };
        });
    }
    async addToCart(insertCartItem) {
        const key = `${insertCartItem.userId}-${insertCartItem.productId}`;
        const existing = this.cartItems.get(key);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (insertCartItem.quantity || 1);
            return existing;
        }
        const id = this.currentCartItemId++;
        const cartItem = {
            ...insertCartItem,
            quantity: insertCartItem.quantity || 1,
            id,
            createdAt: new Date(),
        };
        this.cartItems.set(key, cartItem);
        return cartItem;
    }
    async removeFromCart(userId, productId) {
        const key = `${userId}-${productId}`;
        this.cartItems.delete(key);
    }
    async clearCart(userId) {
        Array.from(this.cartItems.entries()).forEach(([key, item]) => {
            if (item.userId === userId) {
                this.cartItems.delete(key);
            }
        });
    }
    async getUserOrders(userId) {
        const userOrders = Array.from(this.orders.values()).filter((order) => order.userId === userId);
        return userOrders.map((order) => ({
            ...order,
            items: (this.orderItems.get(order.id) || []).map((item) => ({
                ...item,
                product: this.products.get(item.productId),
            })),
        }));
    }
    async getOrderById(id) {
        const order = this.orders.get(id);
        if (!order)
            return undefined;
        return {
            ...order,
            items: (this.orderItems.get(order.id) || []).map((item) => ({
                ...item,
                product: this.products.get(item.productId),
            })),
        };
    }
    async createOrder(insertOrder) {
        const id = this.currentOrderId++;
        const order = {
            ...insertOrder,
            status: insertOrder.status || "pending",
            paymentMethod: insertOrder.paymentMethod || null,
            id,
            createdAt: new Date(),
        };
        this.orders.set(id, order);
        this.orderItems.set(id, []);
        return order;
    }
    async addOrderItem(insertOrderItem) {
        const id = this.currentOrderItemId++;
        const orderItem = {
            ...insertOrderItem,
            quantity: insertOrderItem.quantity || 1,
            id,
        };
        const existingItems = this.orderItems.get(orderItem.orderId) || [];
        existingItems.push(orderItem);
        this.orderItems.set(orderItem.orderId, existingItems);
        return orderItem;
    }
    async updateOrder(order) {
        this.orders.set(order.id, order);
        return order;
    }
}

export const storage = new MemStorage();