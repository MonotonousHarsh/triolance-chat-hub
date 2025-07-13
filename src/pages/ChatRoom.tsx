
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Send, Users, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Message {
  username: string;
  content: string;
  sender: string;
  timestamp: string;
}

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    
    if (!token || !storedUsername) {
      navigate('/login');
      return;
    }
    
    setUsername(storedUsername);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Simulate WebSocket connection (you would replace this with actual WebSocket implementation)
  useEffect(() => {
    if (!username || !roomId) return;

    // Simulate connection
    setIsConnected(true);
    setParticipants([username]);

    // Simulate receiving a welcome message
    const welcomeMessage: Message = {
      username: 'system',
      content: `Welcome to room ${roomId}!`,
      sender: 'system',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);

    toast({
      title: "Connected",
      description: `Successfully connected to room ${roomId}`,
    });

    return () => {
      setIsConnected(false);
    };
  }, [username, roomId, toast]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: Message = {
      username,
      content: newMessage,
      sender: username,
      timestamp: new Date().toISOString(),
    };

    // Add message to local state (in real app, this would be handled by WebSocket)
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Here you would send the message via WebSocket to your Spring Boot backend
    console.log('Sending message via WebSocket:', {
      roomId,
      message: {
        content: newMessage,
        sender: username,
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isSystemMessage = (message: Message) => {
    return message.sender === 'system';
  };

  const isOwnMessage = (message: Message) => {
    return message.sender === username;
  };

  if (!roomId) {
    return <div>Room not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  Room: {roomId}
                </span>
              </div>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {username}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${isSystemMessage(message) ? 'justify-center' : isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                {isSystemMessage(message) ? (
                  <div className="text-center text-sm text-gray-500 bg-gray-100 rounded-full px-4 py-2">
                    {message.content}
                  </div>
                ) : (
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage(message) ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
                    {!isOwnMessage(message) && (
                      <div className="text-xs text-gray-500 mb-1 font-medium">
                        {message.sender}
                      </div>
                    )}
                    <div className="break-words">{message.content}</div>
                    <div className={`text-xs mt-1 ${isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <Card className="m-4 mt-0">
            <CardContent className="p-4">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Type your message..." : "Connecting..."}
                  disabled={!isConnected}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!isConnected || !newMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Sidebar */}
        <Card className="w-64 m-4 ml-0">
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-900">{participant}</span>
                  {participant === username && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatRoom;
