import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="min-h-[400px] flex flex-col space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
      </div>
      
      {/* Quick add form skeleton */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
            <div className="h-10 w-40 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
          </div>
        </div>
      </motion.div>
      
      {/* Task list skeletons */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-5 h-5 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse mt-1" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse w-64" />
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse" />
                    <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse w-96" />
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Loading shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        .animate-pulse {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 20%, #f1f5f9 40%, #f1f5f9 100%);
          background-size: 200px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;