// client/src/store.js
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/index'; // this call be also written as import rootReducer from './reducers';

const initialState = {};
const middleware = [ thunk ];

/**
 * Create a Redux Store
 * First parameter is the root reducer
 * Second Parameter is initial State
 * Third parameter is middleware.
 * window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
 * sets up developer tools extensions on chrome browser( like Action, State, Diff tabs )
 * @type {Store<Array & any> & {dispatch: any}}
 */
const store = createStore(
	rootReducer,
	initialState,
	// applyMiddleware( ...middleware )
	compose( applyMiddleware( ...middleware ), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() )
);

export default store;