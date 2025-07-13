
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, Users, ArrowLeft, MessageCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const authToken = localStorage.getItem('authToken');
    
    if (!storedUsername || !authToken) {
      navigate('/login');
      return;
    }
    
    setUsername(storedUsername);
    
    // Simulate joining the room and loading message history
    handleJoinRoom(storedUsername);
    
    // Simulate WebSocket connection (replace with actual WebSocket implementation)
    setIsConnected(true);
    
    // Add current user to participants
    setParticipants(prev => new Set([...prev, storedUsername]));
    
    // Simulate receiving a join message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'system',
      content: `${storedUsername} joined the room`,
      timestamp: new Date(),
      type: 'system'
    }]);

    return () => {
      // Cleanup connection when component unmounts
      setIsConnected(false);
    };
  }, [navigate, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleJoinRoom = async (username) => {
    try {
      // In real implementation, this would establish WebSocket connection
      console.log(`Joining room: ${roomId} as ${username}`);
      
      // Simulate loading message history
      // In real app, this would come from the WebSocket message history
      setMessages([
        {
          id: 1,
          sender: 'system',
          content: `Welcome to room ${roomId}`,
          timestamp: new Date(),
          type: 'system'
        }
      ]);
      
    } catch (error) {
      console.error('Failed to join room:', error);
      toast({
        title: "Connection Error",
        description: "Failed to join the chat room",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) return;

    // Simulate sending message (replace with actual WebSocket send)
    const newMessage = {
      id: Date.now(),
      sender: username,
      content: message.trim(),
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // In real implementation, send via WebSocket:
    // sendMessage(roomId, message.trim());
    
    console.log(`Sending message to room ${roomId}:`, message.trim());
  };

  const handleLeaveRoom = () => {
    // In real implementation, disconnect from WebSocket
    setIsConnected(false);
    toast({
      title: "Left Room",
      description: `You have left room ${roomId}`,
    });
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="font-semibold text-gray-900">Room: {roomId}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    <Users className="h-3 w-3 inline mr-1" />
                    {participants.size} participant{participants.size !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Welcome, {username}</span>
            <Button variant="outline" size="sm" onClick={handleLeaveRoom}>
              Leave Room
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === 'system' 
                      ? 'justify-center' 
                      : msg.sender === username 
                        ? 'justify-end' 
                        : 'justify-start'
                  }`}
                >
                  {msg.type === 'system' ? (
                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === username
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      {msg.sender !== username && (
                        <div className="text-xs text-gray-500 mb-1 font-medium">
                          {msg.sender}
                        </div>
                      )}
                      <div className="text-sm">{msg.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender === username ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                disabled={!isConnected}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!message.trim() || !isConnected}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Participants Sidebar */}
        <Card className="w-64 m-4 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Participants ({participants.size})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Array.from(participants).map((participant) => (
                <div
                  key={participant}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={participant === username ? 'font-semibold' : ''}>
                    {participant} {participant === username && '(You)'}
                  </span>
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
