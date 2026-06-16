const About = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section - Refined */}
        <section className="text-center py-20">
          <div className="inline-block mb-4 px-4 py-1 border border-black rounded-full text-sm font-medium">
            Next-Gen Assessment Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            About Quizy
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Quizy is a secure, lightweight online assessment platform designed
            to help educators create, deliver, and evaluate timed quizzes with
            ease. It provides tools for course management, question authoring,
            live monitoring, and result export to support academic and training
            use cases.
          </p>
        </section>

        {/* Mission Statement */}
        <section className="py-12 border-y border-black">
          <div className="max-w-4xl mx-auto text-center py-8">
            <p className="text-xl md:text-2xl text-gray-800 italic font-light leading-relaxed">
              "Empowering educators with intuitive tools and learners with seamless experiences — Quizy redefines online assessment through simplicity, security, and precision."
            </p>
          </div>
        </section>

        {/* Why Quizy - Three Column Feature */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Quizy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-black rounded-full">
                <span className="text-xl font-bold">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Optimized performance ensures smooth quiz-taking and real-time monitoring without lag or interruptions.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-black rounded-full">
                <span className="text-xl font-bold">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure by Design</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Role-based access, JWT authentication, and encrypted data ensure your assessments remain protected.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-black rounded-full">
                <span className="text-xl font-bold">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Actionable Insights</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Export detailed results and analytics to track performance trends and identify learning gaps.
              </p>
            </div>
          </div>
        </section>

        {/* For Instructors & Learners - Enhanced Cards */}
        <section className="py-12 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Instructor Card */}
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <div className="mb-6">
                <div className="w-14 h-14 border border-black rounded-full flex items-center justify-center mb-4 bg-white">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <h3 className="text-2xl font-bold">For Instructors</h3>
                <p className="text-gray-500 mt-2">Complete control over your assessments</p>
              </div>
              <div className="space-y-4">
                {[
                  "Author and organize quizzes by course or category",
                  "Configure timed assessments and attempt limits",
                  "Publish secure access codes for learners",
                  "Monitor live participation and real-time progress",
                  "Export detailed results for grading and records",
                  "Schedule availability windows and deadlines"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-black font-bold mt-0.5">→</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learner Card */}
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <div className="mb-6">
                <div className="w-14 h-14 border border-black rounded-full flex items-center justify-center mb-4 bg-white">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-2xl font-bold">For Learners</h3>
                <p className="text-gray-500 mt-2">Intuitive and stress-free experience</p>
              </div>
              <div className="space-y-4">
                {[
                  "Join assessments instantly using a secure code",
                  "Complete timed quizzes with auto-save functionality",
                  "Track progress through an interactive question palette",
                  "Review past attempts and performance analytics",
                  "Receive immediate results and feedback",
                  "Access assessments from any device, anywhere"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-black font-bold mt-0.5">→</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Key Capabilities Grid */}
        <section className="py-20 border-t border-gray-200">
          <h2 className="text-3xl font-bold text-center mb-4">Core Capabilities</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to conduct professional online assessments
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Multiple Question Types", desc: "MCQ, true/false, short answer, and more" },
              { title: "Real-time Monitoring", desc: "Track active participants and completion status" },
              { title: "Automated Grading", desc: "Instant results for objective questions" },
              { title: "Analytics Export", desc: "CSV/Excel reports for record keeping" }
            ].map((cap, idx) => (
              <div key={idx} className="border border-gray-200 p-6 rounded-lg text-center hover:border-black transition-colors">
                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold">{idx + 1}</span>
                </div>
                <h4 className="font-bold text-lg mb-2">{cap.title}</h4>
                <p className="text-gray-500 text-sm">{cap.desc}</p>
              </div>
            ))}
          </div>
        </section>

        
      </main>
    </div>
  );
};

export default About;