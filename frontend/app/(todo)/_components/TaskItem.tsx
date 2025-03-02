"use client";

import React, { useRef, useEffect } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { TaskItemProps } from "../_types/Task";
import { PRIORITY_COLORS } from "../_constants/constant";

const TaskItem = React.memo(
  ({
    task,
    list,
    index,
    handleDragStart,
    moveTask,
    toggleExpand,
    editMode,
    editMemo,
    setEditMemo,
    saveMemo,
    changePriority,
    startEditMemo,
    deleteTask,
  }: TaskItemProps) => {
    // 텍스트 필드 참조
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // 커서 위치 저장을 위한 ref
    const cursorPositionRef = useRef<{ start: number; end: number }>({
      start: 0,
      end: 0,
    });

    // 편집 모드에서 포커스와 커서 위치 복원
    useEffect(() => {
      if (editMode && editMode.id === task.id && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.focus();
        // 저장된 커서 위치로 복원
        textarea.setSelectionRange(
          cursorPositionRef.current.start,
          cursorPositionRef.current.end
        );
      }
    }, [editMode, task.id, editMemo]);

    // 텍스트 입력 시 커서 위치 저장 및 상태 업데이트
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      // 커서 위치 저장
      cursorPositionRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
      setEditMemo(textarea.value);
    };

    return (
      <motion.div
        className={`p-3 mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${PRIORITY_COLORS[task.priority].border}`}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ layout: { duration: 0.2 }, delay: index * 0.05 }}
        draggable={!(editMode && editMode.id === task.id)}
        onDragStart={(e) =>
          handleDragStart(e as unknown as React.DragEvent, task.id, list)
        }
        whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span
              className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority].badge} mr-2`}
            ></span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {task.text}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {list !== "completed" && (
              <button
                onClick={() => moveTask(task.id, list, "completed")}
                className="p-1 text-green-500 hover:text-green-600 transition-colors duration-200"
              >
                <CheckIcon size={16} />
              </button>
            )}
            {list === "todo" && (
              <button
                onClick={() => moveTask(task.id, list, "progress")}
                className="p-1 text-blue-500 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowRightIcon size={16} />
              </button>
            )}
            <button
              onClick={() => toggleExpand(task.id, list)}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
            >
              {task.expanded ? (
                <ChevronUpIcon size={16} />
              ) : (
                <ChevronDownIcon size={16} />
              )}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {task.expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600"
            >
              {editMode && editMode.id === task.id ? (
                <div className="space-y-2">
                  <textarea
                    ref={textareaRef}
                    className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-200 font-mono transition-colors duration-200"
                    value={editMemo}
                    onChange={handleChange} // 커서 위치 저장 및 텍스트 업데이트
                    rows={6}
                    placeholder="Enter your memo..."
                  />
                  <div className="flex justify-end">
                    <motion.button
                      onClick={saveMemo}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SaveIcon size={12} className="mr-1" />
                      Save
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 min-h-[80px] whitespace-pre-wrap transition-colors duration-200">
                    {task.memo ? (
                      <ReactMarkdown>{task.memo}</ReactMarkdown>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        No memo
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        changePriority(
                          task.id,
                          list,
                          e.target.value as "low" | "medium" | "high"
                        )
                      }
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <motion.button
                      onClick={() => startEditMemo(task.id, list)}
                      className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <EditIcon size={12} className="mr-1" />
                      Edit Memo
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
          <motion.button
            onClick={() => deleteTask(task.id, list)}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <XIcon size={12} className="mr-1" />
            Delete
          </motion.button>
        </div>
      </motion.div>
    );
  },
  (prev, next) =>
    prev.task.id === next.task.id &&
    prev.task.text === next.task.text &&
    prev.task.memo === next.task.memo &&
    prev.task.expanded === next.task.expanded &&
    prev.task.priority === next.task.priority &&
    prev.list === next.list &&
    prev.editMode === next.editMode &&
    prev.editMemo === next.editMemo &&
    prev.index === next.index
);

TaskItem.displayName = "TaskItem";
export default TaskItem;
