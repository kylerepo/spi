import { useState } from "react";
import ChatInterface from '../ChatInterface';

export default function ChatInterfaceExample() {
  // TODO: remove mock functionality
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hey! Thanks for the match. I love your profile 😊",
      timestamp: new Date(Date.now() - 300000),
      senderId: "2",
      senderName: "Alexandra",
      type: "text" as const
    },
    {
      id: "2", 
      text: "Hi Alexandra! Thank you, yours is amazing too. That wine tasting photo looks incredible!",
      timestamp: new Date(Date.now() - 240000),
      senderId: "1",
      senderName: "You",
      type: "text" as const
    },
    {
      id: "3",
      text: "Haha thanks! I'm actually planning another wine event next weekend. Would you be interested?",
      timestamp: new Date(Date.now() - 180000), 
      senderId: "2",
      senderName: "Alexandra",
      type: "text" as const
    }
  ]);

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      senderId: "1",
      senderName: "You",
      type: "text" as const
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleBack = () => {
    console.log('Going back to matches');
  };

  return (
    <div className="h-screen">
      <ChatInterface
        matchId="2"
        matchName="Alexandra"
        matchPhoto="/api/placeholder/200/200"
        messages={messages}
        currentUserId="1"
        onSendMessage={handleSendMessage}
        onBack={handleBack}
      />
    </div>
  );
}