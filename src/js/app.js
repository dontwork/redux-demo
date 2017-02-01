import m from 'mithril'
import { createStore, combineReducers } from 'redux'

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        completed: !state.completed
      }
    default:
      return state
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ]
    case 'TOGGLE_TODO':
      return state.map(t =>
        todo(t, action)
      )
    default:
      return state
  }
}

const visibilityFilter = (
  state = 'SHOW_ALL',
  action
) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
  }
}

const todoApp = combineReducers({
  todos,
  visibilityFilter
})

const todoComponent = {}
todoComponent.view = (vnode) => {
  return m('li', {
    onclick: vnode.attrs.onclick,
    style: {
      textDecoration: vnode.attrs.completed ? 'line-through' : 'none'
    }
  }, vnode.attrs.text)
}

const todoList = {}
todoList.view = (vnode) => {
  return m('ul', vnode.attrs.todos.map(item =>
    m(todoComponent, {
      key: item.id,
      ...item,
      onclick: () => vnode.attrs.onTodoClick(item.id)
    })
  ))
}

const addTodo = {}
addTodo.view = (vnode) => {
  return m('.todo-add', [
    m('input', {
      value: vnode.state.newTodoName,
      onchange: m.withAttr('value', (value) => { vnode.state.newTodoName = value })
    }),
    m('button', {
      onclick: () => {
        store.dispatch({
          type: 'ADD_TODO',
          text: vnode.state.newTodoName,
          id: nextTodoId++
        })
        vnode.state.newTodoName = ''
      }
    }, 'Add Todo')
  ])
}

const todoFooter = {}
todoFooter.view = (vnode) => {
  return m('p', 'show:', [
    m(filterLink, {
      filter: 'SHOW_ALL'
    }, 'All'),
    m(filterLink, {
      filter: 'SHOW_ACTIVE'
    }, 'Active'),
    m(filterLink, {
      filter: 'SHOW_COMPLETED'
    }, 'Completed')
  ])
}

const link = {}
link.view = (vnode) => {
  return vnode.attrs.active
  ? m('span', vnode.children)
  : m('a', {
    href: '#',
    onclick: (e) => {
      e.preventDefault()
      vnode.attrs.onclick()
    }
  }, vnode.children)
}

const filterLink = {}
filterLink.view = (vnode) => {
  const state = store.getState()
  return m(link, {
    active: vnode.attrs.filter === state.visibilityFilter,
    onclick: () => {
      store.dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: vnode.attrs.filter
      })
    }
  }, vnode.children)
}

const visibleTodoList = {}
visibleTodoList.view = (vnode) => {
  const state = store.getState()
  return m(todoList, {
    todos: getVisibleTodos(state.todos, state.visibilityFilter),
    onTodoClick: id => {
      store.dispatch({
        type: 'TOGGLE_TODO',
        id
      })
    }
  })
}

let nextTodoId = 0
var todoAppComponent = {}
todoAppComponent.view = (vnode) => {
  return m('.todo-app', [
    m(addTodo),
    m(visibleTodoList),
    m(todoFooter)
  ])
}

const store = createStore(todoApp)
store.subscribe(m.redraw)
m.route(document.getElementById('root'), '/', {
  '/': {
    onmatch: (args, requestedPath) => {
      return todoAppComponent
    },
    render: (vnode) => {
      return vnode
    }
  }
})
