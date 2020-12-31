const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://mikkomongo:${password}@cluster0.q7sqj.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})
// personSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//       returnedObject.id = returnedObject._id.toString()
//       delete returnedObject._id
//       delete returnedObject.__v
//     }
//   })

const Person = mongoose.model('Person', personSchema)


//Tulosta kaikki
if (process.argv.length<5) {
  Person.find({}).then(result => {
    result.forEach(p => {
      console.log(p.toJSON())
    })
    mongoose.connection.close()
  })
} else {
  //Lisää henkilö
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(() => {
    console.log('person saved!')
    mongoose.connection.close()
  })
}

