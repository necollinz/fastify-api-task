import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyView from '@fastify/view'
import formbody from '@fastify/formbody'
import path from 'path'
import { fileURLToPath } from 'url'
import pug from 'pug'

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = Fastify()

// плагины
app.register(formbody)

app.register(fastifyStatic, {
  root: path.join(__dirname, 'public')
})

app.register(fastifyView, {
  engine: { pug },
  root: path.join(__dirname, 'views')
})

// запуск
const start = async () => {
  try {
    // БД
    const db = await open({
      filename: './database.db',
      driver: sqlite3.Database
    })

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT
      )
    `)

    console.log('БД подключена')

    // редирект с /
    app.get('/', (req, reply) => {
      return reply.redirect('/users')
    })

    // список
    app.get('/users', async (req, reply) => {
      const users = await db.all('SELECT * FROM users')
      return reply.view('users.pug', { users })
    })

    // форма создания
    app.get('/users/create', (req, reply) => {
      return reply.view('create-user.pug')
    })

    // создание
    app.post('/users', async (req, reply) => {
      const { name, email } = req.body

      await db.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
      )

      return reply.redirect('/users')
    })

    // удаление
    app.post('/users/delete/:id', async (req, reply) => {
      await db.run('DELETE FROM users WHERE id = ?', [req.params.id])
      return reply.redirect('/users')
    })

    // форма редактирования
    app.get('/users/edit/:id', async (req, reply) => {
      const user = await db.get(
        'SELECT * FROM users WHERE id = ?',
        [req.params.id]
      )

      return reply.view('edit-user.pug', { user })
    })

    // обновление
    app.post('/users/edit/:id', async (req, reply) => {
      const { name, email } = req.body

      await db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, req.params.id]
      )

      return reply.redirect('/users')
    })

    await app.listen({ port: 3000 })

    console.log('http://localhost:3000')

  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()