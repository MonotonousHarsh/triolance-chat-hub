
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Plus, Users, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    if (!roomId.trim()) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/real-time/room/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          roomId: roomId.trim()
        }),
      });
        console.log("this is create-room response  " , response.data);
      if (response.ok) {
        const result = await response.text();
        toast({
          title: "Room Created",
          description: result,
        });
        navigate(`/room/${roomId.trim()}`);
      } else {
        const errorText = await response.text();
        toast({
          title: "Failed to Create Room",
          description: errorText,
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
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID to join",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/real-time/room/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          roomId: joinRoomId.trim()
        }),
      });
  console.log("this is Join-room response " ,response.data)
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Joined Room",
          description: result.message,
        });
        navigate(`/room/${joinRoomId.trim()}`);
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to Join Room",
          description: errorData.error || "Room not found",
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
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
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
              <span className="ml-2 text-xl font-bold text-gray-900">ChatApp Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900 font-medium">{username}</span>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to ChatApp, {username}!
          </h1>
          <p className="text-lg text-gray-600">
            Create a new chat room or join an existing one to start chatting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Create New Room
              </CardTitle>
              <CardDescription>
                Create a new chat room with a unique room ID
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
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Room"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Join Existing Room
              </CardTitle>
              <CardDescription>
                Join a chat room using its room ID
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
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Users className="h-4 w-4 mr-2" />
                  {isLoading ? "Joining..." : "Join Room"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use ChatApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Creating a Room</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Enter a unique room ID</li>
                  <li>• Click "Create Room"</li>
                  <li>• Share the room ID with friends</li>
                  <li>• Start chatting instantly</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Joining a Room</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Get the room ID from a friend</li>
                  <li>• Enter the room ID</li>
                  <li>• Click "Join Room"</li>
                  <li>• Start participating in the chat</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
