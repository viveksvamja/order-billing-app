// To extract mongoose error message
const validationError = (error) => {
    let errorCode = 500;
    if (error.name == 'ValidationError') {
        let errors = [];
        errorCode = 422;
        Object.keys(error.errors).forEach(element => {
            let format_element = element.replaceAll('_', ' ').capitalize();
            errors[element] = error
                    .errors[element]
                    .message
                    .replace('Path ', '')
                    .replaceAll('`', '')
                    .replace(element, format_element);
        });
        errors = Object.assign({}, errors)
        var errorMessage = {errors}
    } else if (error.name == 'MongoError' && error.code === 11000) {
        errorCode = 422;
        let element = Object.keys(error.keyPattern)[0];
        let format_element = element.replaceAll('_', ' ').capitalize();
        var errorMessage = `${Object.keys(error.keyPattern)[0]} must be unique.`.replace(element, format_element);
    }
    return {
        error: errorMessage,
        code: errorCode
    }
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {
    validationError: validationError
}