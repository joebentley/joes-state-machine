const assert = require('assert');
const {StateMachine, ns, nt, newStateMachine} = require('..');

describe('StateMachine', () => {
  it('should throw exception if a bad config is given', () => {
    let threw = false;
    try {
      newStateMachine(['a'], null, 'b');
    } catch (e) { threw = true; }
    assert(threw);
    threw = false;
    try {
      newStateMachine(['a'], 'badIterable');
    } catch (e) { threw = true; }
    assert(threw);
  });

  it('should trigger onEntry event', () => {
    let called = false;
    let sm = new StateMachine({
      states: [ns('a', () => called = true), ns('b'), ns('c')],
      initialState: 'b'
    });
    sm.goto('a');
    assert(called);
  });

  it('should trigger initial onEntry callback if third arg true', () => {
    let called = false;
    new StateMachine({ states: [ns('a', () => called = true)], initialState: 'a', initialOnEnter: false });
    assert(!called);
    new StateMachine({ states: [ns('a', () => called = true)], initialState: null, initialOnEnter: false });
    assert(!called);
    new StateMachine({ states: [ns('a', () => called = true)], initialState: 'a', initialOnEnter: true });
    assert(called);
  });

  it('should allow string-only state names', () => {
    let sm = newStateMachine(['a', 'b']);
    sm.addStates(['c', 'd']);
    sm.addState('e');
    assert(sm.goto('e'));
    assert(sm.goto('a'));
  });

  it('should not fail if onEntry, onExit, or transition not implemented', () => {
    let sm = newStateMachine([ns('a'), ns('b'), ns('c')]);
    assert(sm.goto('a'));
    assert(sm.goto('b'));
    assert(sm.goto('c'));
  });

  it('should give false if a non-implemented state is chosen', () => {
    let sm = newStateMachine(['a', 'b'], null, 'a');
    assert(!sm.goto('c'));
  });

  it('should pass name of previous state to onEntry, and next state to onExit callback', () => {
    let sm = newStateMachine([ns('a', state => assert(state === null))]);
    assert(sm.goto('a'));
    sm.addState(ns('b', state => assert(state === 'a'), state => assert(state === 'c')));
    sm.addState('c');
    assert(sm.goto('b'));
    assert(sm.goto('c'));
  });

  it('should pass names of from and to states to transition callback', () => {
    let called = false;
    let sm = newStateMachine(['a', 'b'],
      [
        nt('a', 'b', (from, to) => assert(from === 'a' && to === 'b'), called = true)
      ], 'a');
    sm.goto('b');
    assert(called);
  });

  it('should execute callbacks in correct order', () => {
    let counter = 0;

    let sm = new StateMachine({
      states: [
        ns('a', () => assert(counter++ === 0), () => assert(counter++ === 1)),
        ns('b', () => assert(counter++ === 3))
      ],
      transitions: [
        nt('a', 'b', () => assert(counter++ === 2))
      ],
      initialState: 'a',
      initialOnEnter: true
    });

    sm.goto('b');

    assert(counter === 4);
  });

  it('should execute onExit, onEntry, and transition callbacks when transitioning to self', () => {
    let a = 0;
    let sm = new StateMachine({
      states: [
        ns('a', () => a++, () => a++)
      ],
      transitions: [
        nt('a', 'a', () => a++)
      ],
      initialState: 'a'
    });

    sm.goto('a');
    assert(a === 3);
  });
});