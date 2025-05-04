import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, user } = useAuth();
  const isCitizen = user?.role === 'citizen';

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Online Complaint Portal
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            A transparent platform to report problems and track progress easily.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <>
                {isCitizen && (
                  <Link to="/complaints/new" className="btn bg-white text-primary hover:bg-gray-100 text-lg py-3 px-8">
                    File a Complaint
                  </Link>
                )}
                {user?.role === 'officer' && (
                  <Link to="/officer" className="btn bg-white text-primary hover:bg-gray-100 text-lg py-3 px-8">
                    View Assigned Complaints
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="btn bg-secondary hover:bg-secondary/90 text-white text-lg py-3 px-8">
                  Sign Up
                </Link>
                <Link to="/login" className="btn bg-white text-primary hover:bg-gray-100 text-lg py-3 px-8">
                  Login
                </Link>
              </>
            )}
            <Link to="/track" className="btn bg-accent hover:bg-accent/90 text-white text-lg py-3 px-8">
              Track Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Register & Report</h3>
              <p className="text-gray-600">
                Sign up on the portal and report issues in your local area with all the necessary details.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Automatic Assignment</h3>
              <p className="text-gray-600">
                Complaints are automatically assigned to the right government officer based on your area's pin code.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Track & Resolve</h3>
              <p className="text-gray-600">
                Track your complaint's progress using the unique ID and provide feedback once resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-gray-600">Complete visibility into complaint status and resolution process.</p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Efficiency</h3>
              <p className="text-gray-600">Automated assignment to officers for faster resolution.</p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Accountability</h3>
              <p className="text-gray-600">Officers are responsible for complaints assigned to them.</p>
            </div>
            <div className="p-5 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Feedback</h3>
              <p className="text-gray-600">Rate and provide feedback on resolved complaints.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Report an Issue?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our platform and help improve your community by reporting issues that need attention.
          </p>
          {isAuthenticated ? (
            <>
              {isCitizen ? (
                <Link to="/complaints/new" className="btn bg-white text-secondary hover:bg-gray-100 text-lg py-3 px-8">
                  File a Complaint
                </Link>
              ) : user?.role === 'officer' ? (
                <Link to="/officer" className="btn bg-white text-secondary hover:bg-gray-100 text-lg py-3 px-8">
                  View Your Dashboard
                </Link>
              ) : null}
            </>
          ) : (
            <Link to="/register" className="btn bg-primary hover:bg-primary/90 text-white text-lg py-3 px-8">
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home; 