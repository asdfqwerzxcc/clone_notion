"use client";

import { useEffect, useState } from "react";

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString()),
      1000
    );
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="text-sm text-gray-500 dark:text-gray-400">
      {currentTime}
    </span>
  );
};

export default Clock;
