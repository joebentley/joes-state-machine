# Joe's State Machine

```javascript
const {StateMachine, newState, newTransition} = require('joes-state-machine');

let cat = new StateMachine({
  states: [
    newState('sleepy', () => console.log('The cat fell asleep'), () => console.log('The cat was no longer asleep!')),
    newState('awake', () => console.log('The cat woke up!'))
  ],
  transitions: [
    newTransition('sleepy', 'awake', () => console.log('The cat transitioned from asleep to awake'))
  ],
  initialState: 'sleepy',
  initialOnEnter: true // Trigger the initial onEntry callback for the sleepy state on object construction
});

cat.goto('awake');
```

If `initialOnEnter` is false, the onEnter callback for `initialState` will not be called when the state machine is constructed.

Another way to call the initial onEnter is to not specify the initial state in the constructor and then explicitly transition to the desired initial state:

```javascript

let cat = new StateMachine({
  states: [
    newState('sleepy', () => console.log('The cat fell asleep'), () => console.log('The cat was no longer asleep!')),
    newState('awake', () => console.log('The cat woke up!'))
  ],
  transitions: [
    newTransition('sleepy', 'awake', () => console.log('The cat transitioned from asleep to awake'))
  ]
});

cat.goto('sleepy'); // 'The cat fell asleep'...
cat.goto('awake'); // will trigger the other callbacks
```

There are also shorthands for creating state machines, states, and transitions:

```javascript
const {newStateMachine, ns, nt} = require('joes-state-machine');

let cat = newStateMachine(
  [
    ns('sleepy', () => console.log('The cat fell asleep'), () => console.log('The cat was no longer asleep!')),
    ns('awake', () => console.log('The cat woke up!'))
  ],
  [
    nt('sleepy', 'awake', () => console.log('The cat transitioned from asleep to awake'))
  ],
  'sleepy',
  true // Trigger the initial onEntry callback for the sleepy state on object construction
);

cat.goto('awake');
```

