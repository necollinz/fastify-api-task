import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyView from '@fastify/view'
import formbody from '@fastify/formbody'
import path from 'path'
import { fileURLToPath } from 'url'
import pug from 'pug'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = Fastify()
app.register(formbody)


// массив пользователей
let users = [
  { id: 1, name: 'Сергей', email: 'seezov@mail.com' },
  { id: 2, name: 'Денчик', email: 'denis@mail.com' },
  { id: 3, name: 'Кот', email: 'cat@mail.com' },
  { id: 4, name: 'Пёс', email: 'dog@mail.com' },
  { id: 5, name: 'Котопёс', email: 'catdog@mail.com' }
]

// статика
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public')
})

// pug
app.register(fastifyView, {
  engine: { pug },
  root: path.join(__dirname, 'views')
})

// список пользователей
app.get('/users', (req, reply) => {
  return reply.view('users.pug', { users })
})

// форма создания
app.get('/users/create', (req, reply) => {
  return reply.view('create-user.pug')
})

// обработка формы
app.post('/users', async (req, reply) => {
  const { name, email } = req.body

  const newUser = {
    id: users.length + 1,
    name,
    email
  }

  users.push(newUser)

  return reply.redirect('/users')
})

app.listen({ port: 3000 }, (err) => {
  if (err) throw err
  console.log('Сервер запущен: http://localhost:3000')
})