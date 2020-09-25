import {compile} from "path-to-regexp";
import * as _ from "underscore";

_.extend(_, {
    DayInSeconds: 86400,
    DayInMilliSeconds: 24 * 8.64e+7,
    DayInMicroSeconds: 86400 * 6000,
    HourInSeconds: 60 * 60,
    HourInMicroSeconds: 60 * 60 * 6000,
    MinuteInSeconds: 60,
    MinuteInMicroSeconds: 60 * 6000,
    isDefined,
    isUndefined,
    isEmail,
    define,
    serialize,
    unserialize,
    devAssert,
    setError,
    toSlug,
    isEmpty,
    findIndex,
    sumOf,
    maxOf,
    sprintf,
    setUrlParam,
    unsetUrlParam,
    capitalize
});

export default _;

/**
 * Check if a property name exist from the given object.
 *
 * @param {object} obj
 * @param {string} name
 * @returns Boolean
 **/
function isDefined(obj, name) {
    if (obj.hasOwnProperty) {
        return !!obj.hasOwnProperty(name);
    }

    return obj && !!obj[name];
}

/**
 * Check if a value is of type undefined
 *
 * @param {*} value
 * @returns Boolean
 **/
function isUndefined(value) {
    return 'undefined' === typeof value;
}

/**
 * Check if a value is empty.
 *
 * @param {*} value
 * @returns Boolean
 **/
function isEmpty(value) {
    if ("" === value) {
        return true;
    }
    
    if (_.isNull(value)) {
        return true;
    }

    if (_.isArray(value) && !value.length) {
        return true;
    }

    if (_.isObject(value)) {
        return !_.keys(value).length;
    }

    return !value;
}

function isEmail(email) {
    let atPos = email.indexOf('@'),
        dotPos = email.indexOf('.');

    return atPos && dotPos && dotPos > (atPos+2);
}

/**
 * Add object property if it doesn't exist.
 *
 * @param {object} obj
 * @param {string|object} name
 * @param {*} value
 * @returns {void}
 **/
function define(obj, name, value) {
    if (_.isObject(name)) {
        return Object.keys(name).map( key => define(obj, key, name[key]));
    }

    if (isDefined(obj, name)) {
        return true;
    }

    if (_.isFunction(value)) {
        value = value.bind(obj);
    }

    Object.defineProperty(obj, name, {value: value});
}

/**
 * Stringify an object value.
 *
 * @param {object|array} value
 * @returns {string}
 **/
function serialize(value) {
    try {
        return JSON.stringify(value);
    } catch(e) {
        return value;
    }
}

/**
 * Un-stringify a value.
 *
 * @param {string} value
 * @returns {object} value
 **/
function unserialize(value) {
    try {
        return JSON.parse(value);
    } catch(e) {
        return value;
    }
}

/**
 * Get an index position base on context.
 *
 * @param {array} list
 * @param {*} context
 * @returns {int}
 **/
function findIndex(list, context) {
    for(let i = 0; i < list.length; i++) {
        const item = list[i];

        if (_.isObject(context)) {
            for(const name in context) {
                if (!context.hasOwnProperty(name)) {
                    continue;
                }

                if (item[name] && item[name] === context[name]) {
                    return i;
                }
            }
        } else if (_.isEqual(item, context)) {
            return i;
        }
    }

    return -1;
}

/**
 * Transform a string into slug type string.
 *
 * @param {string} str
 * @returns {string}
 **/
function toSlug(str) {
    return str.toLowerCase().replace(/[ '`"*&^%$#@!<>\/]/g, '-');
}

function stripTags(str) {
    return str.replace(/(<([^>] +)>)/ig, "");
}

function camelCase(str) {
    const _str = str.split(""),
        first = _str[0].toUpperCase();

    _str[0] = first;

    return _str.join("");
}

function capitalize(str) {
    if (!str) {
        return null;
    }

    let _str = str.split("");

    _str[0] = _str[0].toUpperCase();

    return _str.join("");
}

function getItem(list, context) {
    let pos = indexOf(list, context);

    if (pos < 0) {
        return null;
    }

    return list[pos];
}

function devAssert(condition, message) {
    if ((_.isBoolean(condition) && condition) || condition) {
        return;
    }

    const err = new Error(message);

    throw err;
}

function setError(message, code) {
    const err = new Error(message);
    err.code = code;

    // todo: Log error

    return err;
}

/**
 * Set or reset url parameters.
 *
 * @param {string} url
 * @param {object} params
 * @returns {string} url
 **/
function setUrlParam(url, params) {
    const _toPath = compile(url, {encode: encodeURIComponent});

    return _toPath(params);
}

/**
 * @param {string} url
 * @param {string} ...
 * @returns {string} url
 **/
function unsetUrlParam(url, ...params) {
    const {origin, pathname, search} = new URL(url);
    let list = pathname.split();

    for(const param of params) {
        const pos = _.indexOf(list, param);

        if (!pos) {
            continue;
        }

        delete list[pos];

        if (list[pos+1]) {
            delete list[pos+1];
        }
    }

    list = list.filter(e => e !== undefined);

    return origin + list.join("/") + search;
}

function sumOf(arr) {
    return arr.reduce((a, b) => (a||0)+(b||0), 0);
}

function maxOf(arr) {
    return Math.max.apply(null, arr);
}

function sprintf(str, ...values) {
    let pattern = /%s|%d/g,
        formats = str.match(pattern);

    if ( !formats ) {
        return str;
    }

    str = str.replace( /%(\d)\$s/g, (x, s) => {
        s = s - 1;
        if ( values[s] ) {
            return values[s];
        }

        return x;
    });

    let start = -1;
    str = str.replace( pattern, x => {
        start++;

        if ( '%s' === x && 'string' === typeof values[start] ) {
            return values[start];
        }

        if ( '%d' === x && 'number' === typeof values[start] ) {
            return values[start];
        }

        return x;
    });

    return str;
}