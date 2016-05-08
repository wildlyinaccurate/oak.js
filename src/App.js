import curry from 'ramda/src/curry'

import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import vdom from './dom/virtual-dom'
import State from './State'

import * as delegator from './dom/delegator'

delegator.listen()


const ROOT_IDENTIFIER = 'data-plaitroot'
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)


// Start a Plait app from a root component
export function start (component, raf = window.requestAnimationFrame) {
  const { init, update, view } = component
  const [initialState, initialAction] = handleInit(init)

  // Initial call to update() will be @@redux/INIT so bogus dispatch() is okay
  let dispatch = x => x

  const store = createStoreWithMiddleware((state = initialState, action) => {
    const newState = update(state, action, dispatch)

    return (typeof newState === 'undefined') ? state : newState
  })

  dispatch = makeDispatcher(store)

  if (initialAction) {
    store.dispatch(initialAction)
  }

  const renderComponent = state => view(state, dispatch)
  const { rootNode, update: updateTree } = vdom(initialState, renderComponent, raf)

  rootNode.setAttribute(ROOT_IDENTIFIER, '')

  store.subscribe(() => {
    updateTree(store.getState())
  })

  return rootNode
}


// Render a Plait app node to a root DOM node
export function render (appNode, rootNode) {
  const staticNode = rootNode.querySelector(`[${ROOT_IDENTIFIER}]`)

  if (staticNode) {
    rootNode.replaceChild(appNode, staticNode)
  } else {
    rootNode.appendChild(appNode)
  }

  return rootNode
}


// Create a dispatcher function for the given store. Dispatchers act as a curried
// interface to store.dispatch, allowing views to express the _intent to dispatch_
// without immediately triggering a dispatch.
function makeDispatcher (store) {
  return action => event => {
    if (event) {
      action.$event = event

      if (action.$fwdAction) {
        action.$fwdAction.$event = event
      }
    }

    store.dispatch(action)
  }
}


export function initializeComponent ({ init }, dispatch) {
  const [initialState, initialAction] = handleInit(init)

  if (dispatch && initialAction) {
    dispatch(initialState)(initialAction)()
  }

  return initialState
}


function handleInit (init) {
  const _res = init()
  const res = Array.isArray(_res) ? _res : [_res]

  return [new State(res[0]), res[1]]
}


// Wrap a dispatcher, forwarding any actions onto the specified action by attaching
// them to the $fwdAction property.
//
// Usually used by parent components to capture actions from child components.
export const forwardDispatch = curry((action, dispatch, state) => {
  return forwardAction => {
    if (typeof forwardAction === 'function') {
      // In order to forward thunks, an intermediate thunk needs to be returned
      // to gain access to the raw `action => <dispatch>` dispatcher rather than
      // the application's wrapped `action => event => <dispatch>` dispatcher.
      return dispatch(rawDispatch => {
        const getState = () => state
        const fwd = forwardDispatch(action, rawDispatch, state)

        forwardAction(fwd, getState)
      })
    }

    // Annotate and dispatch a simple action object
    return dispatch(Object.assign({}, action, { $fwdAction: forwardAction }))
  }
})
