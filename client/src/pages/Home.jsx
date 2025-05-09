import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function Home() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const isCitizen = user?.role === 'citizen';

  return (
    <div className="bg-gray-50">
      {/* Hero Section with Indian flag colors and government-themed design */}
      <section className="relative overflow-hidden">
        {/* Saffron stripe at top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF9933] z-10"></div>
        
        <div className="section-govt py-20 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-[#FF9933]"></div>
            <div className="absolute top-1/3 left-0 right-0 h-1/3 bg-white"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#138808]"></div>
          </div>
          
          {/* Ashoka Chakra */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-72 h-72 border-4 border-white/20 rounded-full hidden lg:flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/10 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 border-8 border-white/30 rounded-full"></div>
            </div>
          </div>
          
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 flex flex-col">
                <span className="text-white">{t('home.title1', 'Online')}</span>
                <span className="text-white">{t('home.title2', 'Complaint Portal')}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl">
                {t('home.subtitle', 'A digital platform to bridge the gap between citizens and government authorities.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    {isCitizen && (
                      <Link to="/complaints/new" className="btn btn-accent flex items-center text-lg px-8 py-3 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        {t('home.fileComplaint', 'File a Complaint')}
                      </Link>
                    )}
                    {user?.role === 'officer' && (
                      <Link to="/officer" className="btn btn-accent flex items-center text-lg px-8 py-3 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {t('home.viewAssigned', 'View Assigned Complaints')}
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-accent flex items-center text-lg px-8 py-3 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      {t('auth.register', 'Register')}
                    </Link>
                    <Link to="/login" className="btn btn-primary bg-white/10 hover:bg-white/20 border-white flex items-center text-lg px-8 py-3 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {t('auth.login', 'Login')}
                    </Link>
                  </>
                )}
                <Link to="/track" className="btn btn-outline bg-white/5 border-white text-white hover:bg-white/20 flex items-center text-lg px-8 py-3 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  {t('home.trackComplaint', 'Track Complaint')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Green stripe at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#138808]"></div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNmMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI0ZGOUEzMyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48cGF0aCBkPSJNMjQgMThjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDZjLTMuMzE0IDAtNi0yLjY4Ni02LTYgczIuNjg2LTYgNi02eiIgc3Ryb2tlPSIjMTM4ODA4IiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvZz48L3N2Zz4=')] opacity-5"></div>
        
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-[#0C2D83] font-medium">{t('home.process', 'Our Process')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900">{t('home.howItWorks', 'How It Works')}</h2>
            <div className="w-24 h-1 bg-[#FF9933] mx-auto mt-6"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connected dots line */}
            <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-[#0C2D83]/20 hidden md:block"></div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center relative transition-transform hover:-translate-y-2 duration-300 z-10">
              <div className="bg-[#0C2D83] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">1</div>
              <h3 className="text-xl font-semibold mb-3 text-[#0C2D83]">{t('home.step1.title', 'Register & Report')}</h3>
              <p className="text-gray-600">
                {t('home.step1.description', 'Sign up on the portal and report issues in your local area with all the necessary details.')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center relative transition-transform hover:-translate-y-2 duration-300 z-10">
              <div className="bg-[#FF9933] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">2</div>
              <h3 className="text-xl font-semibold mb-3 text-[#FF9933]">{t('home.step2.title', 'Automatic Assignment')}</h3>
              <p className="text-gray-600">
                {t('home.step2.description', 'Complaints are automatically assigned to the right government officer based on your area\'s pin code.')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center relative transition-transform hover:-translate-y-2 duration-300 z-10">
              <div className="bg-[#138808] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">3</div>
              <h3 className="text-xl font-semibold mb-3 text-[#138808]">{t('home.step3.title', 'Track & Resolve')}</h3>
              <p className="text-gray-600">
                {t('home.step3.description', 'Track your complaint\'s progress using the unique ID and provide feedback once resolved.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#0C2D83]/5 relative">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-[#FF9933] font-medium">{t('home.advantages', 'Advantages')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900">{t('home.benefits', 'Key Benefits')}</h2>
            <div className="w-24 h-1 bg-[#138808] mx-auto mt-6"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-[#FF9933]">
              <div className="w-14 h-14 bg-[#FF9933]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#FF9933]">{t('home.benefit1.title', 'Transparency')}</h3>
              <p className="text-gray-600">{t('home.benefit1.description', 'Complete visibility into complaint status and resolution process.')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-[#138808]">
              <div className="w-14 h-14 bg-[#138808]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#138808]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#138808]">{t('home.benefit2.title', 'Efficiency')}</h3>
              <p className="text-gray-600">{t('home.benefit2.description', 'Automated assignment to officers for faster resolution.')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-[#0C2D83]">
              <div className="w-14 h-14 bg-[#0C2D83]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0C2D83]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#0C2D83]">{t('home.benefit3.title', 'Accountability')}</h3>
              <p className="text-gray-600">{t('home.benefit3.description', 'Officers are responsible for complaints assigned to them.')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-gray-400">
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">{t('home.benefit4.title', 'Feedback')}</h3>
              <p className="text-gray-600">{t('home.benefit4.description', 'Rate and provide feedback on resolved complaints.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0C2D83] to-[#154DB8] text-white relative overflow-hidden">
        {/* Indian flag-inspired accent elements */}
        <div className="absolute left-0 top-0 w-32 h-16 bg-[#FF9933]/20 rounded-br-full"></div>
        <div className="absolute right-0 bottom-0 w-32 h-16 bg-[#138808]/20 rounded-tl-full"></div>
        
        <div className="container text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.cta.title', 'Ready to Report an Issue?')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
            {t('home.cta.description', 'Join our platform and help improve your community by reporting issues that need attention.')}
          </p>
          
          {isAuthenticated ? (
            <>
              {isCitizen ? (
                <Link to="/complaints/new" className="btn btn-accent px-8 py-3 shadow-lg">
                  {t('home.fileComplaint', 'File a Complaint')}
                </Link>
              ) : user?.role === 'officer' ? (
                <Link to="/officer" className="btn btn-accent px-8 py-3 shadow-lg">
                  {t('home.viewDashboard', 'View Your Dashboard')}
                </Link>
              ) : null}
            </>
          ) : (
            <Link to="/register" className="btn btn-accent px-8 py-3 shadow-lg">
              {t('home.getStarted', 'Get Started Now')}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home; 