import Coupon from '../models/Coupon.js';

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
    const { code, discountPercentage, description, isActive = true, visibleToAll = true } = req.body;

    try {
        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

        if (couponExists) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase().trim(),
            discountPercentage,
            description,
            isActive: Boolean(isActive),
            visibleToAll: Boolean(visibleToAll)
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create coupon', error: error.message });
    }
};

// @desc    Get all active and visible coupons (for public offers page)
// @route   GET /api/coupons
// @access  Public
export const getCoupons = async (req, res) => {
    try {
        // Only return coupons that are active AND visible to all users
        const coupons = await Coupon.find({ isActive: true, visibleToAll: { $ne: false } }).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
    }
};

// @desc    Update a coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const { code, discountPercentage, description, isActive, visibleToAll } = req.body;

        if (code !== undefined) {
            const codeUpper = code.trim().toUpperCase();
            if (codeUpper !== coupon.code) {
                const existing = await Coupon.findOne({ code: codeUpper });
                if (existing) {
                    return res.status(400).json({ message: 'Coupon code already exists' });
                }
            }
            coupon.code = codeUpper;
        }

        if (discountPercentage !== undefined) coupon.discountPercentage = Number(discountPercentage);
        if (description !== undefined) coupon.description = description;
        if (isActive !== undefined) coupon.isActive = Boolean(isActive);
        if (visibleToAll !== undefined) coupon.visibleToAll = Boolean(visibleToAll);

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update coupon', error: error.message });
    }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons/admin
// @access  Private/Admin
export const getAdminCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (coupon) {
            await Coupon.deleteOne({ _id: coupon._id });
            res.json({ message: 'Coupon removed' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
    }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
    const { code } = req.body;

    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon code is no longer active' });
        }

        res.json({
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
            description: coupon.description
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to validate coupon', error: error.message });
    }
};
