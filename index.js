const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3001;

const eventsFile = path.join(__dirname, 'events.json');
let subscriptions = [];

app.use(bodyParser.json());

function storeEvent(eventData) {
    fs.readFile(eventsFile, 'utf8', (err, data) => {
        let events = [];
        if (!err && data) {
            events = JSON.parse(data);
        }

        events.push(eventData);  // Add the new event
        fs.writeFile(eventsFile, JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Event stored successfully!');
            }
        });
    });
}

async function subscribeToEvent(eventType, callbackUrl) {
    try {
        const subscriptionPayload = {
            event: eventType,
            callbackUrl: callbackUrl
        };
        
        const response = await axios.post('http://localhost:3000/subscriptions', subscriptionPayload);
    } catch (err) {
        console.error(`Error subscribing to ${eventType} event:`, err.message);
    }
}


// Webhook endpoint to handle incoming events from external systems
app.post('/webhook', (req, res) => {
    const event = req.body;

    console.log('Received Event:', event);
    storeEvent(event);

    res.status(200).send({ message: 'Event received and stored successfully!' });
});

app.listen(port, () => {
    console.log(`Webhook server listening at http://localhost:${port}`);

    // Simulate subscribing to events
    subscribeToEvent('project.created', 'http://localhost:3001/webhook');
    subscribeToEvent('project.updated', 'http://localhost:3001/webhook');
    subscribeToEvent('project.deleted', 'http://localhost:3001/webhook');
    subscribeToEvent('project.endSummary', 'http://localhost:3001/webhook');
    subscribeToEvent('task.created', 'http://localhost:3001/webhook');
    subscribeToEvent('task.completed', 'http://localhost:3001/webhook');
    subscribeToEvent('task.rejected', 'http://localhost:3001/webhook');
    subscribeToEvent('project.projectManagerAssigned', 'http://localhost:3001/webhook');
});
