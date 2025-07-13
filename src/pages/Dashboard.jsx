
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Plus, Users, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const authToken = localStorage.getItem('authToken');
    
    if (!storedUsername || !authToken) {
      navigate('/login');
      return;
    }
    
    setUsername(storedUsername);
  }, [navigate]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:8080/room/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          roomId: roomId.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Room Created",
          description: `Room "${roomId}" created successfully!`,
        });
        navigate(`/room/${roomId}`);
      } else {
        const errorText = await response.text();
        toast({
          title: "Failed to Create Room",
          description: errorText || "Could not create room",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Create room error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;

    setIsJoining(true);
    try {
      const response = await fetch('http://localhost:8080/room/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          roomId: joinRoomId.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Joined Room",
          description: `Successfully joined room "${joinRoomId}"!`,
        });
        navigate(`/room/${joinRoomId}`);
      } else {
        const errorText = await response.text();
        toast({
          title: "Failed to Join Room",
          description: errorText || "Could not join room",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Join room error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ChatApp</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <User className="h-4 w-4 mr-1" />
                <span className="font-medium">{username}</span>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm">Profile</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to your Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Create a new chat room or join an existing one to start messaging
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Create New Room
              </CardTitle>
              <CardDescription>
                Start a new chat room and invite others to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <Label htmlFor="roomId">Room ID</Label>
                  <Input
                    id="roomId"
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter unique room ID"
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Choose a unique identifier for your room
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating || !roomId.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Join Existing Room
              </CardTitle>
              <CardDescription>
                Enter a room ID to join an existing chat room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <Label htmlFor="joinRoomId">Room ID</Label>
                  <Input
                    id="joinRoomId"
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    placeholder="Enter room ID to join"
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ask the room creator for the room ID
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={isJoining || !joinRoomId.trim()}
                >
                  {isJoining ? 'Joining...' : 'Join Room'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Tips:</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              Room IDs are case-sensitive and must be unique
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              Share your room ID with others to let them join
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              You can be in multiple rooms at the same time
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
