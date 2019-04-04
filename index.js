const startupDebugger = require('debug')('app:startup')
const dbDebugger = require('debug')('app:db')
const config = require('config')
const Joi = require('joi') // Check valid
const express = require('express')
const app = express()
const logger = require('./logger')
const helmet = require('helmet')
const morgan = require('morgan')

// console.log(`NODE ENV: ${process.env.NODE_ENV}`)
// console.log(`app: ${app.get('env')}`)

console.log('Application Name: ' + config.get('name'))
console.log('Mail Server: ' + config.get('mail.host'))
console.log('Mail Password: ' + config.get('mail.password'))

if(app.get('env') === 'development') {
    app.use(morgan('tiny'))
    startupDebugger('Morgan enabled...')
}

dbDebugger('Connected to the database')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(helmet())

app.use(logger)

function log(req, res, next) {
    console.log('Logging...');
    next();
}

const courses = [
    {id: 1, name: 'course1'},
    {id: 2, name: 'course2'},
    {id: 3, name: 'course3'},
]
app.get('/', (req, res) => {
    res.send('Hello World! ')
})

app.get('/api/courses', (req, res) => {
    res.send(courses)
})

// Add a new course
app.post('/api/courses', (req, res) => {
    const {error} = validateCourse(req.body);
    if(error) {
        return res.status(400).send(error.details[0].message)
    }

    const course = {
        id: courses.length + 1, 
        name: req.body.name
    }
    courses.push(course)
    res.send(courses)
})

// Put 
app.get('/api/courses/:id', (req, res)=> {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('Error course id')
    res.send(course);
})

app.put('/api/courses/:id', (req, res)=> {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('error course id')

    const {error} = validateCourse(req.body);
    if(error) {
        res.status(400).send(error.details[0].message)
        return;
    }

    course.name = req.body.name;
    res.send(course);
})

function validateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    }
    return Joi.validate(course, schema);
}
//  PORT 
const port = process.env.PORT || 3001;
app.listen(port, ()=> console.log(`Listening to ${port}..`));
