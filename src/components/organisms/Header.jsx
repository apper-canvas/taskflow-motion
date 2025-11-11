import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick, title = "All Tasks" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden p-2"
            >
              <ApperIcon name="Menu" size={20} />
            </Button>
            
            <div>
              <motion.h1 
                className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={title}
              >
                {title}
              </motion.h1>
              <p className="text-sm text-slate-500 mt-1">
                {formatDate(currentTime)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <ApperIcon name="Clock" size={16} />
              {currentTime.toLocaleTimeString("en-US", { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </div>
            
<Button variant="ghost" size="sm" className="p-2">
              <ApperIcon name="Settings" size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="p-2" onClick={() => {
              import("@/layouts/Root").then(({ useAuth }) => {
                const { logout } = useAuth();
                logout();
              });
            }}>
              <ApperIcon name="LogOut" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;