"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowlist = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            process.env.CLIENT_URL || 'http://localhost:5173',
            'http://localhost:3000'
        ];
        if (!origin || allowlist.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'TheCalista API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: process.env.PORT
    });
});
app.get('/api/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'TheCalista Backend API',
        version: '1.0.0',
        features: {
            oauth_enabled: process.env.OAUTH_ENABLED === 'true',
            personalized_ai: process.env.PERSONALIZED_AI_ENABLED === 'true',
            supabase_configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
        }
    });
});
app.get('/api/products', (req, res) => {
    const sampleProducts = [
        {
            id: '1',
            name: 'Minimal Tee',
            brand: 'TheCalista',
            price: 49.99,
            images: ['/api/placeholder/product1.jpg'],
            description: 'A perfect blend of comfort and style. Made from 100% organic cotton.',
            category: 'T-Shirts',
            collection: 'Urban Essentials',
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: ['Black', 'White', 'Gray'],
            inStock: true,
            rating: 4.8,
            reviews: 156,
            isNew: true
        },
        {
            id: '2',
            name: 'Monochrome Hoodie',
            brand: 'TheCalista',
            price: 89.99,
            images: ['/api/placeholder/product2.jpg'],
            description: 'Premium hoodie with modern silhouette and kangaroo pocket.',
            category: 'Hoodies',
            collection: 'Night Collection',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'Gray', 'White'],
            inStock: true,
            rating: 4.6,
            reviews: 89,
            isBestSeller: true
        }
    ];
    res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: sampleProducts,
        count: sampleProducts.length
    });
});
app.get('/api/placeholder/:filename', (req, res) => {
    res.status(200).json({
        message: 'Placeholder image endpoint',
        filename: req.params.filename,
        note: 'In production, this would serve actual product images'
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
const startServer = async () => {
    const PORT = process.env.PORT || 3001;
    console.log('🔧 Configuration loaded:');
    console.log('   - Supabase URL:', process.env.SUPABASE_URL ? 'Configured ✅' : 'Not configured ❌');
    console.log('   - Google OAuth:', process.env.GOOGLE_CLIENT_ID ? 'Configured ✅' : 'Not configured ❌');
    console.log('   - Gemini AI:', process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured ❌');
    const server = app.listen(PORT, () => {
        console.log('🚀 TheCalista Backend Server Started');
        console.log(`📍 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Local URL: http://localhost:${PORT}`);
        console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
        console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
    });
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use`);
            process.exit(1);
        }
        else {
            console.error('❌ Server error:', error);
        }
    });
    process.on('SIGINT', () => {
        console.log('🔄 Received SIGINT. Gracefully shutting down...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
};
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map