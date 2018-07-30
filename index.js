
class StateMachine {
  constructor({states, transitions, initialState, initialOnEnter = false}) {
    this._states = new Map();
    this._transitions = new Map();

    this.addStates(states);

    if (transitions && Symbol.iterator in transitions) {
      Array.from(transitions).forEach(this.addTransition.bind(this));
    } else if (transitions) {
      throw new Error('transitions should be iterable');
    }

    if (initialState) {
      if (!this._states.has(initialState)) {
        throw new Error(`Initial state ${initialState} not registered as a possible state`);
      }

      this._currentState = initialState;

      if (initialOnEnter)
        this._states.get(initialState).onEnter(initialState);
    }
  }

  addState(state) {
    if (typeof state === 'string')
      this._states.set(state, {name: state});
    else
      this._states.set(state.name, state);
    return this;
  }

  addStates(iterable) {
    Array.from(iterable).forEach(state => this.addState(state));
    return this;
  }

  setOnEnterForState(stateName, cb) {
    this._states.get(stateName).onEnter = cb;
  }

  setOnExitForState(stateName, cb) {
    this._states.get(stateName).onExit = cb;
  }

  addTransition({from, to, onTransition}) {
    let transitionsFromState = this._transitions.get(from);
    if (!transitionsFromState) {
      transitionsFromState = new Map();
      this._transitions.set(from, transitionsFromState);
    }
    transitionsFromState.set(to, onTransition);
  }

  getTransition(from, to) {
    if (typeof from !== 'string' || typeof to !== 'string')
      throw new Error('both arguments should be strings, make sure to call with the state _names_');

    if (this._transitions.has(from) && this._transitions.get(from).has(to))
      return this._transitions.get(from).get(to);
    return null;
  }

  goto(state) {
    let to = this._states.get(state);
    let from = this.currentState;
    if (to != null) {
      if (from.onExit)
        from.onExit(to.name);

      if (from.name && to.name) {
        let transition = this.getTransition(from.name, to.name);
        if (transition)
          transition(from.name, to.name);
      }

      if (to.onEnter)
        to.onEnter(from.name);

      this._currentState = state;
      return true;
    }
    return false;
  }

  get currentState() {
    return this._states.get(this._currentState) || {name: null};
  }
}

exports.StateMachine = StateMachine;

exports.newStateMachine = (states, transitions, initialState, initialOnEnter = false) => {
  return new StateMachine({states, transitions, initialState, initialOnEnter});
};

exports.newState = (name, onEnter, onExit) => { return {name, onEnter, onExit}; };
exports.ns = exports.newState;

exports.newTransition = (from, to, onTransition) => { return {from, to, onTransition}; };
exports.nt = exports.newTransition;