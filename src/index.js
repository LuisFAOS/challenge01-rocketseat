const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//util
function findUserByUsername(usernameToFind){
   return users.find(({username}) => username === usernameToFind)
}


//middleware
function checksExistsUserAccount(request, response, next) {
   const usernameFromClient = request.headers.username 

   const existingUser = findUserByUsername(usernameFromClient)

   if(existingUser) {
      request.username = usernameFromClient
      request.todos = existingUser.todos
      next()
   }

   else return response.status(404).json({ errorMessage: "Usuário inválido/não encontrado!" })
}

app.post('/users', (request, response) => {
   const {name, username} = request.body

   //checking if username already exist
   if(findUserByUsername(username))
      return response.status(400).json({ errorMessage: 'Nome de usuário já existe, tente outro!' })

   //creating a new user
   users.push({
      id: uuid(),
      name,
      username,
      todos: []
   })

   return response.status(201).json({ 
      successMessage: `Parabéns, ${name}! Seu usuário, ${username}, foi criado com sucesso!` 
   })
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const userTodos = request.todos
   
   return response.status(200).json({todos: userTodos})
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const {title, deadline} = request.body.newTodo

   const userTodos = request.todos
   
   userTodos.push({ 
	   id: uuid(),
	   title,
	   done: false, 
	   deadline: new Date(deadline), 
	   created_at: new Date()
   })

   return response.status(201).json({successMessage: 'Todo criada com sucesso!'})
});

app.post('/todoList', checksExistsUserAccount, (req, res) => {
   const todos = req.body

   const userTodos = request.todos

   todos.forEach(newTodo => {  
      userTodos.push({ 
	      id: uuid(),
	      title: newTodo.title,
	      done: false, 
	      deadline: new Date(newTodo.deadline), 
	      created_at: new Date()
      })
   })

   return response.status(201).json({successMessage: 'Todos criadas com sucesso!'})
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { id } = request.params
   const {newTitle, newDeadline} = request.body

   const userTodos = request.todos

   let userTodoToUpdate = userTodos.find(userTodo => userTodo.id === id)
   if(userTodoToUpdate) return response.status(404).json({errorMessage: 'Todo não encontrada!'})

   userTodoToUpdate.title = newTitle
   userTodoToUpdate.deadline = new Date(newDeadline)

   return response.status(200).json({ successMessage: 'Todo atualizada com successo!' })

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
   const { id } = request.params

   const userTodos = request.todos

   let userTodoToUpdate = userTodos.find(userTodo => userTodo.id === id)
   if(userTodoToUpdate) return response.status(404).json({errorMessage: 'Todo não encontrada!'})

   userTodoToUpdate.done = true

   return response.status(200).json({ successMessage: 'Todo atualizada para concluida!' })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { id } = request.params

   const userTodos = request.todos

   let userTodoToDelete = userTodos.find(userTodo => userTodo.id === id)
   if(userTodoToDelete) return response.status(404).json({errorMessage: 'Todo não encontrada!'})

   const index = userTodos.indexOf(userTodoToDelete)
   if(index > -1) userTodos.splice(index, 1)
   else return response.status(404).json({errorMessage: 'Todo não encontrada!'})

   return response.status(200).json({ successMessage: 'Todo deletada com sucesso!' })
});

module.exports = app;
