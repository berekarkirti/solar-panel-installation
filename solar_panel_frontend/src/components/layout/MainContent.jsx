const MainContent = ({ children, sidebarOpen }) => {
  return (
    <main
      className={`
        pt-16 min-h-screen bg-app transition-smooth
        ${sidebarOpen ? 'ml-sidebar' : 'ml-sidebar-collapsed'}
      `}
    >
      <div className="p-8 animate-page-enter">
        {children}
      </div>
    </main>
  );
};

export default MainContent;