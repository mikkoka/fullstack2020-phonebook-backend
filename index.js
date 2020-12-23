const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post_body'))
morgan.token('post_body', req => req.method==='POST' ? JSON.stringify(req.body) : ' ' )




let persons = 
[
  { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": 1
  },
  { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": 2
  },
  { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": 3
  },
  { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
    "id": 4
  }
]

//GET INFO
app.get('/info', (req, res) => {
  res.send(`<h4>Phonebook has info for ${persons.length} people. </h4> 
  <h4>${(new Date).toTimeString()}</h4>`)
})

//GET ALL
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

//GET #
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})


//DELETE
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})


//POST
app.post('/api/persons', (request, response) => {

  const person = request.body
  if (!person.name || !person.number) {
    response.status(400).json({ error: 'name and number must be specified' }).end()
    return
  }

  const testPerson = persons.find(p => p.name === person.name)
  if (testPerson) {
    response.status(400).json({ error: 'name must be unique' }).end()
    return
  }
  
  person.id = Math.floor(Math.random() * (10000 - 10) + 10)
  persons = persons.concat(person)
  response.json(person)
 
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
