import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState([]);
  const [status, setStatus] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskTypes, setTaskTypes] = useState([]);

  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      let url = "/getsubmissions/dashboard";

      if (user?.role === "staff") {
        url = "/getsubmissions/all";

        const params = new URLSearchParams();

        if (schoolId) params.append("schoolId", schoolId);
        if (status) params.append("status", status);
        if (taskType) params.append("taskType", taskType);

        if ([...params].length > 0) {
          url += `?${params.toString()}`;
        }
      }

      const res = await API.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
  try {
    await API.put(`/getsubmissions/${id}/status`, { status });

    // instant UI update
    setTasks((prev) =>
      prev.map((task) =>
        task._id === id ? { ...task, status } : task
      )
    );
  } catch (err) {
    console.error(err);
  }
};

  // 🔥 fetch schools for staff
  useEffect(() => {
    if (user?.role === "staff") {
      API.get("/getsubmissions/schools")
        .then((res) => setSchools(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "staff") {
      API.get("/getsubmissions/task-types")
        .then((res) => setTaskTypes(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [schoolId, status, taskType]);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* 🎯 STAFF FILTER */}
      {user?.role === "staff" && (
        <div className="flex flex-wrap gap-3">

          {/* SCHOOL FILTER */}
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className="p-2 rounded border"
          >
            <option value="">All Schools</option>
            {schools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* STATUS FILTER */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 rounded border"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="working">Working</option>
            <option value="done">Done</option>
          </select>

          {/* TASK TYPE FILTER */}
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            className="p-2 rounded border"
          >
            <option value="">All Task Types</option>

            {taskTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>

        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-4 shadow"
            >
              <h2 className="font-semibold">Task: {task.taskType}</h2>

              {/* 👇 show school name for staff */}
              {user?.role === "staff" && task.schoolId && (
                <p className="text-sm text-gray-600">
                  School: {task.schoolId.name}
                </p>
              )}

              <span className={`text-xs px-2 py-1 rounded 
                ${task.status === "done" 
                  ? "bg-green-600" 
                  : task.status === "working"
                  ? "bg-blue-600"
                  : "bg-yellow-600"}
              `}> {(task.status).toUpperCase()}</span>

              {user?.role === "staff" && (
              <select
                value={task.status}
                onChange={(e) => updateStatus(task._id, e.target.value)}
                className="text-xs p-1 rounded border bg-white/20 backdrop-blur"
              >
                <option value="pending">Pending</option>
                <option value="working">Working</option>
                <option value="done">Done</option>
              </select>
            )}

              <p className="text-sm text-gray-600">
                Message: {task.message || "No message"}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Dashboard;