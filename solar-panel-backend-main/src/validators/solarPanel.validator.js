/**
 * Solar Panel Request Validators
 */

export const validateCreatePanel = (req, res, next) => {
    const { name, capacityKW, price, suitableFor } = req.body;
    const errors = [];

    // Name validation
    if (!name || name.trim() === '') {
        errors.push('Panel name is required');
    }

    // Capacity validation
    if (!capacityKW) {
        errors.push('Capacity (KW) is required');
    } else if (isNaN(capacityKW) || capacityKW < 0.001) {
        errors.push('Capacity must be a number greater than or equal to 0.001 KW (1 Watt)');
    }

    // Price validation
    if (!price) {
        errors.push('Price is required');
    } else if (isNaN(price) || price < 0) {
        errors.push('Price must be a positive number');
    }

    // SuitableFor validation
    if (!suitableFor) {
        errors.push('Suitable for field is required');
    } else if (!['residential_basic', 'residential_pro', 'commercial'].includes(suitableFor.toLowerCase())) {
        errors.push('Suitable for must be "residential_basic", "residential_pro", or "commercial"');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    next();
};

export const validateUpdatePanel = (req, res, next) => {
    const { capacityKW, price, suitableFor } = req.body;
    const errors = [];

    // Capacity validation (if provided)
    if (capacityKW !== undefined) {
        if (isNaN(capacityKW) || capacityKW < 0.001) {
            errors.push('Capacity must be a number greater than or equal to 0.001 KW (1 Watt)');
        }
    }

    // Price validation (if provided)
    if (price !== undefined) {
        if (isNaN(price) || price < 0) {
            errors.push('Price must be a positive number');
        }
    }

    // SuitableFor validation (if provided)
    if (suitableFor !== undefined) {
        if (!['residential_basic', 'residential_pro', 'commercial'].includes(suitableFor.toLowerCase())) {
            errors.push('Suitable for must be "residential_basic", "residential_pro", or "commercial"');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    next();
};