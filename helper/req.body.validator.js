const joi = require('joi');

const schemas = {
    authSchema: joi.object()
        .keys({
            name: joi.string(),
            dob: joi.any(),
            gender: joi.any(),
            image: joi.string(),
            role: joi.any(),
            username: joi.string()
                .alphanum()
                .min(5)
                .max(10),
            password: joi.string()
                .min(5)
                .max(15),
            confirmPassword: joi.ref('password'),
            email: joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            phone: joi.string().regex(/^\(?9\)?(\d{9})$/)
        })
        .options({ abortEarly: false })
}

const validateBody = schema => {
    return (req, res, next) => {
        const result = schema.validate(req.body);
        if (result.error) {
            return next(result.error);
        }
        if (!req.value) {
            req.value = {};
        }
        req.value['body'] = result.value;
        next();
    }
}
module.exports = {
    schemas,
    validateBody
}