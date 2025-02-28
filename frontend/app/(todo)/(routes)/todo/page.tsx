"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  XIcon,
  LayoutIcon,
  FileTextIcon,
  SaveIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  AwardIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import confetti from "canvas-confetti";
import React from "react";

// Type definitions
interface Task {
  id: number;
  text: string;
  memo: string;
  expanded: boolean;
  markdownEnabled: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

interface TaskWithStatus extends Task {
  status: "todo" | "progress" | "completed";
}

interface TodoLists {
  todo: Task[];
  progress: Task[];
  completed: Task[];
}

interface EditModeState {
  id: number;
  list: string;
}

interface TaskItemProps {
  task: Task;
  list: string;
  index: number;
}

interface TaskListProps {
  title: string;
  list: "todo" | "progress" | "completed";
  tasks: Task[];
  emptyMessage: string;
}

type ViewMode = "kanban" | "notepad";

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>("");
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
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const completedCount = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    setMounted(true);
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    const savedViewMode = localStorage.getItem("viewMode");
    if (
      savedViewMode &&
      (savedViewMode === "kanban" || savedViewMode === "notepad")
    ) {
      setViewMode(savedViewMode);
    }

    // Completed count 복원
    const savedCount = localStorage.getItem("completedCount");
    if (savedCount) {
      completedCount.current = parseInt(savedCount);
    }
  }, []);

  useEffect(() => {
    const combined: TaskWithStatus[] = [
      ...todos.todo.map((task) => ({ ...task, status: "todo" as const })),
      ...todos.progress.map((task) => ({
        ...task,
        status: "progress" as const,
      })),
      ...todos.completed.map((task) => ({
        ...task,
        status: "completed" as const,
      })),
    ];
    setAllTasks(combined);
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // selectedNote 업데이트
  useEffect(() => {
    if (allTasks.length > 0) {
      if (!selectedNote || !allTasks.find((task) => task.id === selectedNote)) {
        setSelectedNote(allTasks[0].id);
      }
    } else {
      setSelectedNote(null);
    }
  }, [allTasks, selectedNote]);

  function Clock() {
    const [currentTime, setCurrentTime] = useState(
      new Date().toLocaleTimeString()
    );
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearInterval(interval);
    }, []);
    return <span className="text-sm text-gray-500">{currentTime}</span>;
  }

  // confetti 효과 함수
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // 상단 툴바 애니메이션
  const toolbarProps = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 20 },
  });

  // 입력 포커스 애니메이션
  const inputAnimProps = useSpring({
    boxShadow: isInputFocused
      ? "0 0 0 3px rgba(59, 130, 246, 0.5)"
      : "0 1px 3px rgba(0,0,0,0.1)",
    transform: isInputFocused ? "scale(1.01)" : "scale(1)",
    config: { tension: 280, friction: 20 },
  });

  // 마운트 전 렌더링 방지
  if (!mounted) return null;

  // 할일 추가
  const addTask = (): void => {
    if (newTask.trim() === "") return;

    const newId = Date.now();
    const updatedTodos = {
      ...todos,
      todo: [
        ...todos.todo,
        {
          id: newId,
          text: newTask,
          memo: "",
          expanded: false,
          markdownEnabled: true,
          priority: taskPriority,
          createdAt: Date.now(),
        },
      ],
    };

    setTodos(updatedTodos);
    setNewTask("");
    setTaskPriority("medium");

    // 애니메이션 효과
    const element = document.getElementById("task-input");
    if (element) {
      element.classList.add("add-task-animation");
      setTimeout(() => element.classList.remove("add-task-animation"), 500);
    }

    // 메모장 모드에서 새로 추가된 항목 선택
    if (viewMode === "notepad") {
      setSelectedNote(newId);
    }

    // 인풋에 포커스 되돌리기
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 할일 이동 (상태 변경)
  const moveTask = (
    id: number,
    fromList: string,
    toList: "todo" | "progress" | "completed"
  ): void => {
    const task = todos[fromList as keyof TodoLists].find(
      (task) => task.id === id
    );
    if (!task) return;

    const updatedTodos = {
      ...todos,
      [fromList]: todos[fromList as keyof TodoLists].filter(
        (task) => task.id !== id
      ),
      [toList]: [...todos[toList], task],
    };

    setTodos(updatedTodos);

    // 작업이 완료 상태로 이동할 때 효과 트리거
    if (toList === "completed" && fromList !== "completed") {
      setShowCompletionEffect(true);
      triggerConfetti();
      completedCount.current += 1;
      localStorage.setItem("completedCount", completedCount.current.toString());

      // 효과 종료
      setTimeout(() => setShowCompletionEffect(false), 2000);
    }
  };

  // 할일 삭제
  const deleteTask = (id: number, list: string): void => {
    const updatedTodos = {
      ...todos,
      [list]: todos[list as keyof TodoLists].filter((task) => task.id !== id),
    };

    setTodos(updatedTodos);

    // 메모장 모드에서 선택된 항목 삭제 처리
    if (selectedNote === id) {
      const allTasksExceptDeleted = [
        ...updatedTodos.todo,
        ...updatedTodos.progress,
        ...updatedTodos.completed,
      ];

      if (allTasksExceptDeleted.length > 0) {
        setSelectedNote(allTasksExceptDeleted[0].id);
      } else {
        setSelectedNote(null);
      }
    }
  };

  // 메모 표시 토글
  const toggleExpand = (id: number, list: string): void => {
    const updatedTodos = {
      ...todos,
      [list]: todos[list as keyof TodoLists].map((task) =>
        task.id === id ? { ...task, expanded: !task.expanded } : task
      ),
    };

    setTodos(updatedTodos);
  };

  // 보기 모드 전환
  const toggleViewMode = (): void => {
    const newMode: ViewMode = viewMode === "kanban" ? "notepad" : "kanban";
    setViewMode(newMode);
    localStorage.setItem("viewMode", newMode);
  };

  // 메모 편집 모드 시작
  const startEditMemo = (id: number, list: string): void => {
    const task = todos[list as keyof TodoLists].find((task) => task.id === id);
    if (task) {
      setEditMode({ id, list });
      setEditMemo(task.memo);
    }
  };

  // 노트패드 메모 편집 시작
  const startEditNotepadMemo = (id: number): void => {
    const task = allTasks.find((task) => task.id === id);
    if (task) {
      setEditMode({ id, list: task.status });
      setEditMemo(task.memo);
    }
  };

  // 메모 저장
  const saveMemo = (): void => {
    if (!editMode) return;

    const updatedTodos = {
      ...todos,
      [editMode.list]: todos[editMode.list as keyof TodoLists].map((task) =>
        task.id === editMode.id ? { ...task, memo: editMemo } : task
      ),
    };

    setTodos(updatedTodos);
    setEditMode(null);
  };

  // 노트패드 모드에서 상태 변경
  const changeNoteStatus = (
    id: number,
    newStatus: "todo" | "progress" | "completed"
  ): void => {
    const task = allTasks.find((task) => task.id === id);
    if (task && task.status !== newStatus) {
      moveTask(id, task.status, newStatus);
    }
  };

  // 우선순위 변경
  const changePriority = (
    id: number,
    list: string,
    priority: "low" | "medium" | "high"
  ): void => {
    const updatedTodos = {
      ...todos,
      [list]: todos[list as keyof TodoLists].map((task) =>
        task.id === id ? { ...task, priority } : task
      ),
    };

    setTodos(updatedTodos);
  };

  // 작업 정렬
  const sortTasks = (list: string, by: "priority" | "date"): void => {
    const updatedTodos = {
      ...todos,
      [list]: [...todos[list as keyof TodoLists]].sort((a, b) => {
        if (by === "priority") {
          const priorityWeight = { low: 0, medium: 1, high: 2 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        } else {
          return b.createdAt - a.createdAt;
        }
      }),
    };

    setTodos(updatedTodos);
  };

  // 드래그 앤 드롭 로직
  const handleDragStart = (
    e: React.DragEvent,
    id: number,
    fromList: string
  ) => {
    e.dataTransfer.setData("taskId", id.toString());
    e.dataTransfer.setData("fromList", fromList);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    toList: "todo" | "progress" | "completed"
  ) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("taskId"));
    const fromList = e.dataTransfer.getData("fromList");

    if (fromList !== toList) {
      moveTask(id, fromList, toList);
    }
  };

  // 작업 항목 컴포넌트
  const TaskItem = React.memo(
    function TaskItem({ task, list, index }: TaskItemProps): JSX.Element {
      const dragControls = {
        initial: { scale: 1 },
        whileHover: { scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" },
        whileTap: { scale: 0.98 },
      };

      const priorityColors = {
        high: "bg-red-100",
        medium: "bg-yellow-100",
        low: "bg-blue-100",
      };

      const priorityBadgeColors = {
        high: "bg-red-500",
        medium: "bg-yellow-500",
        low: "bg-blue-500",
      };

      const itemBorderStyle = `border-l-4 border-${task.priority === "high" ? "red" : task.priority === "medium" ? "yellow" : "blue"}-500`;

      return (
        <motion.div
          className={`p-3 mb-3 bg-white rounded-lg shadow-sm ${itemBorderStyle}`}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            layout: { duration: 0.2 },
            delay: index * 0.05,
          }}
          drag={false}
          dragConstraints={dropAreaRef}
          whileHover={dragControls.whileHover}
          whileTap={dragControls.whileTap}
          draggable
          onDragStart={(e) =>
            handleDragStart(e as unknown as React.DragEvent, task.id, list)
          }
          style={{ borderRadius: 8 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span
                className={`w-2 h-2 rounded-full ${priorityBadgeColors[task.priority]} mr-2`}
              ></span>
              <span className="text-gray-800 font-medium">{task.text}</span>
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
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
                className="mt-2 pt-2 border-t border-gray-200"
              >
                {editMode && editMode.id === task.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full p-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono transition-colors duration-200"
                      value={editMemo}
                      onChange={(e) => setEditMemo(e.target.value)}
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
                    <div className="p-3 text-sm bg-gray-50 rounded-lg text-gray-700 min-h-[80px] whitespace-pre-wrap transition-colors duration-200">
                      {task.memo ? (
                        <ReactMarkdown>{task.memo}</ReactMarkdown>
                      ) : (
                        <span className="text-gray-400 italic">No memo</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <div className="flex space-x-2">
                        <select
                          value={task.priority}
                          onChange={(e) =>
                            changePriority(
                              task.id,
                              list,
                              e.target.value as "low" | "medium" | "high"
                            )
                          }
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded transition-colors duration-200"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <motion.button
                        onClick={() => startEditMemo(task.id, list)}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition flex items-center"
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

          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
            <span className="text-xs text-gray-500">
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
    (prevProps, nextProps) => {
      return (
        prevProps.task.id === nextProps.task.id &&
        prevProps.task.text === nextProps.task.text &&
        prevProps.task.memo === nextProps.task.memo &&
        prevProps.task.expanded === nextProps.task.expanded &&
        prevProps.task.priority === nextProps.task.priority &&
        prevProps.list === nextProps.list &&
        prevProps.index === nextProps.index
      );
    }
  );

  // 작업 목록 컴포넌트
  const TaskList = React.memo(
    function TaskList({
      title,
      list,
      tasks,
      emptyMessage,
    }: TaskListProps): JSX.Element {
      const listColors = {
        todo: "from-red-500 to-pink-500",
        progress: "from-blue-500 to-indigo-500",
        completed: "from-green-500 to-emerald-500",
      };

      return (
        <motion.div
          className="bg-gray-200 p-4 rounded-lg shadow-md transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          ref={list === "todo" ? dropAreaRef : undefined}
          onDragOver={handleDragOver}
          onDrop={(e) =>
            handleDrop(e, list as "todo" | "progress" | "completed")
          }
        >
          <div
            className={`rounded-t-lg p-2 mb-3 bg-gradient-to-r ${listColors[list as keyof typeof listColors]}`}
          >
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">
              {tasks.length} item{tasks.length !== 1 ? "s" : ""}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => sortTasks(list, "priority")}
                className="text-xs px-2 py-1 bg-gray-300 rounded text-gray-700 hover:bg-gray-400 transition-colors duration-200"
              >
                Sort by Priority
              </button>
              <button
                onClick={() => sortTasks(list, "date")}
                className="text-xs px-2 py-1 bg-gray-300 rounded text-gray-700 hover:bg-gray-400 transition-colors duration-200"
              >
                Sort by Date
              </button>
            </div>
          </div>
          <div className="min-h-[100px]">
            {tasks.length === 0 ? (
              <motion.p
                className="text-gray-500 text-center italic py-4 border-2 border-dashed border-gray-300 rounded-lg"
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
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      );
    },
    (prevProps, nextProps) => {
      return (
        prevProps.title === nextProps.title &&
        prevProps.list === nextProps.list &&
        prevProps.emptyMessage === nextProps.emptyMessage &&
        prevProps.tasks.length === nextProps.tasks.length &&
        prevProps.tasks.every(
          (task, index) => task.id === nextProps.tasks[index]?.id
        )
      );
    }
  );

  // 메모장 모드 컴포넌트
  const NotepadView = (): JSX.Element => {
    const currentTask = allTasks.find((task) => task.id === selectedNote);

    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 노트 목록 */}
        <div className="bg-gray-200 p-4 rounded-lg shadow h-full overflow-y-auto transition-colors duration-300">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mb-4">
            <h2 className="text-xl font-semibold text-white">Note List</h2>
          </div>
          {allTasks.length === 0 ? (
            <motion.p
              className="text-gray-500 text-center italic py-4"
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
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        : "bg-white text-gray-800 hover:bg-gray-100"
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

        {/* 노트 편집 영역 */}
        <motion.div
          className="md:col-span-3 bg-white p-4 rounded-lg shadow transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {!currentTask ? (
            <div className="flex justify-center items-center h-full">
              <motion.p
                className="text-gray-500 text-center italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Select a note or add a new note
              </motion.p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
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
                    className="px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
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
                    className="px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <motion.button
                    onClick={() =>
                      deleteTask(currentTask.id, currentTask.status)
                    }
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
                      className="w-full p-3 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-colors duration-200"
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
                    <div className="p-4 bg-gray-50 rounded-lg min-h-[300px] text-gray-800 transition-colors duration-200">
                      {currentTask.memo ? (
                        <div className="prose max-w-none">
                          <ReactMarkdown>{currentTask.memo}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">
                          No notes yet. Click &apos;Edit Notes&apos; to add
                          some.
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-3 text-sm text-gray-500">
                        <div>
                          Created:{" "}
                          {new Date(currentTask.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <motion.button
                        onClick={() => startEditNotepadMemo(currentTask.id)}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition flex items-center"
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
  };

  return (
    <div className="min-h-screen bg-gray-100 transition-colors duration-300">
      <Head>
        <title>Advanced Todo App</title>
        <meta name="description" content="Advanced Todo App with animations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* 완료 효과 */}
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

        {/* 헤더 */}
        <animated.div
          style={toolbarProps}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-4 rounded-lg shadow transition-colors duration-300"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 mr-2">
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

        {/* 새 할일 입력 */}
        <animated.div
          style={inputAnimProps}
          className="flex mb-8 bg-white p-4 rounded-lg shadow transition-colors duration-300"
          id="task-input"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Add a new task..."
            className="flex-grow px-4 py-2 mr-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
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
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
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
              disabled={newTask.trim() === ""}
            >
              <PlusIcon size={16} className="mr-1" />
              Add Task
            </motion.button>
          </div>
        </animated.div>

        {/* 내용 영역 */}
        <div className="space-y-8">
          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaskList
                title="To Do"
                list="todo"
                tasks={todos.todo}
                emptyMessage="No tasks to do"
              />
              <TaskList
                title="In Progress"
                list="progress"
                tasks={todos.progress}
                emptyMessage="No tasks in progress"
              />
              <TaskList
                title="Completed"
                list="completed"
                tasks={todos.completed}
                emptyMessage="No completed tasks"
              />
            </div>
          ) : (
            <NotepadView />
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm transition-colors duration-300">
        <p>Advanced Todo App - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
