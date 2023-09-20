import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime";

const region = process.env.AWS_REGION;
const client = new SageMakerRuntimeClient({ region });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const params = {
        EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME,
        Body: JSON.stringify({ text: message }),  // Updated to send a JSON object
        ContentType: 'application/json',  // Updated to indicate we're sending JSON
    };

    const command = new InvokeEndpointCommand(params);
    const response = await client.send(command);
    const responseBody = new TextDecoder().decode(response.Body);

    res.status(200).json({ response: responseBody });
  } catch (error) {
    console.error('Error invoking SageMaker endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
