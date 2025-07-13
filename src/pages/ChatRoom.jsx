
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Send, Users, ArrowLeft, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
// import { connectToRoom, sendMessage, disconnectFromRoom } from '@/utils/websocket';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [participants] = useState(['user1', 'user2', 'user3']); // Mock data
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const authToken = localStorage.getItem('authToken');
    
    if (!storedUsername || !authToken) {
      navigate('/login');
      return;
    }
    
    setUsername(storedUsername);
    
    // Simulate connection
    setIsConnected(true);
    
    // Mock message history
    setMessages([
      {
        id: 1,
        sender: 'system',
        content: `${storedUsername} joined the room`,
        timestamp: new Date(),
        isSystem: true
      },
      {
        id: 2,
        sender: 'user1',
        content: 'Hello everyone!',
        timestamp: new Date(Date.now() - 5000),
        isSystem: false
      }
    ]);

    // TODO: Replace with actual WebSocket connection
    // connectToRoom(roomId, storedUsername, (message) => {
    //   setMessages(prev => [...prev, message]);
    // });

    return () => {
      // TODO: Replace with actual disconnection
      // disconnectFromRoom();
    };
  }, [roomId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: username,
      content: newMessage.trim(),
      timestamp: new Date(),
      isSystem: false
    };

    // Add message locally (in real app, this would be handled by WebSocket)
    setMessages(prev => [...prev, message]);
    
    // TODO: Replace with actual WebSocket message sending
    // sendMessage(roomId, newMessage.trim());
    
    setNewMessage('');
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast({
        title: "Room ID Copied",
        description: "Room ID has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room ID:', err);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  Room: {roomId}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomId}
                className="flex items-center"
              >
                {copied ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                {copied ? 'Copied!' : 'Copy ID'}
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {participants.length} online
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Messages Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Chat Messages</h2>
                  <span className="text-sm text-gray-500">
                    {messages.length} messages
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === username ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.isSystem
                            ? 'bg-gray-100 text-gray-600 text-center text-sm mx-auto'
                            : message.sender === username
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border'
                        }`}
                      >
                        {!message.isSystem && message.sender !== username && (
                          <div className="text-xs text-gray-500 mb-1">
                            {message.sender}
                          </div>
                        )}
                        <div className="break-words">{message.content}</div>
                        {!message.isSystem && (
                          <div
                            className={`text-xs mt-1 ${
                              message.sender === username
                                ? 'text-blue-100'
                                : 'text-gray-400'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t bg-white p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={!isConnected}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || !isConnected}
                      className="px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participants Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <h3 className="font-semibold flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Participants ({participants.length})
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{participant}</span>
                    {participant === username && (
                      <span className="text-xs text-blue-600 font-medium">(You)</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
