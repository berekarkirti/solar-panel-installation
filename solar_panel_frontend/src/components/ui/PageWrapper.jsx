const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-animated flex items-center justify-center px-4 py-12 animate-fade-in">
      {children}
    </div>
  );
};

export default PageWrapper;