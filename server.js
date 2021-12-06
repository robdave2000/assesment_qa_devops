const express = require('express')
const path = require('path')
const app = express()
const {bots, playerRecord} = require('./data')
const {shuffleArray} = require('./utils')

app.use(express.static('public'))

var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: '7c17b02c8fa84162b849e1d7af2234b0',
  captureUncaught: true,
  captureUnhandledRejections: true
});

rollbar.log("Hello world!");

app.get('/', (req, res) => {
    rollbar.info('Someone visited our site')

    res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.get('/styles', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.css'))
})

app.get('/js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.js'))
})

app.use(express.json())



app.get('/api/robots', (req, res) => {
    try {
        res.status(200).send(botsArr)
    } catch (error) {
        console.log('ERROR GETTING BOTS', error)
        rollbar.error('Unable to get bots')
        res.sendStatus(400)
    }
})

app.get('/api/robots/five', (req, res) => {
    try {
        let shuffled = shuffleArray(bots)
        let choices = shuffled.slice(0, 5)
        let compDuo = shuffled.slice(6, 8)
        res.status(200).send({choices, compDuo})
    } catch (error) {
        console.log('ERROR GETTING FIVE BOTS', error)
        rollbar.error('Unable to get 5 bots')
        res.sendStatus(400)
    }
})

app.post('/api/duel', (req, res) => {
    try {
        rollbar.info('starting match')
        // getting the duos from the front end
        let {compDuo, playerDuo} = req.body

        // adding up the computer player's total health and attack damage
        let compHealth = compDuo[0].health + compDuo[1].health
        let compAttack = compDuo[0].attacks[0].damage + compDuo[0].attacks[1].damage + compDuo[1].attacks[0].damage + compDuo[1].attacks[1].damage
        
        // adding up the player's total health and attack damage
        let playerHealth = playerDuo[0].health + playerDuo[1].health
        let playerAttack = playerDuo[0].attacks[0].damage + playerDuo[0].attacks[1].damage + playerDuo[1].attacks[0].damage + playerDuo[1].attacks[1].damage
        
        // calculating how much health is left after the attacks on each other
        let compHealthAfterAttack = compHealth - playerAttack
        let playerHealthAfterAttack = playerHealth - compAttack

        // comparing the total health to determine a winner
        if (compHealthAfterAttack > playerHealthAfterAttack) {
            playerRecord.losses++
            res.status(200).send('You lost!')
            rollbar.info('player lost')
        } else {
            playerRecord.losses++
            res.status(200).send('You won!')
            rollbar.info('player won')
        }
    } catch (error) {
        console.log('ERROR DUELING', error)
        rollbar.error('error with dueling')
        res.sendStatus(400)
    }
})

app.get('/api/player', (req, res) => {
    try {
        res.status(200).send(playerRecord)
    } catch (error) {
        console.log('ERROR GETTING PLAYER STATS', error)
        rollbar.error('error getting player stats')
        res.sendStatus(400)
    }
})

rollbar.log('Server started')

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})