"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { TaskListProps } from "../_types/Task";
import TaskItem from "./TaskItem";
import { LIST_COLORS } from "../_constants/constant";

// TaskList Component
const TaskList = React.memo(
  ({
    title,
    list,
    tasks,
    emptyMessage,
    dropAreaRef,
    handleDragOver,
    handleDrop,
    sortTasks,
    moveTask,
    toggleExpand,
    editMode,
    editMemo,
    setEditMemo,
    saveMemo,
    changePriority,
    startEditMemo,
    deleteTask,
    handleDragStart,
  }: TaskListProps & {
    dropAreaRef: React.RefObject<HTMLDivElement>;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (
      e: React.DragEvent,
      list: "todo" | "progress" | "completed"
    ) => void;
    sortTasks: (list: string, by: "priority" | "date") => void;
    moveTask: (
      id: number,
      fromList: string,
      toList: "todo" | "progress" | "completed"
    ) => void;
    toggleExpand: (id: number, list: string) => void;
    editMode: any;
    editMemo: string;
    setEditMemo: React.Dispatch<React.SetStateAction<string>>;
    saveMemo: () => void;
    changePriority: (
      id: number,
      list: string,
      priority: "low" | "medium" | "high"
    ) => void;
    startEditMemo: (id: number, list: string) => void;
    deleteTask: (id: number, list: string) => void;
    handleDragStart: (e: React.DragEvent, id: number, fromList: string) => void;
  }) => (
    <motion.div
      className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md transition-colors duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ref={list === "todo" ? dropAreaRef : undefined}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, list)}
    >
      <div
        className={`rounded-t-lg p-2 mb-3 bg-gradient-to-r ${LIST_COLORS[list]}`}
      >
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {tasks.length} item{tasks.length !== 1 ? "s" : ""}
        </span>
        <div className="flex space-x-1">
          <button
            onClick={() => sortTasks(list, "priority")}
            className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Sort by Priority
          </button>
          <button
            onClick={() => sortTasks(list, "date")}
            className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Sort by Date
          </button>
        </div>
      </div>
      <div className="min-h-[100px]">
        {tasks.length === 0 ? (
          <motion.p
            className="text-gray-500 dark:text-gray-400 text-center italic py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {emptyMessage}
          </motion.p>
        ) : (
          <AnimatePresence>
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                list={list}
                index={index}
                handleDragStart={handleDragStart}
                moveTask={moveTask}
                toggleExpand={toggleExpand}
                editMode={editMode}
                editMemo={editMemo}
                setEditMemo={setEditMemo}
                saveMemo={saveMemo}
                changePriority={changePriority}
                startEditMemo={startEditMemo}
                deleteTask={deleteTask}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  ),
  (prev, next) =>
    prev.title === next.title &&
    prev.list === next.list &&
    prev.emptyMessage === next.emptyMessage &&
    prev.tasks.length === next.tasks.length &&
    prev.tasks === next.tasks &&
    prev.editMode === next.editMode &&
    prev.editMemo === next.editMemo &&
    prev.dropAreaRef === next.dropAreaRef &&
    prev.tasks.every((task, i) => {
      const nextTask = next.tasks[i];
      return (
        task.id === nextTask?.id &&
        task.text === nextTask?.text &&
        task.memo === nextTask?.memo &&
        task.expanded === nextTask?.expanded && // expanded 추가
        task.priority === nextTask?.priority
      );
    })
);
TaskList.displayName = "TaskList";

export default TaskList;
