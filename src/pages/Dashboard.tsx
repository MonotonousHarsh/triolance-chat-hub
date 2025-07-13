
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Plus, Users, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [createRoomId, setCreateRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const navigate = useNavigate();
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

  const handleCreateRoom = async () => {
    if (!createRoomId.trim()) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID",
        variant: "destructive",
      });
      return;
    }

    setIsCreateLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/room/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: createRoomId,
        }),
      });

      if (response.ok) {
        const result = await response.text();
        toast({
          title: "Room Created",
          description: result,
        });
        
        setCreateRoomId('');
        setIsCreateDialogOpen(false);
        
        // Navigate to the created room
        navigate(`/room/${createRoomId}`);
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
      setIsCreateLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) {
      toast({
        title: "Room ID Required",
        description: "Please enter a room ID",
        variant: "destructive",
      });
      return;
    }

    setIsJoinLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/room/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: joinRoomId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Joined Room",
          description: result.message,
        });
        
        setJoinRoomId('');
        setIsJoinDialogOpen(false);
        
        // Navigate to the joined room
        navigate(`/room/${joinRoomId}`);
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
      setIsJoinLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ChatApp</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                Welcome, {username}
              </div>
              <Link to="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600">Create a new room or join an existing conversation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Create Room
              </CardTitle>
              <CardDescription>
                Start a new conversation by creating your own chat room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Room</DialogTitle>
                    <DialogDescription>
                      Choose a unique room ID for your new chat room
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="createRoomId">Room ID</Label>
                      <Input
                        id="createRoomId"
                        value={createRoomId}
                        onChange={(e) => setCreateRoomId(e.target.value)}
                        placeholder="Enter room ID (e.g., my-awesome-room)"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleCreateRoom}
                      disabled={isCreateLoading}
                      className="w-full"
                    >
                      {isCreateLoading ? 'Creating...' : 'Create Room'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Join Room
              </CardTitle>
              <CardDescription>
                Enter a room ID to join an existing conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Join Existing Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Room</DialogTitle>
                    <DialogDescription>
                      Enter the room ID you want to join
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="joinRoomId">Room ID</Label>
                      <Input
                        id="joinRoomId"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleJoinRoom}
                      disabled={isJoinLoading}
                      className="w-full"
                    >
                      {isJoinLoading ? 'Joining...' : 'Join Room'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex justify-center space-x-4">
            <Link to="/profile">
              <Button variant="ghost">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
