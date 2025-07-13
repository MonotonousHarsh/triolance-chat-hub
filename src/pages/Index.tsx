
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ChatApp</span>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="ghost">Profile</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('username');
                      setIsLoggedIn(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Real-Time Chat
            <span className="text-blue-600"> Made Simple</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connect instantly with friends and colleagues. Create rooms, join conversations, and chat in real-time with our modern messaging platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {isLoggedIn ? (
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose ChatApp?</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need for seamless communication</p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-600" />
                <CardTitle>Real-Time Messaging</CardTitle>
                <CardDescription>
                  Instant message delivery with WebSocket technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Experience lightning-fast message delivery and real-time updates across all connected devices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600" />
                <CardTitle>Room Management</CardTitle>
                <CardDescription>
                  Create and join chat rooms easily
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create your own chat rooms or join existing ones with simple room IDs. Perfect for teams and communities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  JWT authentication and secure connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your conversations are protected with industry-standard security measures and encrypted connections.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">ChatApp v1.0</span>
            </div>
            <div className="text-sm text-gray-600">
              Built with React & Spring Boot
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
