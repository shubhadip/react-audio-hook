// this code should reside in its own project

const express = require('express');
const cors = require('cors');

const speech = require('@google-cloud/speech');

const client = new speech.SpeechClient();

async function convert(audioBlob) {
  const request = {
    config: {
      encoding: 'WEBM_OPUS', // Ensure this matches the format of the audio being sent
      sampleRateHertz: 48000, // This should match the sample rate of your recording
      languageCode: 'en-US'
    },
    audio: {
      content: audioBlob
    }
  };

  const [response] = await client.recognize(request);
  
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  return transcription;
}

const app = express();

app.use(cors())
app.use(express.json());

app.post('/upload', express.raw({ type: '*/*' }), async (req, res) => {
    const audioBlob = req.body;
    
    const response = await convert(audioBlob);

    res.json(response);
});

app.listen(4000,'0.0.0.0', () => {
  console.log('Example app listening on port 4000!');
});
