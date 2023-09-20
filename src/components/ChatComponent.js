import React, { useState, useRef, useEffect } from 'react';
import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime";
import { FaPaperPlane } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const region = process.env.AWS_REGION;
const client = new SageMakerRuntimeClient({ region });

function ChatMessage({ message, role }) {
  return (
    <div className={`chat-message ${role === 'user' ? 'user-bg' : role === 'ai' ? 'ai-bg' : 'error-bg'}`}>
      {message}
    </div>
  );
}

function ChatComponent() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatHistoryRef = useRef(null);
  const chatInputRef = useRef(null);

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();

    const newChatHistory = [...chatHistory, { role: 'user', message: chatInput, id: uuidv4() }];
    setChatHistory(newChatHistory);

    const params = {
      EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME,
      Body: new TextEncoder().encode(chatInput),
      ContentType: 'text/plain',
    };

    try {
      const command = new InvokeEndpointCommand(params);
      const response = await client.send(command);
      const responseBody = new TextDecoder().decode(response.Body);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: 'ai', message: responseBody, id: uuidv4() },
      ]);
    } catch (error) {
      console.error('Error invoking SageMaker endpoint:', error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: 'error', message: 'There was an error processing your message.', id: uuidv4() },
      ]);
    }

    setChatInput('');
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      chatInputRef.current.style.height = chatInputRef.current.scrollHeight + 'px';
    }
  }, [chatInput]);

  return (
    <div className="chat-container rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="chat-header flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <span>Chat with Llama2</span>
        <button className="close-button">Close</button>
      </div>
      <div className="chat-window flex flex-col p-4 bg-gray-50 dark:bg-gray-900 flex-grow">
        <div className="chat-messages-container flex flex-col gap-2 mb-4 flex-grow overflow-y-auto" ref={chatHistoryRef}>
          {chatHistory.map((chat) => (
            <ChatMessage key={chat.id} message={chat.message} role={chat.role} />
          ))}
        </div>
        <div className="message-input-container flex items-center bg-transparent p-2 rounded-lg relative">
          <div className="message-input flex-grow bg-transparent p-2 outline-none border border-gray-300 dark:border-gray-600 rounded-lg pr-10 flex items-center">
            <input
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              className="flex-grow outline-none bg-transparent"
              placeholder="Type a message..."
              style={{ border: 'none' }} /* Remove the border from the input element */
            />
          </div>
          <button onClick={handleChatSubmit} className="send-button p-2 absolute right-2 top-1/2 transform -translate-y-1/2">
            <FaPaperPlane className="text-blue-600 dark:text-blue-400"/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatComponent;
