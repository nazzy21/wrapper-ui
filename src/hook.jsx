import _ from 'underscore';

let eventHooks = {},
    filterHooks = {};

/**
 * Gets the list of attached filters or event hook.
 *
 * @access private
 *
 * @param {string} type                                     Required. Either `filter` or `event`.
 * @param {string} name                                     Required. The hook's trigger name.
 *
 * @returns {Array}
 */
const getHooks = function(type, name) {
    if ( 'event' === type ) {
        return eventHooks[name] || [];
    }

    return filterHooks[name] || [];
};

/**
 * Updates the list of hooked callbacks.
 *
 * @access private
 *
 * @param {string} type
 * @param {string} name
 * @param {array} value
 */
const updateHooks = function(type, name, value) {
    if ( 'event' === type ) {
        eventHooks[name] = value;

        return;
    }

    filterHooks[name] = value;
};

/**
 * Add callable function to the list of hooks that are triggered base on the given name.
 *
 * @param {string} type                 The type of hook.
 * @param {string} name                 The name of the hook use to trigger an action.
 * @param {function} callback           The function to execute when the hook name is called.
 * @param {int} priority                The order to which the function will be executed. Default is 0.
 * @param {any} args                    Optional arguments to insert when the function is called.
 * @param {boolean} once                Whether to call the on function only once or every time the actionable hook is called.
 */
const addHook = function(type, name, callback) {
    let priority = arguments[3] || 0,
        once = arguments[4] || false;

    if ( ! callback.name ) {
        return false;
    }

    let hooks = getHooks(type, name);

    hooks.push({
        callback: callback,
        priority: priority,
        once: once
    });

    updateHooks(type, name, hooks);

    return true;
};

/**
 * Remove the actionable function from the list or remove the entire list.
 *
 * @param {string} type                 The type of hook to remove from.
 * @param {string} name                 The name of the list.
 * @param {function} callback           The function that was previously inserted from the list. If omitted, will remove
 *                                      the entire list of actionable functions.
 */
const removeHook = function(type, name) {
    let callback = arguments[2] || false,
        hooks = getHooks(type, name);

    if ( ! hooks.length ) {
        return;
    }

    if ( ! callback ) {
        // Remove all
        updateHooks( type, name, [] );

        return;
    }

    let index = _.findIndex(hooks, {callback: callback} );
    if ( index >= 0 ) {
        hooks = hooks.filter( (hook, i) => {
            return i !== index;
        });
    }

    updateHooks(type, name, hooks);
};

/**
 * Check if the given hook type and name contains actionable list of functions.
 *
 * @param {string} type
 * @param {string} name
 * @returns {boolean}
 */
const hasHook = function(type, name) {
    let hooks = getHooks(type, name);

    return !!(hooks && hooks.length);
};

/**
 * Custom action event hook and listener.
 *
 * @type {object}
 */
export const appEvent = {
    /**
     * Attached an event listener callback on the given event action name.
     *
     * @param {string} eventName
     * @param {function} callback
     * @returns {boolean}
     */
    on(eventName, callback) {
        let priority = arguments[1] || 0;

        return addHook( 'event', eventName, callback, priority );
    },

    /**
     * Attached an event listener which only triggered once.
     *
     * @param {string} eventName
     * @param {function} callback
     * @returns {boolean}
     */
    once(eventName, callback) {
        let priority = arguments[1] || 0;

        return addHook('event', eventName, callback, priority, true );
    },

    /**
     * Removes an event listener.
     *
     * @param {string} eventName
     * @param {function} callback                   The callback function event listener to remove to. If omitted, will
     *                                              remove all function callbacks attached to the event name.
     */
    off(eventName) {
        let callback = arguments[1];

        return removeHook('event', eventName, callback);
    },

    /**
     * Triggers a custom action event.
     *
     * @async
     *
     * @param {string} name
     *
     * @returns {*}
     */
    trigger(name) {
        let args = _.values(arguments).slice(1);

        if ( ! hasHook( 'event', name ) ) {
            return Promise.resolve(args);
        }

        let hooks = getHooks( 'event', name ),
            func = [];

        hooks = _.sortBy( hooks, 'priority' );

        for ( let i = 0; i < hooks.length; i++ ) {
            let hook = hooks[i],
                callback = hook.callback;

            func.push(callback);

            if ( hook.once ) {
                removeHook( 'event', name, callback );
            }
        }

        return func.reduce( (promise, f) => promise.then(e => f.apply(null, args)), Promise.resolve());
    }
};

export const appFilter = {
    add(name, callback) {
        let priority = arguments[2] || 0;

        return addHook('filter', name, callback, priority);
    },

    apply(name, value) {
        let args = _.values(arguments).slice(1);

        if (!hasHook('filter', name)) {
            return Promise.resolve(value);
        }

        let hooks = getHooks( 'filter', name ),
            func = [];

        hooks = _.sortBy( hooks, 'priority' );

        for ( let i = 0; i < hooks.length; i++ ) {
            let hook = hooks[i],
                callback = hook.callback;

            func.push(callback);

            if ( hook.once ) {
                removeHook( 'filter', name, callback );
            }
        }

        return func.reduce( (promise, f) => promise.then(e => f.apply(null, e)), Promise.resolve(args));
    }
};