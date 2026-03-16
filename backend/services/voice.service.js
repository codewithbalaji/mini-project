import axios from 'axios';

export const generateSpeech = async (text, voiceId = 'pNInz6obpgDQGcFmaJgB') => { 
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || "",
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );
    return response.data;
  } catch (error) {
    console.error("ElevenLabs Error:", error?.response?.data || error.message);
    throw error;
  }
};
