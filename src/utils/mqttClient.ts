import mqtt from 'mqtt';
import dotenv from 'dotenv';
import Board from '../models/Board'; // Import the Board model

dotenv.config(); // Ensure environment variables are loaded

const brokerUrl = process.env.MQTT_BROKER_URL;
const options: mqtt.IClientOptions = {};

if (process.env.MQTT_USERNAME) {
  options.username = process.env.MQTT_USERNAME;
}
if (process.env.MQTT_PASSWORD) {
  options.password = process.env.MQTT_PASSWORD;
}

if (!brokerUrl) {
  console.error("MQTT Error: MQTT_BROKER_URL is not defined in .env file.");
  // Decide how to handle this: throw error, exit, or disable MQTT
  // For now, we'll log and potentially let the app continue without MQTT
}

// Initialize client - connection happens explicitly later or automatically based on library
// Using mqtt.connect will attempt connection immediately
const client = brokerUrl ? mqtt.connect(brokerUrl, options) : null;

if (client) {
  client.on('connect', () => {
    console.log('MQTT Client Connected to Broker');
    // Subscribe to status topics for all boards
    const statusTopic = 'ledfit/boards/+/status'; // Use wildcard '+' for boardId
    client.subscribe(statusTopic, { qos: 1 }, (err) => {
      if (err) {
        console.error('MQTT Failed to subscribe to status topic:', err);
      } else {
        console.log(`MQTT Client subscribed to topic: ${statusTopic}`);
      }
    });
  });

  // Handle incoming messages (including status updates from boards)
  client.on('message', async (topic, message) => {
    console.log(`MQTT Message Received - Topic: ${topic}`);
    const messageString = message.toString();
    console.log(`  Payload: ${messageString}`);

    // Check if it's a status topic
    const topicParts = topic.split('/');
    if (topicParts.length === 4 && topicParts[0] === 'ledfit' && topicParts[1] === 'boards' && topicParts[3] === 'status') {
      const boardIdFromTopic = topicParts[2];
      try {
        const payload = JSON.parse(messageString);
        const status = payload.status;

        // Update the board's status in the database
        const updateData: any = {
          lastSeen: new Date()
        };

        // Update isConnected based on status (simple logic for now)
        if (status === 'connected' || status === 'received' || status === 'heartbeat') {
             updateData.isConnected = true;
        } else if (status === 'disconnected') { // Assuming board sends this via LWT or explicitly
             updateData.isConnected = false;
        }
        // Add more specific status handling if needed

        const updatedBoard = await Board.findOneAndUpdate(
          { boardId: boardIdFromTopic },
          { $set: updateData },
          { new: true } // Option to return the updated document
        );

        if (updatedBoard) {
          console.log(`  Board status updated in DB for ${boardIdFromTopic}: isConnected=${updatedBoard.isConnected}`);
        } else {
          console.warn(`  Received status for unknown boardId: ${boardIdFromTopic}`);
        }

      } catch (e) {
        console.error(`  Error processing status message for topic ${topic}:`, e);
      }
    }
    // Add handling for other topics if needed
  });

  client.on('error', (error) => {
    console.error('MQTT Client Error:', error);
  });

  client.on('reconnect', () => {
    console.log('MQTT Client Reconnecting...');
  });

  client.on('close', () => {
    console.log('MQTT Client Disconnected');
  });
}

/**
 * Publishes a command ('pause' or 'resume') to the specific board's command topic.
 * @param boardId The unique ID of the target board.
 * @param command The command to send ('pause' or 'resume').
 * @param clientTimestamp Optional timestamp from the client initiating the action.
 */
const publishCommand = (boardId: string, command: 'pause' | 'resume', clientTimestamp?: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!client || !client.connected) { // Check connection status too
      console.error('MQTT client is not initialized or not connected.');
      return reject(new Error('MQTT client not available or not connected'));
    }
    if (!boardId) {
        console.error('Cannot publish command: boardId is missing.');
        return reject(new Error('Board ID is required'));
    }

    const topic = `ledfit/boards/${boardId}/commands`;
    // Build payload dynamically
    const payload: { command: 'pause' | 'resume'; clientTimestamp?: number } = { command };
    
    if (typeof clientTimestamp === 'number') {
        payload.clientTimestamp = clientTimestamp;
    }

    const message = JSON.stringify(payload); // Stringify the final payload

    console.log(`MQTT Publishing to ${topic}: ${message}`);

    client.publish(topic, message, { qos: 1 }, (error) => { // Using QoS 1 for guaranteed delivery
      if (error) {
        console.error(`MQTT Publish Error to topic ${topic}:`, error);
        reject(error);
      } else {
        console.log(`MQTT Message published successfully to ${topic}`);
        resolve();
      }
    });
  });
};

export default {
  client,
  publishCommand,
}; 