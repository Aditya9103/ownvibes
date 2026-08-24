import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');
        
        try {
            await mongoose.connection.collection('categories').dropIndex('slug_1');
        } catch (e) {
            // Ignore if index doesn't exist
        }

        // Categories
        const categories = [
            { name: 't-shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80', link: '/shop?category=t-shirts' },
            { name: 'oversized', slug: 'oversized', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', link: '/shop?category=oversized' },
            { name: 'graphic tees', slug: 'graphic-tees', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80', link: '/shop?category=graphic-tees' },
            { name: 'polo shirts', slug: 'polo-shirts', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80', link: '/shop?category=polo-shirts' },
            { name: 'full sleeve', slug: 'full-sleeve', image: 'https://images.unsplash.com/photo-1618517351616-3898bd307a52?auto=format&fit=crop&w=800&q=80', link: '/shop?category=full-sleeve' }
        ];

        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
            }
        }
        console.log('Categories seeded successfully');

        // Products
        const products = [
            {
                name: 'Vintage Wash Oversized T-Shirt',
                description: 'Premium quality oversized t-shirt with a vintage wash finish. Perfect for everyday streetwear.',
                price: 1299,
                category: 'oversized',
                images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
                stock: 50,
                isNewArrival: true,
                isBestSeller: true,
                sizes: ['S', 'M', 'L', 'XL'],
                bulletPoints: ['100% Premium Cotton', 'Oversized Fit', 'Vintage Wash', 'Machine Washable']
            },
            {
                name: 'Classic White Basic Tee',
                description: 'The essential everyday t-shirt. Breathable cotton blend with a classic fit.',
                price: 899,
                category: 't-shirts',
                images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80'],
                stock: 100,
                isNewArrival: false,
                isBestSeller: true,
                sizes: ['S', 'M', 'L', 'XL'],
                bulletPoints: ['Cotton Blend', 'Classic Fit', 'Breathable Fabric']
            },
            {
                name: 'Streetwear Graphic Tee - Tokyo Edition',
                description: 'Bold graphic print featuring Tokyo nightlife. Heavyweight cotton for structure.',
                price: 1499,
                category: 'graphic tees',
                images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'],
                stock: 30,
                isNewArrival: true,
                isBestSeller: false,
                sizes: ['M', 'L', 'XL', 'XXL'],
                bulletPoints: ['Heavyweight Cotton', 'High Quality Print', 'Streetwear Fit']
            },
            {
                name: 'Essential Black Polo',
                description: 'Smart casual polo shirt for any occasion. Features a textured pique fabric.',
                price: 1599,
                category: 'polo shirts',
                images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80'],
                stock: 45,
                isNewArrival: false,
                isBestSeller: true,
                sizes: ['S', 'M', 'L'],
                bulletPoints: ['Pique Cotton', 'Ribbed Collar', 'Smart Casual']
            },
            {
                name: 'Striped Full Sleeve Tee',
                description: 'Comfortable full sleeve t-shirt with classic navy and white stripes.',
                price: 1199,
                category: 'full sleeve',
                images: ['https://images.unsplash.com/photo-1618517351616-3898bd307a52?auto=format&fit=crop&w=800&q=80'],
                stock: 60,
                isNewArrival: true,
                isBestSeller: false,
                sizes: ['S', 'M', 'L', 'XL'],
                bulletPoints: ['100% Cotton', 'Regular Fit', 'Yarn Dyed Stripes']
            }
        ];

        for (const prod of products) {
            const exists = await Product.findOne({ name: prod.name });
            if (!exists) {
                await Product.create(prod);
            }
        }
        console.log('Products seeded successfully');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
