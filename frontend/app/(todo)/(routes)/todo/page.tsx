"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
  LayoutIcon,
  FileTextIcon,
  StarIcon,
  AwardIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import confetti from "canvas-confetti";
import React from "react";

import Clock from "../../_components/Clock";
import InputNewTask from "../../_components/Addinput";
import TaskList from "../../_components/TaskList";
import NotepadView from "../../_components/NotepadView";

import {
  TodoLists,
  TaskWithStatus,
  ViewMode,
  EditModeState,
} from "../../_types/Task";

export default function Home() {
  // State Declarations
  const [mounted, setMounted] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<EditModeState | null>(null);
  const [editMemo, setEditMemo] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [todos, setTodos] = useState<TodoLists>({
    todo: [],
    progress: [],
    completed: [],
  });
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [allTasks, setAllTasks] = useState<TaskWithStatus[]>([]);
  const [showCompletionEffect, setShowCompletionEffect] =
    useState<boolean>(false);

  const completedCount = useRef<number>(0);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Load Initial Data
  useEffect(() => {
    setMounted(true);
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    const savedViewMode = localStorage.getItem("viewMode");
    if (savedViewMode === "kanban" || savedViewMode === "notepad")
      setViewMode(savedViewMode);
    const savedCount = localStorage.getItem("completedCount");
    if (savedCount) completedCount.current = parseInt(savedCount);
  }, []);

  // Sync Todos and LocalStorage
  useEffect(() => {
    if (!mounted) return;

    const combined: TaskWithStatus[] = [
      ...todos.todo.map((task) => ({ ...task, status: "todo" as "todo" })),
      ...todos.progress.map((task) => ({
        ...task,
        status: "progress" as "progress",
      })),
      ...todos.completed.map((task) => ({
        ...task,
        status: "completed" as "completed",
      })),
    ];

    setAllTasks(combined);
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos, mounted]);

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const toggleViewMode = () => {
    const newMode: ViewMode = viewMode === "kanban" ? "notepad" : "kanban";
    setViewMode(newMode);
    localStorage.setItem("viewMode", newMode);
  };

  const moveTask = (
    id: number,
    fromList: string,
    toList: "todo" | "progress" | "completed"
  ) => {
    const task = todos[fromList as keyof TodoLists].find((t) => t.id === id);
    console.log(todos);
    if (!task) return;

    setTodos((prev) => ({
      ...prev,
      [fromList]: prev[fromList as keyof TodoLists].filter((t) => t.id !== id),
      [toList]: [...prev[toList], task],
    }));

    if (toList === "completed" && fromList !== "completed") {
      setShowCompletionEffect(true);
      triggerConfetti();
      completedCount.current += 1;
      localStorage.setItem("completedCount", completedCount.current.toString());
      setTimeout(() => setShowCompletionEffect(false), 2000);
    }
  };

  const deleteTask = (id: number, list: string) => {
    setTodos((prev) => ({
      ...prev,
      [list]: prev[list as keyof TodoLists].filter((t) => t.id !== id),
    }));
    if (selectedNote === id) {
      const remainingTasks = [
        ...todos.todo,
        ...todos.progress,
        ...todos.completed,
      ].filter((t) => t.id !== id);
      setSelectedNote(remainingTasks.length > 0 ? remainingTasks[0].id : null);
    }
  };

  const toggleExpand = (id: number, list: string) => {
    setTodos((prev) => {
      const newTodos = {
        ...prev,
        [list]: prev[list as keyof TodoLists].map((t) =>
          t.id === id ? { ...t, expanded: !t.expanded } : t
        ),
      };
      return newTodos;
    });
  };

  const startEditMemo = (id: number, list: string) => {
    const task = todos[list as keyof TodoLists].find((t) => t.id === id);
    if (task) {
      setEditMode({ id, list });
      setEditMemo(task.memo);
    }
  };

  const saveMemo = () => {
    if (!editMode) return;
    setTodos((prev) => ({
      ...prev,
      [editMode.list]: prev[editMode.list as keyof TodoLists].map((t) =>
        t.id === editMode.id ? { ...t, memo: editMemo } : t
      ),
    }));
    setEditMode(null);
  };

  const changePriority = (
    id: number,
    list: string,
    priority: "low" | "medium" | "high"
  ) => {
    setTodos((prev) => ({
      ...prev,
      [list]: prev[list as keyof TodoLists].map((t) =>
        t.id === id ? { ...t, priority } : t
      ),
    }));
  };

  const sortTasks = (list: string, by: "priority" | "date") => {
    setTodos((prev) => ({
      ...prev,
      [list]: [...prev[list as keyof TodoLists]].sort((a, b) =>
        by === "priority"
          ? { low: 0, medium: 1, high: 2 }[b.priority] -
            { low: 0, medium: 1, high: 2 }[a.priority]
          : b.createdAt - a.createdAt
      ),
    }));
  };

  // Drag and Drop Handlers
  const handleDragStart = (
    e: React.DragEvent,
    id: number,
    fromList: string
  ) => {
    e.dataTransfer.setData("taskId", id.toString());
    e.dataTransfer.setData("fromList", fromList);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (
    e: React.DragEvent,
    toList: "todo" | "progress" | "completed"
  ) => {
    e.preventDefault();
    console.log("drop", toList);
    const id = parseInt(e.dataTransfer.getData("taskId"));
    const fromList = e.dataTransfer.getData("fromList");

    if (fromList !== toList) moveTask(id, fromList, toList);
  };

  // Animation Props
  const toolbarProps = useSpring({
    opacity: 1,
    y: 0,
    from: { opacity: 0, y: -20 },
    config: { tension: 280, friction: 20 },
  });

  if (!mounted) return null;

  // Render
  return (
    <div
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300`}
    >
      <Head>
        <title>Advanced Todo App</title>
        <meta name="description" content="Advanced Todo App with animations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence>
          {showCompletionEffect && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="bg-green-500 text-white px-8 py-4 rounded-lg shadow-lg flex items-center"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <AwardIcon size={24} className="mr-2" />
                <span className="text-xl font-bold">
                  Awesome! Task completed!
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <animated.div
          style={toolbarProps}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-300"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mr-2">
              Super Todo
            </h1>
            <Clock />
          </div>
          <div className="flex space-x-2">
            <motion.button
              onClick={toggleViewMode}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewMode === "kanban" ? (
                <>
                  <FileTextIcon size={16} className="mr-1" />
                  Notepad View
                </>
              ) : (
                <>
                  <LayoutIcon size={16} className="mr-1" />
                  Kanban View
                </>
              )}
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              <StarIcon size={16} className="mr-1" />
              <span>{completedCount.current} Completed</span>
            </motion.div>
          </div>
        </animated.div>
        <InputNewTask
          setTodos={setTodos}
          viewMode={viewMode}
          setSelectedNote={setSelectedNote}
        />{" "}
        <div className="space-y-8">
          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaskList
                title="To Do"
                list="todo"
                tasks={todos.todo}
                emptyMessage="No tasks to do"
                dropAreaRef={dropAreaRef}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                sortTasks={sortTasks}
                moveTask={moveTask}
                toggleExpand={toggleExpand}
                editMode={editMode}
                editMemo={editMemo}
                setEditMemo={setEditMemo}
                saveMemo={saveMemo}
                changePriority={changePriority}
                startEditMemo={startEditMemo}
                deleteTask={deleteTask}
                handleDragStart={handleDragStart}
              />
              <TaskList
                title="In Progress"
                list="progress"
                tasks={todos.progress}
                emptyMessage="No tasks in progress"
                dropAreaRef={dropAreaRef}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                sortTasks={sortTasks}
                moveTask={moveTask}
                toggleExpand={toggleExpand}
                editMode={editMode}
                editMemo={editMemo}
                setEditMemo={setEditMemo}
                saveMemo={saveMemo}
                changePriority={changePriority}
                startEditMemo={startEditMemo}
                deleteTask={deleteTask}
                handleDragStart={handleDragStart}
              />
              <TaskList
                title="Completed"
                list="completed"
                tasks={todos.completed}
                emptyMessage="No completed tasks"
                dropAreaRef={dropAreaRef}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                sortTasks={sortTasks}
                moveTask={moveTask}
                toggleExpand={toggleExpand}
                editMode={editMode}
                editMemo={editMemo}
                setEditMemo={setEditMemo}
                saveMemo={saveMemo}
                changePriority={changePriority}
                startEditMemo={startEditMemo}
                deleteTask={deleteTask}
                handleDragStart={handleDragStart}
              />
            </div>
          ) : (
            <NotepadView
              allTasks={allTasks}
              selectedNote={selectedNote}
              setSelectedNote={setSelectedNote}
              editMode={editMode}
              editMemo={editMemo}
              setEditMemo={setEditMemo}
              moveTask={moveTask}
              deleteTask={deleteTask}
              startEditMemo={startEditMemo}
              saveMemo={saveMemo}
              changePriority={changePriority}
            />
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
        <p>Advanced Todo App - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
