import { SET_CURRENT_USER, GET_USER_COUNT, CSRF_TOKEN, GET_USERS, GET_USER, GET_USER_DATA } from '../actions/types';
import isEmpty from '../validation/is-empty';

const initialState = {
	isAuthenticated: false,
	user: {},
	singleUser: {},
	userList: [],
	csrfToken: null,
	userCount: null
};

export default function ( state = initialState, action ) {
	/**
	 * If action.payload is filled with the user, that mean we should be authenticated.
	 * So the value of isAuthenticated will be true is action.payload has the value, false otherwise.
	 * isEmpty() is our custom function defined in validation/isEmpty.js
	 */
	switch ( action.type ) {
		case SET_CURRENT_USER:
			return {
				...state,
				isAuthenticated: ! isEmpty( action.payload ),
				user: action.payload
			};
		case GET_USER_COUNT:
			return {
				...state,
				userCount: action.payload
			};
		case CSRF_TOKEN:
			return {
				...state,
				csrfToken: action.payload
			};
		case GET_USERS:
			return {
				...state,
				userList: action.payload
			};
		case GET_USER:
			return {
				...state,
				singleUser: action.payload
			};
        case GET_USER_DATA:
            return{
                ...state,
                userData:action.payload

            };
		default: return state;
	}
}