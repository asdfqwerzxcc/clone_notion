"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { XIcon, EditIcon, SaveIcon } from "lucide-react";
import { TaskWithStatus, EditModeState } from "../_types/Task";

interface NotepadViewProps {
  allTasks: TaskWithStatus[];
  selectedNote: number | null;
  setSelectedNote: (id: number | null) => void;
  editMode: EditModeState | null;
  editMemo: string;
  setEditMemo: (memo: string) => void;
  moveTask: (
    id: number,
    fromList: string,
    toList: "todo" | "progress" | "completed"
  ) => void;
  deleteTask: (id: number, list: string) => void;
  startEditMemo: (id: number, list: string) => void;
  saveMemo: () => void;
  changePriority: (
    id: number,
    list: string,
    priority: "low" | "medium" | "high"
  ) => void;
}

export default function NotepadView({
  allTasks,
  selectedNote,
  setSelectedNote,
  editMode,
  editMemo,
  setEditMemo,
  moveTask,
  deleteTask,
  startEditMemo,
  saveMemo,
  changePriority,
}: NotepadViewProps) {
  const currentTask = allTasks.find((task) => task.id === selectedNote);

  const changeNoteStatus = (
    id: number,
    newStatus: "todo" | "progress" | "completed"
  ) => {
    const task = allTasks.find((t) => t.id === id);
    if (task && task.status !== newStatus) moveTask(id, task.status, newStatus);
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow h-full overflow-y-auto transition-colors duration-300">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 p-2 rounded-lg mb-4">
          <h2 className="text-xl font-semibold text-white">Note List</h2>
        </div>
        {allTasks.length === 0 ? (
          <motion.p
            className="text-gray-500 dark:text-gray-400 text-center italic py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            No notes
          </motion.p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {allTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  onClick={() => setSelectedNote(task.id)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedNote === task.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-700 dark:to-indigo-700 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{task.text}</span>
                    <div
                      className="text-xs px-2 py-1 rounded-full bg-opacity-90 whitespace-nowrap ml-2"
                      style={{
                        backgroundColor:
                          task.status === "todo"
                            ? "rgb(239 68 68 / 0.9)"
                            : task.status === "progress"
                              ? "rgb(59 130 246 / 0.9)"
                              : "rgb(34 197 94 / 0.9)",
                        color: "white",
                      }}
                    >
                      {task.status === "todo"
                        ? "Todo"
                        : task.status === "progress"
                          ? "In Progress"
                          : "Completed"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <motion.div
        className="md:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {!currentTask ? (
          <div className="flex justify-center items-center h-full">
            <motion.p
              className="text-gray-500 dark:text-gray-400 text-center italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Select a note or add a new note
            </motion.p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {currentTask.text}
              </h2>
              <div className="flex space-x-2">
                <select
                  value={currentTask.status}
                  onChange={(e) =>
                    changeNoteStatus(
                      currentTask.id,
                      e.target.value as "todo" | "progress" | "completed"
                    )
                  }
                  className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <option value="todo">Todo</option>
                  <option value="progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={currentTask.priority}
                  onChange={(e) =>
                    changePriority(
                      currentTask.id,
                      currentTask.status,
                      e.target.value as "low" | "medium" | "high"
                    )
                  }
                  className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <motion.button
                  onClick={() => deleteTask(currentTask.id, currentTask.status)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <XIcon size={14} className="mr-1" />
                  Delete
                </motion.button>
              </div>
            </div>
            <div className="mt-4">
              {editMode && editMode.id === currentTask.id ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 font-mono transition-colors duration-200"
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    rows={15}
                    placeholder="Enter your notes here..."
                  />
                  <div className="flex justify-end">
                    <motion.button
                      onClick={saveMemo}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SaveIcon size={14} className="mr-1" />
                      Save Notes
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[300px] text-gray-800 dark:text-gray-200 transition-colors duration-200">
                    {currentTask.memo ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{currentTask.memo}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 italic">
                        No notes yet. Click &apos;Edit Notes&apos; to add some.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        Created:{" "}
                        {new Date(currentTask.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <motion.button
                      onClick={() =>
                        startEditMemo(currentTask.id, currentTask.status)
                      }
                      className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <EditIcon size={14} className="mr-1" />
                      Edit Notes
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
