const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/Person') //dotenv -import ennen tätä!
const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post_body'))
morgan.token('post_body', req => req.method==='POST' ? JSON.stringify(req.body) : ' ' )

let persons = []
Person.find({}).then(result => {persons = result})
//GET INFO
app.get('/info', (req, res) => {
  res.send(`<h4>Phonebook has info for ${persons.length} people. </h4> 
  <h4>${(new Date).toTimeString()}</h4>`)
})

//GET ALL
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => res.json(persons))})

//GET/:#
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) response.json(person)
    else error => next(error)
  }).catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log('errorHandler1: ', error.name)
  if (error.name === 'CastError') {
    return response.status(500).send({ error: 'internal server error' })
  }
  if (error.name === 'ReferenceError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

//PUT/:#
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler2 = (error, request, response, next) => {
  console.log('errorHandler2: ', error.name)
  if (error.name === 'CastError') {
    return response.status(500).send({ error: 'delete failed for some reason' })
  }

  next(error)
}
app.use(errorHandler2)

//DELETE
app.delete('/api/persons/:id', (request, response, next) => {
  const temp = Person.findByIdAndRemove(request.params.id)
    .then(() => { if (temp) response.status(204).end()})
    .catch(error => next(error))
})

const errorHandler3 = (error, request, response, next) => {
  console.log('errorHandler2: ', error.name)
  if (error.name === 'CastError') {
    return response.status(500).send({ error: 'delete failed for some reason' })
  }

  next(error)
}
app.use(errorHandler3)

//POST
app.post('/api/persons', (request, response) => {

  //TEST IF REQUIRED FIELDS FILLED & NAME DOES NOT ALREADY EXIST
  const body = request.body
  if (!body.name || !body.number) response.status(400).json({ error: 'name and number must be specified' })
  //if (persons.find(p => p.name === body.name)) response.status(400).json({ error: 'name must be unique' })

  //CREATE PERSON FOR MONGODB
  let person = new Person ({
    name: body.name,
    number: body.number
  })
  //SAVE PERSON TO DB
  person.save() .then(savedPerson => response.json(savedPerson))
    .catch(err => {
      let msg = []
      if(err.errors.name) msg.push(err.errors.name.properties.message)
      if(err.errors.number) msg.push(err.errors.number.properties.message)
      return msg
    })
    .then(msg => {
      response.status(400).json(msg)
    })

})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
