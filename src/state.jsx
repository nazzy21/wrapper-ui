import _ from "./utils";

/**
 * @property {string} type
 * @property {object} state
 * @property {array} subscribers
 **/
export default class State {
    constructor(type, state = {}, subscribers = []) {
        this.type = type;
        this.oldState = {};
        this.state = this.prepareState(state || {});
        this.subscribers = subscribers || [];

        this.set = this.set.bind(this);
        this.setSync = this.setSync.bind(this);
        this.reset = this.reset.bind(this);
        this.resetSync = this.resetSync.bind(this);
        this.unset = this.unset.bind(this);
        this.unsetSync = this.unsetSync.bind(this);
    }

    prepareState(state) {
        return state;
    }

    get(name = null) {
        if (!name) {
            // Return the entire state
            return _.clone(this.state);
        }

        return this.state[name];
    }

    set(name, value = null) {
        this.oldState = _.extend({}, this.state);

        if (_.isObject(name)) {
            _.extend(this.state, name);

            return;
        }

        this.state[name] = value;
    }

    setSync(name, value) {
        this.set(name, value);

        this.__callSubscribers(this.oldState);
    }

    unset(name) {
        if (!this.state[name]) {
            return false;
        }

        this.oldState = _.extend({}, this.state);

        this.state = _.omit(this.state, name);

        return true;
    }

    unsetSync(name) {
        if (!this.unset(name)) {
            return;
        }

        this.__callSubscribers(this.oldState);
    }

    reset(state) {
        this.oldState = _.extend({}, this.state);
        this.state = this.prepareState(state);
    }

    resetSync(state) {
        this.reset(state);
        this.__callSubscribers(this.oldState);
    }

    subscribe(callback) {
        if( !callback || 'function' !== typeof callback || !callback.name) {
            return false;
        }

        const exist = this.subscribers.filter( cb => cb.name === callback.name );

        if (!_.isEmpty(exist)) {
            return;
        }

        this.subscribers.push(callback);

        return true;
    }

    unsubscribe(callback) {
        if( !callback || 'function' !== typeof callback || !callback.name) {
            return false;
        }

        this.subscribers = this.subscribers.filter( cb => cb.name !== callback.name );

        return true;
    }

    /**
     * Calls and execute all listeners.
     *
     * @param {object} oldState
     * @private
     */
    __callSubscribers(oldState = false) {
        if (!this.subscribers.length) {
            return;
        }

        let state = _.extend({}, this.state);

        this.subscribers.map( cb => cb.call(null, state, oldState, this));
    }

    count() {
        return Object.keys(this.state).length;
    }

    toArray() {
        if (!this.state || _.isEmpty(this.state)) {
            return [];
        }

        return _.values(_.clone(this.state));
    }
}