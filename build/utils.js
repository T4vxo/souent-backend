"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function assertParams(props, obj, allowEmptyString) {
    if (allowEmptyString === void 0) { allowEmptyString = false; }
    var missingProps = [];
    for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
        var i = props_1[_i];
        if (!obj.hasOwnProperty(i) || (allowEmptyString ? false : obj[i] == '')) {
            missingProps.push(i);
        }
    }
    if (missingProps.length > 0) {
        throw new Error("Missing parameters: " + missingProps.join(","));
    }
}
/**
 * Some utilities.
 * @author Johan Svensson
 */
exports.default = {
    /**
     * Checks if the object contains all properties defined in an array,
     * Throws an error if missing one or more properties.
     * @param props Required properties
     * @param obj Object to check
     * @param allowEmptyString Whether to allow an empty input
     */
    assertParams: assertParams,
    /**
     * Assert that params exists, otherwise ends the request with an error response.
     * @returns Whether the validation passed.
     */
    assertParamsWithResponse: function (props, obj, res) {
        try {
            assertParams(props, obj);
            return true;
        }
        catch (e) {
            res.status(401).end(JSON.stringify({
                status: 'error',
                error: 'missingParams',
                message: e.message
            }));
            return false;
        }
    },
};
