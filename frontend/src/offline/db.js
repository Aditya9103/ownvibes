import { openDB } from 'idb';

const DB_NAME = 'ownvibes-offline';
const DB_VERSION = 1;

let dbPromise = null;

const getDB = () => {
    if (!('indexedDB' in window)) {
        return null;
    }
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('cart')) {
                    db.createObjectStore('cart', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('wishlist')) {
                    db.createObjectStore('wishlist', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('pendingSync')) {
                    db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
                }
            },
        }).catch((err) => {
            console.warn('[OfflineDB] Failed to open IndexedDB:', err);
            return null;
        });
    }
    return dbPromise;
};

// --- Cart Operations ---
export const getOfflineCart = async () => {
    try {
        const db = await getDB();
        if (!db) return null;
        const all = await db.getAll('cart');
        return all.map((entry) => entry.data);
    } catch (err) {
        console.warn('[OfflineDB] Error reading cart from IndexedDB:', err);
        return null;
    }
};

export const saveOfflineCart = async (cartItems) => {
    try {
        const db = await getDB();
        if (!db) return;
        const tx = db.transaction('cart', 'readwrite');
        await tx.store.clear();
        for (const item of cartItems) {
            const uniqueId = item.selectedSize ? `${item._id}-${item.selectedSize}` : (item._id || item.id);
            await tx.store.put({
                id: uniqueId,
                data: item,
                updatedAt: Date.now(),
            });
        }
        await tx.done;
    } catch (err) {
        console.warn('[OfflineDB] Error saving cart to IndexedDB:', err);
    }
};

export const clearOfflineCart = async () => {
    try {
        const db = await getDB();
        if (!db) return;
        await db.clear('cart');
    } catch (err) {
        console.warn('[OfflineDB] Error clearing cart in IndexedDB:', err);
    }
};

// --- Wishlist Operations ---
export const getOfflineWishlist = async () => {
    try {
        const db = await getDB();
        if (!db) return null;
        const all = await db.getAll('wishlist');
        return all.map((entry) => entry.data);
    } catch (err) {
        console.warn('[OfflineDB] Error reading wishlist from IndexedDB:', err);
        return null;
    }
};

export const saveOfflineWishlist = async (wishlistItems) => {
    try {
        const db = await getDB();
        if (!db) return;
        const tx = db.transaction('wishlist', 'readwrite');
        await tx.store.clear();
        for (const item of wishlistItems) {
            const id = item._id || item.id;
            await tx.store.put({
                id,
                data: item,
                updatedAt: Date.now(),
            });
        }
        await tx.done;
    } catch (err) {
        console.warn('[OfflineDB] Error saving wishlist to IndexedDB:', err);
    }
};

export const clearOfflineWishlist = async () => {
    try {
        const db = await getDB();
        if (!db) return;
        await db.clear('wishlist');
    } catch (err) {
        console.warn('[OfflineDB] Error clearing wishlist in IndexedDB:', err);
    }
};

// --- Purge All Offline Stores (e.g. On Logout) ---
export const clearAllOfflineData = async () => {
    try {
        const db = await getDB();
        if (!db) return;
        const tx = db.transaction(['cart', 'wishlist', 'pendingSync'], 'readwrite');
        await tx.objectStore('cart').clear();
        await tx.objectStore('wishlist').clear();
        await tx.objectStore('pendingSync').clear();
        await tx.done;
    } catch (err) {
        console.warn('[OfflineDB] Error clearing all offline data:', err);
    }
};
