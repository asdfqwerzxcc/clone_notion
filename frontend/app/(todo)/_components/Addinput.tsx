"use client";

import { animated, useSpring } from "@react-spring/web";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { TodoLists, ViewMode } from "../_types/Task";

// Add necessary interface/type definitions
interface InputNewTaskProps {
  setTodos: React.Dispatch<React.SetStateAction<TodoLists>>;
  viewMode: ViewMode;
  setSelectedNote: React.Dispatch<React.SetStateAction<number | null>>;
}

const InputNewTask: React.FC<InputNewTaskProps> = ({
  setTodos,
  viewMode,
  setSelectedNote,
}) => {
  const [newTask, setNewTask] = useState<string>("");
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">(
    "medium"
  );

  const addTask = () => {
    if (!newTask.trim()) return;
    const newId = Date.now();
    setTodos((prev) => ({
      ...prev,
      todo: [
        ...prev.todo,
        {
          id: newId,
          text: newTask,
          memo: "",
          expanded: false,
          markdownEnabled: true,
          priority: taskPriority,
          createdAt: newId,
        },
      ],
    }));
    setNewTask("");
    setTaskPriority("medium");
    if (viewMode === "notepad") setSelectedNote(newId);
    inputRef.current?.focus();
  };

  const inputAnimProps = useSpring({
    boxShadow: isInputFocused
      ? "0 0 0 3px rgba(59, 130, 246, 0.5)"
      : "0 1px 3px rgba(0,0,0,0.1)",
    transform: isInputFocused ? "scale(1.01)" : "scale(1)",
    config: { tension: 280, friction: 20 },
  });

  return (
    <animated.div
      style={inputAnimProps}
      className="flex mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-300"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Add a new task..."
        className="flex-grow px-4 py-2 mr-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && addTask()}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
      />
      <div className="flex space-x-2 items-center">
        <select
          value={taskPriority}
          onChange={(e) =>
            setTaskPriority(e.target.value as "low" | "medium" | "high")
          }
          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <motion.button
          onClick={addTask}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!newTask.trim()}
        >
          <PlusIcon size={16} className="mr-1" />
          Add Task
        </motion.button>
      </div>
    </animated.div>
  );
};

export default InputNewTask;
